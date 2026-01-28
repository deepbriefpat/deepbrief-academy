import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Waves } from "lucide-react";
import { Link } from "wouter";

export default function Stories() {
  const { data: stories, isLoading } = trpc.stories.list.useQuery();

  return (
    <div className="min-h-screen bg-background">
            <div className="container py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Patrick's Stories</h1>
            <p className="text-lg text-muted-foreground">
              Lessons from 10,000+ dives, 52 countries, and 150 metres of depth
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <Waves className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
              <p className="text-muted-foreground">Loading stories...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {stories?.map((story) => (
                <Card key={story.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-2xl mb-2">
                      <Link href={`/stories/${story.slug}`} className="hover:text-primary transition-colors">
                        {story.title}
                      </Link>
                    </CardTitle>
                    <CardDescription className="text-base">{story.excerpt}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href={`/stories/${story.slug}`}>
                      <Button variant="ghost">Read Story →</Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
