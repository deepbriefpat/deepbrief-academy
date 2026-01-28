import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CheckCircle2, Circle, Clock, TrendingUp, Target, Calendar } from "lucide-react";

export default function Profile() {

  const [selectedCommitment, setSelectedCommitment] = useState<number | null>(null);
  const [progressValue, setProgressValue] = useState(0);
  const [closedNote, setClosedNote] = useState("");

  // Fetch progress stats
  const { data: stats, isLoading: statsLoading } = trpc.aiCoach.getProgressStats.useQuery();

  // Fetch all commitments
  const { data: allCommitments, isLoading: commitmentsLoading, refetch: refetchCommitments } = 
    trpc.aiCoach.getUserCommitments.useQuery();

  // Fetch active commitments
  const { data: activeCommitments } = trpc.aiCoach.getUserCommitments.useQuery({
    status: "open",
  });

  // Mutations
  const updateProgress = trpc.aiCoach.updateCommitmentProgress.useMutation({
    onSuccess: () => {
      toast.success("Progress updated", {
        description: "Your commitment progress has been saved.",
      });
      refetchCommitments();
      setSelectedCommitment(null);
    },
  });

  const completeCommitment = trpc.aiCoach.completeCommitment.useMutation({
    onSuccess: () => {
      toast.success("Commitment completed", {
        description: "Great work! Keep the momentum going.",
      });
      refetchCommitments();
      setSelectedCommitment(null);
      setClosedNote("");
    },
  });

  const handleUpdateProgress = (commitmentId: number) => {
    updateProgress.mutate({
      commitmentId,
      progress: progressValue,
    });
  };

  const handleCompleteCommitment = (commitmentId: number) => {
    completeCommitment.mutate({
      commitmentId,
      closedNote: closedNote || undefined,
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      open: { variant: "default", label: "Open" },
      pending: { variant: "secondary", label: "Pending" },
      in_progress: { variant: "default", label: "In Progress" },
      completed: { variant: "outline", label: "Completed" },
      closed: { variant: "outline", label: "Closed" },
      overdue: { variant: "destructive", label: "Overdue" },
      missed: { variant: "destructive", label: "Missed" },
      abandoned: { variant: "secondary", label: "Abandoned" },
    };
    
    const config = variants[status] || variants.open;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (statsLoading || commitmentsLoading) {
    return (
      <div className="container py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Your Coaching Journey</h1>
        <p className="text-muted-foreground">
          Track your progress, manage commitments, and see how far you've come.
        </p>
      </div>

      {/* Progress Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalSessions || 0}</div>
            <p className="text-xs text-muted-foreground">Coaching conversations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.completionRate || 0}%</div>
            <p className="text-xs text-muted-foreground">Commitments completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Commitments</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeCommitments || 0}</div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.recentActivity || 0}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Commitments */}
      <Card>
        <CardHeader>
          <CardTitle>Commitments</CardTitle>
          <CardDescription>
            Track your commitments and update progress as you make headway.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="active">
            <TabsList className="mb-4">
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4">
              {activeCommitments && activeCommitments.length > 0 ? (
                activeCommitments.map((commitment) => (
                  <Card key={commitment.id} className="border-l-4 border-l-primary">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <CardTitle className="text-base">{commitment.action}</CardTitle>
                          {commitment.context && (
                            <CardDescription>{commitment.context}</CardDescription>
                          )}
                        </div>
                        {getStatusBadge(commitment.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{commitment.progress}%</span>
                        </div>
                        <Progress value={commitment.progress} className="h-2" />
                      </div>

                      {selectedCommitment === commitment.id ? (
                        <div className="space-y-4 pt-2 border-t">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Update Progress</label>
                            <Slider
                              value={[progressValue]}
                              onValueChange={(value) => setProgressValue(value[0])}
                              max={100}
                              step={5}
                              className="py-4"
                            />
                            <p className="text-sm text-muted-foreground text-center">
                              {progressValue}%
                            </p>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">Notes (optional)</label>
                            <Textarea
                              placeholder="What progress have you made? What's working?"
                              value={closedNote}
                              onChange={(e) => setClosedNote(e.target.value)}
                              rows={3}
                            />
                          </div>

                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleUpdateProgress(commitment.id)}
                              disabled={updateProgress.isPending}
                            >
                              Save Progress
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => handleCompleteCommitment(commitment.id)}
                              disabled={completeCommitment.isPending}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Mark Complete
                            </Button>
                            <Button
                              variant="ghost"
                              onClick={() => {
                                setSelectedCommitment(null);
                                setProgressValue(0);
                                setClosedNote("");
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedCommitment(commitment.id);
                            setProgressValue(commitment.progress);
                          }}
                        >
                          Update Progress
                        </Button>
                      )}

                      {commitment.deadline && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Due: {new Date(commitment.deadline).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Circle className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>No active commitments yet.</p>
                  <p className="text-sm">Start a coaching session to create your first commitment.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="all" className="space-y-4">
              {allCommitments && allCommitments.length > 0 ? (
                allCommitments.map((commitment) => (
                  <Card key={commitment.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <CardTitle className="text-base">{commitment.action}</CardTitle>
                          {commitment.context && (
                            <CardDescription>{commitment.context}</CardDescription>
                          )}
                        </div>
                        {getStatusBadge(commitment.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{commitment.progress}%</span>
                        </div>
                        <Progress value={commitment.progress} className="h-2" />
                      </div>
                      {commitment.closedNote && (
                        <p className="text-sm text-muted-foreground mt-4 p-3 bg-muted rounded">
                          {commitment.closedNote}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Circle className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>No commitments yet.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              {allCommitments?.filter(c => c.status === 'completed' || c.status === 'closed').map((commitment) => (
                <Card key={commitment.id} className="opacity-75">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                          <CardTitle className="text-base">{commitment.action}</CardTitle>
                        </div>
                        {commitment.context && (
                          <CardDescription>{commitment.context}</CardDescription>
                        )}
                      </div>
                      {getStatusBadge(commitment.status)}
                    </div>
                  </CardHeader>
                  {commitment.closedNote && (
                    <CardContent>
                      <p className="text-sm text-muted-foreground p-3 bg-muted rounded">
                        {commitment.closedNote}
                      </p>
                    </CardContent>
                  )}
                </Card>
              )) || (
                <div className="text-center py-12 text-muted-foreground">
                  <Circle className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>No completed commitments yet.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
