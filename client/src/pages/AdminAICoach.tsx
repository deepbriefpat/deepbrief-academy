import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Users, Ticket, MessageSquare, TrendingUp, Clock, Mail } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export function AdminAICoach() {
  const { user, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch data
  const { data: userStats, isLoading: statsLoading } = trpc.admin.getCoachingUserStats.useQuery(undefined, {
    enabled: user?.role === "admin",
  });

  const { data: users = [], isLoading: usersLoading } = trpc.admin.getCoachingUsers.useQuery(
    { search: searchQuery || undefined },
    { enabled: user?.role === "admin" }
  );

  const { data: guestPassData, isLoading: guestPassLoading } = trpc.admin.getGuestPassAnalytics.useQuery(undefined, {
    enabled: user?.role === "admin",
  });

  const { data: sessionsData, isLoading: sessionsLoading } = trpc.admin.getCoachingSessionsOverview.useQuery(undefined, {
    enabled: user?.role === "admin",
  });

  // Auth check
  if (authLoading) {
    return <div className="container py-12">Loading...</div>;
  }

  if (!user || user.role !== "admin") {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">AI Coach Management</h1>
          <p className="text-muted-foreground">
            Manage coaching users, guest passes, and session oversight
          </p>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              User Management
            </TabsTrigger>
            <TabsTrigger value="guest-passes">
              <Ticket className="h-4 w-4 mr-2" />
              Guest Passes
            </TabsTrigger>
            <TabsTrigger value="sessions">
              <MessageSquare className="h-4 w-4 mr-2" />
              Coaching Sessions
            </TabsTrigger>
          </TabsList>

          {/* User Management Tab */}
          <TabsContent value="users" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userStats?.totalUsers || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userStats?.activeUsers || 0}</div>
                  <p className="text-xs text-muted-foreground">Last 30 days</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Subscribers</CardTitle>
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userStats?.subscribers || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">New This Month</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userStats?.newThisMonth || 0}</div>
                </CardContent>
              </Card>
            </div>

            {/* User List */}
            <Card>
              <CardHeader>
                <CardTitle>Coaching Users</CardTitle>
                <CardDescription>View and manage all users who have accessed AI coaching</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Input
                    placeholder="Search by name, email, or preferred name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-md"
                  />
                </div>

                {usersLoading ? (
                  <div className="text-center py-8">Loading users...</div>
                ) : users.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No users found</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Preferred Name</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Experience</TableHead>
                        <TableHead>Sessions</TableHead>
                        <TableHead>Commitments</TableHead>
                        <TableHead>Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((u: any) => (
                        <TableRow key={u.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{u.user?.name || "N/A"}</div>
                              <div className="text-sm text-muted-foreground">{u.user?.email || "N/A"}</div>
                            </div>
                          </TableCell>
                          <TableCell>{u.preferredName || "-"}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{u.role || "N/A"}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{u.experienceLevel || "N/A"}</Badge>
                          </TableCell>
                          <TableCell>{u.sessionCount || 0}</TableCell>
                          <TableCell>{u.commitmentCount || 0}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Guest Pass Analytics Tab */}
          <TabsContent value="guest-passes" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Passes</CardTitle>
                  <Ticket className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{guestPassData?.totalPasses || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Passes</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{guestPassData?.activePasses || 0}</div>
                  <p className="text-xs text-muted-foreground">Not expired</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{guestPassData?.totalSessions || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {((guestPassData?.conversionRate || 0) * 100).toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">Passes used</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Passes */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Guest Passes</CardTitle>
                <CardDescription>Latest guest pass codes and their status</CardDescription>
              </CardHeader>
              <CardContent>
                {guestPassLoading ? (
                  <div className="text-center py-8">Loading passes...</div>
                ) : !guestPassData?.recentPasses || guestPassData.recentPasses.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No guest passes found</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Max Uses</TableHead>
                        <TableHead>Uses Remaining</TableHead>
                        <TableHead>Expires</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {guestPassData.recentPasses.map((pass: any) => {
                        const isExpired = new Date(pass.expiresAt) < new Date();
                        const isActive = !isExpired && pass.usesRemaining > 0;
                        return (
                          <TableRow key={pass.id}>
                            <TableCell className="font-mono text-sm">{pass.code}</TableCell>
                            <TableCell>{pass.maxUses}</TableCell>
                            <TableCell>{pass.usesRemaining}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(pass.expiresAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Badge variant={isActive ? "default" : "secondary"}>
                                {isActive ? "Active" : isExpired ? "Expired" : "Depleted"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Coaching Sessions Tab */}
          <TabsContent value="sessions" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{sessionsData?.totalSessions || 0}</div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Sessions by Type</CardTitle>
                </CardHeader>
                <CardContent>
                  {sessionsLoading ? (
                    <div className="text-sm text-muted-foreground">Loading...</div>
                  ) : !sessionsData?.sessionsByType || sessionsData.sessionsByType.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No data available</div>
                  ) : (
                    <div className="space-y-2">
                      {sessionsData.sessionsByType.map((item: any) => (
                        <div key={item.sessionType} className="flex justify-between items-center">
                          <span className="text-sm font-medium capitalize">{item.sessionType.replace('_', ' ')}</span>
                          <Badge variant="outline">{item.count} sessions</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent Sessions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Coaching Sessions</CardTitle>
                <CardDescription>Latest coaching interactions across all users</CardDescription>
              </CardHeader>
              <CardContent>
                {sessionsLoading ? (
                  <div className="text-center py-8">Loading sessions...</div>
                ) : !sessionsData?.recentSessions || sessionsData.recentSessions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No sessions found</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Coach</TableHead>
                        <TableHead>Messages</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sessionsData.recentSessions.map((session: any) => (
                        <TableRow key={session.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{session.user?.preferredName || "Guest"}</div>
                              <div className="text-sm text-muted-foreground">{session.user?.email || "N/A"}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">{session.sessionType.replace('_', ' ')}</Badge>
                          </TableCell>
                          <TableCell>{session.messageCount || 0}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(session.createdAt).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
