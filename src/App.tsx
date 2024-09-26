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

const recruitics = "https://careers.recruitics.com/feeds/jobs-rss";
const thesteppingstonesgroup =
  "https://jobs.thesteppingstonesgroup.com/feeds/jobs-rss";

function App() {
  const [session] = useAI();

  const [prompt, setPrompt] = useState(
    "I'm looking for a job related to Software Engineer"
  );
  const [selectedPrompt, setSelectedPrompt] = useState("");
  const [sourceFeed, setSourceFeed] = useState(recruitics);

  const { data: jobs, isFetching: isFetchingJobs } = useQuery<JobFeed>({
    queryKey: ["sourceFeed", sourceFeed],
    queryFn: () =>
      fetch(sourceFeed)
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
    queryKey: ["applyPrompt", selectedPrompt],
    queryFn: () => {
      const finalPrompt = `${prompt}, from the following list which are the best choices for me:\n${validTitles.join(
        "\n"
      )}`;

      console.log("prompt", finalPrompt);

      return session!.prompt(finalPrompt);
    },
    staleTime: Infinity,
    enabled: !!selectedPrompt && !!session,
  });

  const validTitles = useMemo(() => {
    if (!jobs) {
      return [];
    }

    return jobs.rss.channel.item.map((i) => i.title._cdata);
  }, [jobs]);

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
            onClick={() =>
              setSourceFeed((prev) =>
                prev === recruitics ? thesteppingstonesgroup : recruitics
              )
            }
          >
            Toggle source
          </Button>
        </div>
      </div>

      {isFetchingJobs ? (
        <div>Loading jobs...</div>
      ) : (
        <div>Found {validTitles.length} jobs</div>
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
          onClick={() => setSelectedPrompt(prompt)}
        >
          Recommend me a job
        </Button>
      </div>

      {isGenerating ? (
        <div>Generating...</div>
      ) : (
        <div dangerouslySetInnerHTML={{ __html: result! }} />
      )}
    </section>
  );
}

export default App;
