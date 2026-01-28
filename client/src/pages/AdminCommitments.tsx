import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle2, Clock, XCircle, AlertCircle, Mail, MailCheck } from "lucide-react";
import { format } from "date-fns";

export default function AdminCommitments() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: commitments, isLoading } = trpc.admin.getAllCommitments.useQuery();
  const { data: stats } = trpc.admin.getCommitmentStats.useQuery();

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading commitments...</p>
          </div>
        </div>
      </div>
    );
  }

  // Filter commitments
  const filteredCommitments = commitments?.filter((commitment) => {
    const matchesStatus = statusFilter === "all" || commitment.status === statusFilter;
    const matchesSearch =
      searchQuery === "" ||
      commitment.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      commitment.userEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      commitment.action.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
      case "closed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "pending":
      case "open":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "in_progress":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "missed":
      case "overdue":
      case "abandoned":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "completed":
      case "closed":
        return "default";
      case "pending":
      case "open":
        return "secondary";
      case "in_progress":
        return "outline";
      case "missed":
      case "overdue":
      case "abandoned":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const isOverdue = (deadline: Date | null, status: string) => {
    if (!deadline || status === "completed" || status === "closed") return false;
    return new Date(deadline) < new Date();
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Commitment Dashboard</h1>
        <p className="text-muted-foreground">
          Track and manage user commitments across all coaching sessions
        </p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Commitments</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCommitments}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completionRate}%</div>
              <p className="text-xs text-muted-foreground">
                {stats.completedCount} of {stats.totalCommitments} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{stats.overdueCount}</div>
              <p className="text-xs text-muted-foreground">Require attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Check-in Emails Sent</CardTitle>
              <MailCheck className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.checkInEmailsSent}</div>
              <p className="text-xs text-muted-foreground">3-day reminders</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by user, email, or commitment..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="missed">Missed</SelectItem>
                <SelectItem value="abandoned">Abandoned</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Commitments Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            All Commitments ({filteredCommitments?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Commitment</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Check-in Email</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCommitments && filteredCommitments.length > 0 ? (
                  filteredCommitments.map((commitment) => (
                    <TableRow key={commitment.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{commitment.userName || "Guest User"}</div>
                          <div className="text-sm text-muted-foreground">
                            {commitment.userEmail || commitment.guestPassCode}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-md">
                        <div className="line-clamp-2">{commitment.action}</div>
                        {commitment.context && (
                          <div className="text-sm text-muted-foreground line-clamp-1 mt-1">
                            {commitment.context}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {commitment.deadline ? (
                          <div>
                            <div>{format(new Date(commitment.deadline), "MMM d, yyyy")}</div>
                            {isOverdue(commitment.deadline, commitment.status) && (
                              <Badge variant="destructive" className="mt-1">
                                Overdue
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No deadline</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(commitment.status)}
                          <Badge variant={getStatusBadgeVariant(commitment.status)}>
                            {commitment.status.replace("_", " ")}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gold h-2 rounded-full transition-all"
                              style={{ width: `${commitment.progress}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {commitment.progress}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {commitment.checkInEmailSent ? (
                          <div className="flex items-center gap-1 text-green-600">
                            <MailCheck className="h-4 w-4" />
                            <span className="text-sm">Sent</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Mail className="h-4 w-4" />
                            <span className="text-sm">Not sent</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {format(new Date(commitment.createdAt), "MMM d, yyyy")}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No commitments found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
