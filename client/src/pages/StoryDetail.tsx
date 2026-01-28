import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Waves, ArrowLeft } from "lucide-react";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Link, useParams } from "wouter";
import ReactMarkdown from 'react-markdown';

export default function StoryDetail() {
  const { slug } = useParams();
  const { data: story, isLoading } = trpc.stories.bySlug.useQuery({ slug: slug || "" });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Waves className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading story...</p>
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Story Not Found</h1>
          <Link href="/stories">
            <Button>Back to Stories</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
            <div className="container py-12">
        <div className="max-w-3xl mx-auto">
          <Breadcrumb items={[
            { label: "Stories", href: "/stories" },
            { label: story.title }
          ]} />

          <article>
            <header className="mb-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{story.title}</h1>
              <p className="text-lg text-muted-foreground mb-6 pb-6 border-b">{story.excerpt}</p>
            </header>

            <div className="prose prose-invert prose-lg max-w-none">
              <ReactMarkdown
                components={{
                  img: ({ ...props }) => (
                    <img
                      {...props}
                      className="rounded-lg w-full h-auto my-8"
                      loading="lazy"
                    />
                  ),
                }}
              >
                {story.content}
              </ReactMarkdown>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
