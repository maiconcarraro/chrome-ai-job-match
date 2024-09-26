import { Item } from "@/interfaces/rss";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";

export default function JobResults({
  jobs,
  loading,
}: {
  jobs: Item[];
  loading: boolean;
}) {
  return loading ? (
    <div className="text-center">Generating...</div>
  ) : jobs.length ? (
    <div>
      <p>{jobs.length} job(s) that may be relevant to you...</p>

      {jobs.map((item) => (
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
  );
}
