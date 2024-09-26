import { useCallback, useMemo, useState } from "react";
import { Label } from "./components/ui/label";
import { Input } from "./components/ui/input";
import DetectAI from "./components/detectAI";
import { Textarea } from "./components/ui/textarea";
import { Button } from "./components/ui/button";
import { useQuery } from "@tanstack/react-query";
import XMLToJSON from "xml-js";
import { JobFeed } from "./interfaces/rss";
import useAI from "./hooks/useAI";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";

let indexToggle = 1;
const toggleOptions = [
  "https://careers.recruitics.com",
  "https://jobs.thesteppingstonesgroup.com",
  "https://www.savatreecareers.com",
];

function App() {
  const [session, refreshSession] = useAI();

  const [prompt, setPrompt] = useState(
    "I'm looking for a job related to Software Engineer"
  );
  const [selectedPrompt, setSelectedPrompt] = useState("");
  const [sourceFeed, setSourceFeed] = useState(toggleOptions[0]);

  const { data: jobs, isFetching: isFetchingJobs } = useQuery<JobFeed>({
    queryKey: ["sourceFeed", sourceFeed],
    queryFn: () =>
      fetch(`${sourceFeed}/feeds/jobs-rss`)
        .then((res) => res.text())
        .then((data) => {
          const jsonString = XMLToJSON.xml2json(data, {
            compact: true,
            ignoreDeclaration: true,
          });
          return JSON.parse(jsonString);
        }),
    staleTime: Infinity,
  });

  const { data: result, isFetching: isGenerating } = useQuery<string>({
    queryKey: ["applyPrompt", selectedPrompt, sourceFeed],
    queryFn: () => {
      const finalPrompt = `Imagine you are a recruiter and a person is asking you "${prompt}", from the following list which are the only relevant titles for them:\n${validTitles
        .map((s) => `- ${s}`)
        .join("\n")}`;

      console.log("prompt", finalPrompt);

      return session!.prompt(finalPrompt).then((result) => {
        console.info(result);

        // refreshSession();

        return result;
      });
    },
    staleTime: Infinity,
    enabled: !!selectedPrompt && !!session,
  });

  const validTitles = useMemo(() => {
    if (!jobs) {
      return [];
    }

    return [...new Set(jobs.rss.channel.item.map((i) => i.title._cdata))];
  }, [jobs]);

  const filteredTitles = useMemo(() => {
    if (!result || !jobs) {
      return [];
    }

    const relevantTokens = result
      .split("\n")
      .filter((s) => s.startsWith("-"))
      .map((s) => s.replace("- ", "").split("**").filter(Boolean).join());

    return jobs.rss.channel.item.filter((i) =>
      relevantTokens.includes(i.title._cdata)
    );
  }, [result, jobs]);

  return (
    <section className="container max-w-xl py-12 space-y-6">
      <DetectAI />
      <div>
        <Label htmlFor="prompt">What are you looking for:</Label>
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          id="prompt"
        />
      </div>

      <div>
        <Label>Source of jobs:</Label>

        <div className="flex gap-2">
          <Input disabled value={sourceFeed} />
          <Button
            variant="secondary"
            onClick={() => {
              setSourceFeed(
                toggleOptions[indexToggle++ % toggleOptions.length]
              );
              setSelectedPrompt("");
            }}
          >
            Toggle source
          </Button>
        </div>
      </div>

      {isFetchingJobs ? (
        <div className="text-center">Loading jobs...</div>
      ) : (
        <div>Found {jobs?.rss.channel.item.length} jobs</div>
      )}

      <div className="prose">
        <ul>
          <li>AI enabled: {String(!!session)}</li>
          <li>Max Tokens: {session?.maxTokens}</li>
          <li>Tokens Left: {session?.tokensLeft}</li>
        </ul>
      </div>

      <div>
        <Button
          className="w-full"
          disabled={prompt === selectedPrompt}
          onClick={() => {
            setSelectedPrompt(prompt);
          }}
        >
          Recommend me a job
        </Button>
      </div>

      {isGenerating ? (
        <div className="text-center">Generating...</div>
      ) : filteredTitles.length ? (
        <div>
          <p>{filteredTitles.length} job(s) that may be relevant to you...</p>

          {filteredTitles.map((item) => (
            <Card key={item.link._cdata}>
              <CardHeader>
                <CardTitle>{item.title._cdata}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button asChild>
                  <a href={item.link._cdata}>Open Job page</a>
                </Button>

                <p className="flex flex-wrap line-clamp-1">
                  Source: {item.link._cdata.split("?").shift()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p>No relevant jobs.</p>
      )}
    </section>
  );
}

export default App;
