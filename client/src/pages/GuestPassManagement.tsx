import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Copy, Ban, Check, Calendar, Mail } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";


export default function GuestPassManagement() {

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [selectedPassId, setSelectedPassId] = useState<number | null>(null);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [personalMessage, setPersonalMessage] = useState("");

  const { data: guestPasses, refetch } = trpc.aiCoach.getGuestPasses.useQuery();
  const createMutation = trpc.aiCoach.createGuestPass.useMutation({
    onSuccess: () => {
      alert("Guest pass created successfully!");
      setIsCreateDialogOpen(false);
      setLabel("");
      setExpiresAt("");
      refetch();
    },
  });

  const revokeMutation = trpc.aiCoach.revokeGuestPass.useMutation({
    onSuccess: () => {
      alert("Guest pass revoked successfully!");
      refetch();
    },
  });

  const sendInvitationMutation = trpc.aiCoach.sendGuestPassInvitation.useMutation({
    onSuccess: (data) => {
      alert(data.message);
      setEmailDialogOpen(false);
      setRecipientEmail("");
      setRecipientName("");
      setPersonalMessage("");
      setSelectedPassId(null);
    },
    onError: (error) => {
      alert(`Failed to send invitation: ${error.message}`);
    },
  });

  const handleCreate = () => {
    createMutation.mutate({
      label: label || undefined,
      expiresAt: expiresAt || undefined,
    });
  };

  const handleCopy = (code: string) => {
    const guestUrl = `${window.location.origin}/ai-coach/guest?code=${code}`;
    navigator.clipboard.writeText(guestUrl);
    setCopiedCode(code);
    // Visual feedback handled by button state
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleRevoke = (passId: number) => {
    if (confirm("Are you sure you want to revoke this guest pass? This cannot be undone.")) {
      revokeMutation.mutate({ passId });
    }
  };

  const handleOpenEmailDialog = (passId: number) => {
    setSelectedPassId(passId);
    setEmailDialogOpen(true);
  };

  const handleSendInvitation = () => {
    if (!selectedPassId || !recipientEmail) return;
    
    sendInvitationMutation.mutate({
      guestPassId: selectedPassId,
      recipientEmail,
      recipientName: recipientName || undefined,
      personalMessage: personalMessage || undefined,
    });
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "Never";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isExpired = (expiresAt: Date | string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="min-h-screen bg-navy-deep text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif text-gold mb-2">Guest Pass Management</h1>
            <p className="text-gray-400">
              Generate shareable links for free unlimited AI coaching access
            </p>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gold text-navy-deep hover:bg-gold-bright">
                <Plus className="w-4 h-4 mr-2" />
                Generate New Pass
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-navy-mid border-gold-dim text-white">
              <DialogHeader>
                <DialogTitle className="text-gold">Create Guest Pass</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="label">Label (Optional)</Label>
                  <Input
                    id="label"
                    placeholder="e.g., Client Demo, Partner Access"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="bg-navy-deep border-gold-dim text-white mt-1"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Add a label to identify who this pass is for
                  </p>
                </div>

                <div>
                  <Label htmlFor="expiresAt">Expiration Date (Optional)</Label>
                  <Input
                    id="expiresAt"
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="bg-navy-deep border-gold-dim text-white mt-1"
                    min={new Date().toISOString().split("T")[0]}
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Leave empty for no expiration
                  </p>
                </div>

                <Button
                  onClick={handleCreate}
                  disabled={createMutation.isPending}
                  className="w-full bg-gold text-navy-deep hover:bg-gold-bright"
                >
                  {createMutation.isPending ? "Creating..." : "Generate Pass"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Guest Passes Table */}
        <Card className="bg-navy-mid border-gold-dim">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gold-dim">
                  <th className="text-left p-4 text-gold font-semibold">Code</th>
                  <th className="text-left p-4 text-gold font-semibold">Label</th>
                  <th className="text-left p-4 text-gold font-semibold">Usage</th>
                  <th className="text-left p-4 text-gold font-semibold">Expires</th>
                  <th className="text-left p-4 text-gold font-semibold">Status</th>
                  <th className="text-left p-4 text-gold font-semibold">Last Used</th>
                  <th className="text-right p-4 text-gold font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {!guestPasses || guestPasses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center p-8 text-gray-400">
                      No guest passes yet. Click "Generate New Pass" to create one.
                    </td>
                  </tr>
                ) : (
                  guestPasses.map((pass) => {
                    const expired = isExpired(pass.expiresAt);
                    const status = !pass.isActive
                      ? "Revoked"
                      : expired
                      ? "Expired"
                      : "Active";
                    const statusColor = !pass.isActive
                      ? "text-red-400"
                      : expired
                      ? "text-orange-400"
                      : "text-green-400";

                    return (
                      <tr key={pass.id} className="border-b border-gold-dim/30 hover:bg-navy-deep/50">
                        <td className="p-4">
                          <code className="text-gold-bright bg-navy-deep px-2 py-1 rounded text-sm">
                            {pass.code}
                          </code>
                        </td>
                        <td className="p-4 text-gray-300">
                          {pass.label || <span className="text-gray-500 italic">No label</span>}
                        </td>
                        <td className="p-4 text-gray-300">
                          <span className="font-semibold">{pass.usageCount}</span> sessions
                        </td>
                        <td className="p-4 text-gray-300">
                          <div className="flex items-center gap-2">
                            {pass.expiresAt && <Calendar className="w-4 h-4 text-gray-500" />}
                            {formatDate(pass.expiresAt)}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`font-semibold ${statusColor}`}>{status}</span>
                        </td>
                        <td className="p-4 text-gray-400 text-sm">
                          {pass.lastUsedAt ? formatDate(pass.lastUsedAt) : "Never"}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCopy(pass.code)}
                              className="border-gold-dim hover:bg-gold/10"
                              disabled={!pass.isActive || expired}
                            >
                              {copiedCode === pass.code ? (
                                <>
                                  <Check className="w-4 h-4 mr-1" />
                                  Copied
                                </>
                              ) : (
                                <>
                                  <Copy className="w-4 h-4 mr-1" />
                                  Copy Link
                                </>
                              )}
                            </Button>
                            {pass.isActive && !expired && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleOpenEmailDialog(pass.id)}
                                  className="border-gold/50 text-gold hover:bg-gold/10"
                                >
                                  <Mail className="w-4 h-4 mr-1" />
                                  Email
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRevoke(pass.id)}
                                  className="border-red-400/50 text-red-400 hover:bg-red-400/10"
                                >
                                  <Ban className="w-4 h-4 mr-1" />
                                  Revoke
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Instructions */}
        <Card className="bg-navy-mid border-gold-dim mt-6 p-6">
          <h3 className="text-lg font-semibold text-gold mb-3">How to Use Guest Passes</h3>
          <ol className="space-y-2 text-gray-300">
            <li className="flex gap-2">
              <span className="text-gold font-semibold">1.</span>
              <span>Click "Generate New Pass" to create a new guest access code</span>
            </li>
            <li className="flex gap-2">
              <span className="text-gold font-semibold">2.</span>
              <span>Add an optional label to remember who the pass is for</span>
            </li>
            <li className="flex gap-2">
              <span className="text-gold font-semibold">3.</span>
              <span>Set an expiration date, or leave empty for unlimited duration</span>
            </li>
            <li className="flex gap-2">
              <span className="text-gold font-semibold">4.</span>
              <span>Click "Copy Link" to get the shareable URL</span>
            </li>
            <li className="flex gap-2">
              <span className="text-gold font-semibold">5.</span>
              <span>Share the link with anyone you want to give free unlimited coaching access</span>
            </li>
            <li className="flex gap-2">
              <span className="text-gold font-semibold">6.</span>
              <span>Track usage and revoke access anytime by clicking "Revoke"</span>
            </li>
          </ol>
        </Card>
      </div>

      {/* Email Invitation Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="bg-navy-deep border-gold/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-gold">Send Guest Pass Invitation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="recipientEmail" className="text-gray-300">
                Recipient Email *
              </Label>
              <Input
                id="recipientEmail"
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="colleague@example.com"
                className="bg-navy-light border-gold/20 text-white"
              />
            </div>
            <div>
              <Label htmlFor="recipientName" className="text-gray-300">
                Recipient Name (optional)
              </Label>
              <Input
                id="recipientName"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="John Smith"
                className="bg-navy-light border-gold/20 text-white"
              />
            </div>
            <div>
              <Label htmlFor="personalMessage" className="text-gray-300">
                Personal Message (optional)
              </Label>
              <Textarea
                id="personalMessage"
                value={personalMessage}
                onChange={(e) => setPersonalMessage(e.target.value)}
                placeholder="I thought you might find this AI coaching tool helpful for..." rows={4}
                className="bg-navy-light border-gold/20 text-white resize-none"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setEmailDialogOpen(false)}
                className="border-gray-400/50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendInvitation}
                disabled={!recipientEmail || sendInvitationMutation.isPending}
                className="bg-gold text-navy-deep hover:bg-gold/90"
              >
                {sendInvitationMutation.isPending ? "Sending..." : "Send Invitation"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
