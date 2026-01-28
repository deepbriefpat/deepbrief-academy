import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Pencil, Trash2, Plus, X, Search, Eye } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/_core/hooks/useAuth";
import { Link, useLocation } from "wouter";

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

export default function AdminResources() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [previewResource, setPreviewResource] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [themeFilter, setThemeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"alphabetical" | "most_viewed" | "recently_viewed">("alphabetical");

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    theme: "pressure_management" as const,
  });

  const utils = trpc.useUtils();
  const { data: resources, refetch } = trpc.resources.list.useQuery();
  
  const createMutation = trpc.admin.createResource.useMutation({
    onSuccess: () => {
      utils.resources.list.invalidate();
      toast.success("Article created successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create article");
    },
  });
  
  const updateMutation = trpc.admin.updateResource.useMutation({
    onSuccess: () => {
      utils.resources.list.invalidate();
      toast.success("Article updated successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update article");
    },
  });
  
  const deleteMutation = trpc.admin.deleteResource.useMutation({
    onMutate: async ({ id }) => {
      // Cancel outgoing refetches
      await utils.resources.list.cancel();
      
      // Snapshot previous value
      const previousResources = utils.resources.list.getData();
      
      // Optimistically update to remove the resource
      utils.resources.list.setData(undefined, (old) => 
        old?.filter((r) => r.id !== id)
      );
      
      return { previousResources };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousResources) {
        utils.resources.list.setData(undefined, context.previousResources);
      }
      toast.error("Failed to delete article");
    },
    onSuccess: () => {
      toast.success("Article deleted successfully");
    },
    onSettled: () => {
      utils.resources.list.invalidate();
    },
  });

  // Auto-generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: generateSlug(title),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          ...formData,
        });
      } else {
        await createMutation.mutateAsync(formData);
      }

      // Reset form
      setFormData({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        theme: "pressure_management",
      });
      setShowForm(false);
      setEditingId(null);
    } catch (error) {
      // Error handled by mutation callbacks
    }
  };

  const handleEdit = (resource: any) => {
    setFormData({
      title: resource.title,
      slug: resource.slug,
      excerpt: resource.excerpt,
      content: resource.content,
      theme: resource.theme,
    });
    setEditingId(resource.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    toast.promise(
      deleteMutation.mutateAsync({ id }),
      {
        loading: "Deleting article...",
        success: "Article deleted",
        error: "Failed to delete article",
      }
    );
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) {
      toast.error("No articles selected");
      return;
    }

    toast.promise(
      Promise.all(
        Array.from(selectedIds).map((id) => deleteMutation.mutateAsync({ id }))
      ),
      {
        loading: `Deleting ${selectedIds.size} article(s)...`,
        success: () => {
          setSelectedIds(new Set());
          return `${selectedIds.size} article(s) deleted successfully`;
        },
        error: "Failed to delete some articles",
      }
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === resources?.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(resources?.map((r) => r.id)));
    }
  };

  const toggleSelect = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleCancel = () => {
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      theme: "pressure_management",
    });
    setEditingId(null);
    setShowForm(false);
  };

  // Filter and sort resources based on search, theme, and sort order
  const filteredResources = useMemo(() => {
    if (!resources) return [];
    
    // Filter first
    let filtered = resources.filter((resource) => {
      const matchesSearch = searchQuery === "" || 
        resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.slug.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTheme = themeFilter === "all" || resource.theme === themeFilter;
      return matchesSearch && matchesTheme;
    });
    
    // Then sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "most_viewed":
          return (b.viewCount || 0) - (a.viewCount || 0);
        case "recently_viewed":
          const aTime = a.lastViewedAt ? new Date(a.lastViewedAt).getTime() : 0;
          const bTime = b.lastViewedAt ? new Date(b.lastViewedAt).getTime() : 0;
          return bTime - aTime;
        case "alphabetical":
        default:
          return a.title.localeCompare(b.title);
      }
    });
    
    return sorted;
  }, [resources, searchQuery, themeFilter, sortBy]);

  // Format timestamp for display
  const formatTimestamp = (date: Date | null | undefined) => {
    if (!date) return "Never";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  if (loading) {
    return <div className="container py-12">Loading...</div>;
  }

  if (!user || user.role !== "admin") {
    navigate("/");
    return null;
  }

  return (
    <div className="container py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Manage Resources</h1>
            <p className="text-muted-foreground">Add, edit, or delete LinkedIn articles</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/admin">Back to Dashboard</Link>
            </Button>
            {!showForm && (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Article
              </Button>
            )}
          </div>
        </div>

        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{editingId ? "Edit Article" : "Add New Article"}</CardTitle>
                <Button variant="ghost" size="icon" onClick={handleCancel}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>
                Paste your LinkedIn post content below. The slug will be auto-generated from the title.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Most leaders don't notice when their judgement starts to bend."
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="slug">Slug (URL path) *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                    placeholder="most-leaders-dont-notice-judgement-bends"
                    required
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Auto-generated from title. Edit if needed.
                  </p>
                </div>

                <div>
                  <Label htmlFor="theme">Theme *</Label>
                  <Select
                    value={formData.theme}
                    onValueChange={(value: any) => setFormData((prev) => ({ ...prev, theme: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pressure_management">Pressure Management</SelectItem>
                      <SelectItem value="diving_metaphors">Diving Metaphors</SelectItem>
                      <SelectItem value="leadership_isolation">Leadership Isolation</SelectItem>
                      <SelectItem value="vulnerability">Vulnerability</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="excerpt">Excerpt (first 1-2 sentences) *</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
                    placeholder="Most leaders don't notice when their judgement starts to bend. It doesn't happen in a crisis. It happens quietly."
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="content">Full Content *</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                    placeholder="Paste your full LinkedIn post here..."
                    rows={12}
                    required
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Line breaks will be preserved. Supports plain text formatting.
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {createMutation.isPending || updateMutation.isPending
                      ? "Saving..."
                      : editingId
                      ? "Update Article"
                      : "Create Article"}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {/* Search and Filter Bar */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by title or slug..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={themeFilter} onValueChange={setThemeFilter}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Filter by theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Themes</SelectItem>
                    <SelectItem value="pressure_management">Pressure Management</SelectItem>
                    <SelectItem value="diving_metaphors">Diving Metaphors</SelectItem>
                    <SelectItem value="leadership_isolation">Leadership Isolation</SelectItem>
                    <SelectItem value="vulnerability">Vulnerability</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alphabetical">Alphabetical</SelectItem>
                    <SelectItem value="most_viewed">Most Viewed</SelectItem>
                    <SelectItem value="recently_viewed">Recently Viewed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="mt-3 text-sm text-muted-foreground">
                Showing {filteredResources?.length || 0} of {resources?.length || 0} articles
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold">All Articles</h2>
              {resources && resources.length > 0 && (
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedIds.size === resources.length}
                    onCheckedChange={toggleSelectAll}
                  />
                  <span className="text-sm text-muted-foreground">Select all</span>
                </div>
              )}
            </div>
            {selectedIds.size > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete {selectedIds.size} article{selectedIds.size > 1 ? 's' : ''}
              </Button>
            )}
          </div>
          {filteredResources?.map((resource) => (
            <Card key={resource.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <Checkbox
                      checked={selectedIds.has(resource.id)}
                      onCheckedChange={() => toggleSelect(resource.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Badge className={`mb-2 ${themeColors[resource.theme]}`}>
                        {themeLabels[resource.theme]}
                      </Badge>
                      <CardTitle 
                        className="text-xl cursor-pointer hover:text-primary transition-colors"
                        onClick={() => setPreviewResource(resource)}
                      >
                        {resource.title}
                      </CardTitle>
                      <CardDescription className="mt-2">{resource.excerpt}</CardDescription>
                      <p className="text-sm text-muted-foreground mt-2">
                        Slug: <code className="text-xs bg-muted px-1 py-0.5 rounded">/resources/{resource.slug}</code>
                      </p>
                      <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                        <span>👁️ {resource.viewCount || 0} views</span>
                        <span>📅 Last viewed: {formatTimestamp(resource.lastViewedAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => setPreviewResource(resource)}
                      title="Preview article"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleEdit(resource)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(resource.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      {/* Preview Modal */}
      <Dialog open={!!previewResource} onOpenChange={() => setPreviewResource(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{previewResource?.title}</DialogTitle>
            <DialogDescription>
              <Badge className={`${previewResource?.theme ? themeColors[previewResource.theme as keyof typeof themeColors] : themeColors.pressure_management}`}>
                {previewResource?.theme ? themeLabels[previewResource.theme as keyof typeof themeLabels] : themeLabels.pressure_management}
              </Badge>
              <span className="ml-3 text-xs">
                /resources/{previewResource?.slug}
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-2">Excerpt</h4>
              <p className="text-sm">{previewResource?.excerpt}</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-2">Full Content</h4>
              <div className="prose prose-sm max-w-none">
                {previewResource?.content.split('\n').map((paragraph: string, idx: number) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
            </div>
            <div className="flex gap-4 text-xs text-muted-foreground pt-4 border-t">
              <span>👁️ {previewResource?.viewCount || 0} views</span>
              <span>📅 Last viewed: {formatTimestamp(previewResource?.lastViewedAt)}</span>
              {previewResource?.linkedinUrl && (
                <a 
                  href={previewResource.linkedinUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  View on LinkedIn →
                </a>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
