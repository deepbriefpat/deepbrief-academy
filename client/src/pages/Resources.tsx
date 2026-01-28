import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Waves, Eye, Heart, MessageCircle, Search } from "lucide-react";
import { Link } from "wouter";
import { Footer } from "@/components/Footer";

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

export default function Resources() {
  const { data: resources, isLoading } = trpc.resources.list.useQuery();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"alphabetical" | "most_viewed" | "recent">("alphabetical");

  const filteredAndSortedResources = useMemo(() => {
    if (!resources) return [];
    
    // Filter by search query
    let filtered = resources.filter((resource) =>
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sort
    if (sortBy === "most_viewed") {
      filtered.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
    } else if (sortBy === "recent") {
      filtered.sort((a, b) => {
        const dateA = a.lastViewedAt ? new Date(a.lastViewedAt).getTime() : 0;
        const dateB = b.lastViewedAt ? new Date(b.lastViewedAt).getTime() : 0;
        return dateB - dateA;
      });
    } else {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    }

    return filtered;
  }, [resources, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-[clamp(2.8rem,6vw,4.5rem)] font-serif leading-[1.2] tracking-[-0.02em] mb-4 text-gold">Resource Library</h1>
            <p className="text-lg text-muted-foreground">
              Insights from Patrick Voorma on leadership, pressure, and thinking clearly at depth
            </p>
          </div>

          {/* Downloadable Resources */}
          <Card className="mb-8 border-gold-dim bg-navy-mid/30">
            <CardHeader>
              <CardTitle className="text-gold">Downloadable Resources</CardTitle>
              <CardDescription>Free guides and frameworks to support your leadership journey</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-gold-dim/30 hover:border-gold-dim/60 transition-colors">
                <div>
                  <h3 className="font-semibold text-text-primary mb-1">The Pressure Map</h3>
                  <p className="text-sm text-text-secondary">Visual framework showing how pressure distorts judgment at different depths</p>
                </div>
                <a 
                  href="/The-Pressure-Map.pdf" 
                  download
                  className="px-4 py-2 bg-gold text-navy-deep rounded hover:bg-gold/90 transition-colors font-medium text-sm"
                >
                  Download PDF
                </a>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border border-gold-dim/30 hover:border-gold-dim/60 transition-colors">
                <div>
                  <h3 className="font-semibold text-text-primary mb-1">Pressure Management Guide</h3>
                  <p className="text-sm text-text-secondary">8-page guide covering the Thermocline Effect, early-warning signs, and peer support framework</p>
                </div>
                <a 
                  href="/pressure-management-guide.pdf" 
                  download
                  className="px-4 py-2 bg-gold text-navy-deep rounded hover:bg-gold/90 transition-colors font-medium text-sm"
                >
                  Download PDF
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Search and Sort Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search articles by title or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alphabetical">Alphabetical</SelectItem>
                <SelectItem value="most_viewed">Most Viewed</SelectItem>
                <SelectItem value="recent">Recently Viewed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Tabs defaultValue="all" className="mb-8">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pressure_management">Pressure</TabsTrigger>
              <TabsTrigger value="diving_metaphors">Diving</TabsTrigger>
              <TabsTrigger value="leadership_isolation">Isolation</TabsTrigger>
              <TabsTrigger value="vulnerability">Vulnerability</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6 mt-6">
              {isLoading ? (
                <div className="text-center py-12">
                  <Waves className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading resources...</p>
                </div>
              ) : filteredAndSortedResources.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No articles found matching your search.</p>
                </div>
              ) : (
                filteredAndSortedResources.map((resource) => (
                  <Card key={resource.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <Badge className={`mb-2 ${themeColors[resource.theme]}`}>
                            {themeLabels[resource.theme]}
                          </Badge>
                          <CardTitle className="text-2xl mb-2">
                            <Link href={`/resources/${resource.slug}`} className="hover:text-primary transition-colors">
                              {resource.title}
                            </Link>
                          </CardTitle>
                          <CardDescription className="text-base">{resource.excerpt}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          <span>{resource.viewCount || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          <span>{resource.reactionCount || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          <span>{resource.commentCount || 0}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            {(["pressure_management", "diving_metaphors", "leadership_isolation", "vulnerability"] as const).map((theme) => (
              <TabsContent key={theme} value={theme} className="space-y-6 mt-6">
                <ResourcesByTheme theme={theme} />
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function ResourcesByTheme({ theme }: { theme: "pressure_management" | "diving_metaphors" | "leadership_isolation" | "vulnerability" }) {
  const { data: resources, isLoading } = trpc.resources.byTheme.useQuery({ theme });

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <Waves className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
        <p className="text-muted-foreground">Loading resources...</p>
      </div>
    );
  }

  if (!resources || resources.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No resources found in this category yet.</p>
      </div>
    );
  }

  return (
    <>
      {resources.map((resource) => (
        <Card key={resource.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-2xl mb-2">
              <Link href={`/resources/${resource.slug}`} className="hover:text-primary transition-colors">
                {resource.title}
              </Link>
            </CardTitle>
            <CardDescription className="text-base">{resource.excerpt}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{resource.viewCount || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                <span>{resource.reactionCount || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                <span>{resource.commentCount || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
}
