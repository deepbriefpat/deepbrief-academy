import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, Bell, AlertCircle, CheckCircle } from "lucide-react";
export default function EmailPreferences() {
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const { data: preferences, isLoading } = trpc.emailPreferences.get.useQuery();
  const updateMutation = trpc.emailPreferences.update.useMutation({
    onSuccess: () => {
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 3000);
    },
    onError: () => {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    },
  });

  const [emailsEnabled, setEmailsEnabled] = useState(preferences?.emailsEnabled ?? true);
  const [followUpEmails, setFollowUpEmails] = useState(preferences?.followUpEmails ?? true);
  const [weeklyCheckIns, setWeeklyCheckIns] = useState(preferences?.weeklyCheckIns ?? true);
  const [overdueAlerts, setOverdueAlerts] = useState(preferences?.overdueAlerts ?? true);

  // Update local state when preferences load
  if (preferences && emailsEnabled === undefined) {
    setEmailsEnabled(preferences.emailsEnabled);
    setFollowUpEmails(preferences.followUpEmails);
    setWeeklyCheckIns(preferences.weeklyCheckIns);
    setOverdueAlerts(preferences.overdueAlerts);
  }

  const handleSave = () => {
    updateMutation.mutate({
      emailsEnabled,
      followUpEmails,
      weeklyCheckIns,
      overdueAlerts,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-navy-deep to-navy-medium flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-sage-medium" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-navy-deep to-navy-medium py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Email Preferences</h1>
          <p className="text-muted-foreground">
            Manage how you receive accountability emails and commitment reminders
          </p>
        </div>

        <Card className="p-6 mb-6">
          <div className="flex items-start gap-4 mb-6">
            <Mail className="w-6 h-6 text-sage-medium mt-1" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <Label htmlFor="emails-enabled" className="text-lg font-semibold">
                    All Emails
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Master switch for all accountability emails
                  </p>
                </div>
                <Switch
                  id="emails-enabled"
                  checked={emailsEnabled}
                  onCheckedChange={setEmailsEnabled}
                />
              </div>
            </div>
          </div>

          {emailsEnabled && (
            <div className="space-y-6 pl-10 border-l-2 border-sage-dim/30">
              <div className="flex items-start gap-4">
                <Bell className="w-5 h-5 text-sage-medium mt-1" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <Label htmlFor="follow-up" className="font-semibold">
                        Commitment Follow-Ups
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Receive check-ins 2-3 days after making a commitment
                      </p>
                    </div>
                    <Switch
                      id="follow-up"
                      checked={followUpEmails}
                      onCheckedChange={setFollowUpEmails}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <CheckCircle className="w-5 h-5 text-sage-medium mt-1" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <Label htmlFor="weekly" className="font-semibold">
                        Weekly Check-Ins
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Get a summary of your open commitments every Monday
                      </p>
                    </div>
                    <Switch
                      id="weekly"
                      checked={weeklyCheckIns}
                      onCheckedChange={setWeeklyCheckIns}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <AlertCircle className="w-5 h-5 text-sage-medium mt-1" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <Label htmlFor="overdue" className="font-semibold">
                        Overdue Alerts
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Be notified when commitments pass their deadline
                      </p>
                    </div>
                    <Switch
                      id="overdue"
                      checked={overdueAlerts}
                      onCheckedChange={setOverdueAlerts}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>

        {saveStatus === "success" && (
          <div className="mb-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-500">
            ✓ Preferences saved successfully
          </div>
        )}
        {saveStatus === "error" && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500">
            ✗ Failed to save preferences. Please try again.
          </div>
        )}

        <div className="flex gap-4">
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="flex-1"
          >
            {updateMutation.isPending && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            Save Preferences
          </Button>
          <Button variant="outline" asChild>
            <a href="/ai-coach/dashboard">Cancel</a>
          </Button>
        </div>

        <div className="mt-8 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> These preferences only affect accountability emails related to your coaching commitments. You'll still receive important account-related emails.
          </p>
        </div>
      </div>
    </div>
  );
}
