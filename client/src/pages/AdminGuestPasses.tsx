import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Copy, Search, ExternalLink, CheckCircle2, XCircle, Clock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { MetaTags } from "@/components/MetaTags";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export function AdminGuestPasses() {
  const { user, loading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Fetch guest passes with invitations
  const { data: guestPasses = [], isLoading, refetch } = trpc.admin.getGuestPasses.useQuery(
    {
      search: searchQuery || undefined,
    },
    {
      enabled: user?.role === "admin",
    }
  );

  // Get base URL for the site
  const baseUrl = window.location.origin;

  // Copy guest pass link to clipboard
  const copyGuestPassLink = (code: string, id: number) => {
    const link = `${baseUrl}/ai-coach/dashboard?guest=${code}`;
    navigator.clipboard.writeText(link).then(() => {
      toast.success("Guest pass link copied to clipboard!");
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }).catch(() => {
      toast.error("Failed to copy link");
    });
  };

  // Format date
  const formatDate = (date: Date | string | null) => {
    if (!date) return "Never";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Check if guest pass is expired
  const isExpired = (expiresAt: Date | string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  // Get status badge
  const getStatusBadge = (pass: any) => {
    if (!pass.isActive) {
      return <Badge variant="destructive">Revoked</Badge>;
    }
    if (isExpired(pass.expiresAt)) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    if (pass.usageCount > 0) {
      return <Badge variant="default" className="bg-green-600">Active (Used)</Badge>;
    }
    return <Badge variant="secondary">Active (Unused)</Badge>;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F8F6F1] flex items-center justify-center">
        <div className="text-[#6B6B60]">Loading...</div>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#F8F6F1] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#2C2C2C] mb-2">Access Denied</h1>
          <p className="text-[#6B6B60]">You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F6F1]">
      <MetaTags
        title="Guest Pass Management | Admin"
        description="Manage guest passes and invitations"
      />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#2C2C2C] mb-2">Guest Pass Management</h1>
          <p className="text-[#6B6B60]">
            View and manage all guest passes. Copy links to share directly with users.
          </p>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#6B6B60]" />
                <Input
                  placeholder="Search by code, label, or recipient email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guest Passes Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Guest Passes</CardTitle>
            <CardDescription>
              {guestPasses.length} guest pass{guestPasses.length !== 1 ? "es" : ""} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-[#6B6B60]">Loading guest passes...</div>
            ) : guestPasses.length === 0 ? (
              <div className="text-center py-8 text-[#6B6B60]">
                No guest passes found. Create one to get started.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Label</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Invitations</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {guestPasses.map((pass: any) => (
                      <TableRow key={pass.id}>
                        <TableCell className="font-mono text-sm">{pass.code}</TableCell>
                        <TableCell>{pass.label || "-"}</TableCell>
                        <TableCell>{getStatusBadge(pass)}</TableCell>
                        <TableCell>
                          {pass.invitations && pass.invitations.length > 0 ? (
                            <div className="space-y-1">
                              {pass.invitations.map((inv: any, idx: number) => (
                                <div key={idx} className="text-sm">
                                  <div className="font-medium">{inv.recipientEmail}</div>
                                  {inv.recipientName && (
                                    <div className="text-[#6B6B60] text-xs">{inv.recipientName}</div>
                                  )}
                                  <div className="flex items-center gap-1 text-xs text-[#6B6B60]">
                                    {inv.status === "sent" && (
                                      <>
                                        <CheckCircle2 className="h-3 w-3 text-green-600" />
                                        Sent {formatDate(inv.sentAt)}
                                      </>
                                    )}
                                    {inv.status === "pending" && (
                                      <>
                                        <Clock className="h-3 w-3 text-yellow-600" />
                                        Pending
                                      </>
                                    )}
                                    {inv.status === "failed" && (
                                      <>
                                        <XCircle className="h-3 w-3 text-red-600" />
                                        Failed
                                      </>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[#6B6B60]">No invitations</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {pass.usageCount > 0 ? (
                            <span className="text-green-600 font-medium">{pass.usageCount} session{pass.usageCount !== 1 ? "s" : ""}</span>
                          ) : (
                            <span className="text-[#6B6B60]">Unused</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {pass.expiresAt ? (
                            <span className={isExpired(pass.expiresAt) ? "text-red-600" : ""}>
                              {formatDate(pass.expiresAt)}
                            </span>
                          ) : (
                            <span className="text-[#6B6B60]">Never</span>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(pass.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyGuestPassLink(pass.code, pass.id)}
                              className="gap-2"
                            >
                              {copiedId === pass.id ? (
                                <>
                                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                                  Copied!
                                </>
                              ) : (
                                <>
                                  <Copy className="h-4 w-4" />
                                  Copy Link
                                </>
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(`${baseUrl}/ai-coach/dashboard?guest=${pass.code}`, "_blank")}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
