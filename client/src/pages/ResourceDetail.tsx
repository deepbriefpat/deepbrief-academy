import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Waves, ArrowLeft, Eye, Heart, MessageCircle } from "lucide-react";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Link, useParams } from "wouter";
import { Streamdown } from "streamdown";
import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { trackResourceViewed, trackReactionAdded, trackCommentPosted } from "@/lib/analytics";

const themeLabels = {
  pressure_management: "Pressure Management",
  diving_metaphors: "Diving Metaphors",
  leadership_isolation: "Leadership Isolation",
  vulnerability: "Vulnerability",
};

const themeColors = {
  pressure_management: "bg-blue-500/10 text-blue-500",
  diving_metaphors: "bg-cyan-500/10 text-cyan-500",
  leadership_isolation: "bg-purple-500/10 text-purple-500",
  vulnerability: "bg-orange-500/10 text-orange-500",
};

export default function ResourceDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const { data: resource, isLoading } = trpc.resources.bySlug.useQuery({ slug: slug || "" });
  const trackViewMutation = trpc.resources.trackView.useMutation();
  
  // Reactions state
  const { data: reactionCount } = trpc.reactions.getCount.useQuery(
    { resourceId: resource?.id || 0 },
    { enabled: !!resource?.id }
  );
  const { data: hasReacted } = trpc.reactions.hasReacted.useQuery(
    { resourceId: resource?.id || 0 },
    { enabled: !!resource?.id && !!user }
  );
  const addReaction = trpc.reactions.add.useMutation();
  const removeReaction = trpc.reactions.remove.useMutation();
  const utils = trpc.useUtils();
  
  // Comments state
  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const { data: comments } = trpc.comments.list.useQuery(
    { resourceId: resource?.id || 0 },
    { enabled: !!resource?.id }
  );
  const createComment = trpc.comments.create.useMutation();
  const deleteComment = trpc.comments.delete.useMutation();
  
  const handleReaction = async () => {
    if (!user) {
      window.location.href = getLoginUrl();
      return;
    }
    if (!resource) return;
    
    try {
      if (hasReacted) {
        await removeReaction.mutateAsync({ resourceId: resource.id });
      } else {
        await addReaction.mutateAsync({ resourceId: resource.id });
      }
      utils.reactions.getCount.invalidate({ resourceId: resource.id });
      utils.reactions.hasReacted.invalidate({ resourceId: resource.id });
    } catch (error) {
      toast.error("Failed to update reaction");
    }
  };
  
  const handleCommentSubmit = async () => {
    if (!user) {
      window.location.href = getLoginUrl();
      return;
    }
    if (!resource || !commentText.trim()) return;
    
    try {
      await createComment.mutateAsync({
        resourceId: resource.id,
        content: commentText,
        parentId: replyTo || undefined,
      });
      setCommentText("");
      setReplyTo(null);
      utils.comments.list.invalidate({ resourceId: resource.id });
      toast.success("Comment posted");
    } catch (error) {
      toast.error("Failed to post comment");
    }
  };
  
  const handleDeleteComment = async (commentId: number) => {
    if (!resource) return;
    
    toast.promise(
      deleteComment.mutateAsync({ commentId }).then(() => {
        utils.comments.list.invalidate({ resourceId: resource.id });
      }),
      {
        loading: "Deleting comment...",
        success: "Comment deleted",
        error: "Failed to delete comment",
      }
    );
  };

  // Track view when resource loads
  useEffect(() => {
    if (resource?.id) {
      trackViewMutation.mutate({ resourceId: resource.id });
    }
  }, [resource?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Waves className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading resource...</p>
        </div>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Resource Not Found</h1>
          <Link href="/resources">
            <Button>Back to Resources</Button>
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
            { label: "Resources", href: "/resources" },
            { label: resource.title }
          ]} />

          <article>
            <header className="mb-8">
              <Badge className={`mb-4 ${themeColors[resource.theme]}`}>
                {themeLabels[resource.theme]}
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{resource.title}</h1>
              <p className="text-lg text-muted-foreground mb-6">{resource.excerpt}</p>
              
              <div className="flex items-center gap-6 text-sm text-muted-foreground pb-6 border-b">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{resource.viewCount || 0} views</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  <span>{reactionCount || 0} reactions</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  <span>{comments?.length || 0} comments</span>
                </div>
              </div>
            </header>

            <div className="prose prose-invert prose-lg max-w-none">
              <Streamdown>{resource.content}</Streamdown>
            </div>
          </article>

          {/* Reactions Section */}
          <div className="mt-12 pt-8 border-t">
            <div className="flex items-center gap-4 mb-8">
              <Button
                variant={hasReacted ? "default" : "outline"}
                size="lg"
                onClick={handleReaction}
                className="gap-2"
              >
                <Heart className={`h-5 w-5 ${hasReacted ? 'fill-current' : ''}`} />
                {hasReacted ? 'Liked' : 'Like'} ({reactionCount || 0})
              </Button>
            </div>
          </div>

          {/* Comments Section */}
          <div className="mt-8 pt-8 border-t">
            <h3 className="text-2xl font-bold mb-6">Comments ({comments?.length || 0})</h3>
            
            {/* Comment Form */}
            <div className="mb-8">
              {replyTo && (
                <div className="mb-2 text-sm text-muted-foreground">
                  Replying to comment...
                  <Button variant="ghost" size="sm" onClick={() => setReplyTo(null)} className="ml-2">
                    Cancel
                  </Button>
                </div>
              )}
              <Textarea
                placeholder={user ? "Share your thoughts..." : "Sign in to comment"}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                disabled={!user}
                className="mb-4"
                rows={4}
              />
              <Button
                onClick={handleCommentSubmit}
                disabled={!user || !commentText.trim() || createComment.isPending}
              >
                {createComment.isPending ? "Posting..." : "Post Comment"}
              </Button>
            </div>

            {/* Comments List */}
            <div className="space-y-6">
              {comments?.filter(c => !c.parentId).map((comment) => (
                <div key={comment.id} className="bg-card p-6 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-semibold">{comment.userName || 'Anonymous'}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    {user?.id === comment.userId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteComment(comment.id)}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                  <p className="text-foreground mb-3">{comment.content}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyTo(comment.id)}
                  >
                    Reply
                  </Button>
                  
                  {/* Replies */}
                  <div className="ml-8 mt-4 space-y-4">
                    {comments?.filter(c => c.parentId === comment.id).map((reply) => (
                      <div key={reply.id} className="bg-muted/30 p-4 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="font-semibold text-sm">{reply.userName || 'Anonymous'}</div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(reply.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          {user?.id === reply.userId && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteComment(reply.id)}
                            >
                              Delete
                            </Button>
                          )}
                        </div>
                        <p className="text-sm">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              {(!comments || comments.length === 0) && (
                <p className="text-center text-muted-foreground py-8">
                  No comments yet. Be the first to share your thoughts!
                </p>
              )}
            </div>
          </div>

          <div className="mt-12 pt-8 border-t">
            <div className="bg-card p-8 rounded-lg">
              <h3 className="text-2xl font-bold mb-4">Want to go deeper?</h3>
              <p className="text-muted-foreground mb-6">
                Take the Pressure Audit to understand where pressure is affecting your judgment, or explore peer support options.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/assessment">
                  <Button>Take the Pressure Audit</Button>
                </Link>
                <Link href="/community">
                  <Button variant="outline">Learn About Peer Groups</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
