import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Mail, Loader2 } from "lucide-react";

export function TestEmail() {
  const sendTestEmailMutation = trpc.aiCoach.testEmail.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(`Test email sent successfully to ${data.email}`);
      } else {
        toast.error(`Failed to send test email to ${data.email}`);
      }
    },
    onError: (error) => {
      toast.error(`Failed to send test email: ${error.message}`);
    },
  });

  return (
    <div className="container max-w-2xl py-12">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Test Email Functionality
          </CardTitle>
          <CardDescription>
            Click the button below to send a test welcome email to your registered email address.
            Check your inbox (and spam folder) to verify email delivery is working.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => sendTestEmailMutation.mutate()}
            disabled={sendTestEmailMutation.isPending}
            size="lg"
            className="w-full"
          >
            {sendTestEmailMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending Test Email...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Send Test Email
              </>
            )}
          </Button>

          {sendTestEmailMutation.data && (
            <div className={`p-4 rounded-lg border ${
              sendTestEmailMutation.data.success 
                ? "bg-green-50 border-green-200 text-green-800" 
                : "bg-red-50 border-red-200 text-red-800"
            }`}>
              <p className="text-sm font-medium">
                {sendTestEmailMutation.data.success 
                  ? `Test email sent to ${sendTestEmailMutation.data.email}` 
                  : `Failed to send email to ${sendTestEmailMutation.data.email}`}
              </p>
              {sendTestEmailMutation.data.success && (
                <p className="text-xs mt-2 text-green-700">
                  If you don't see the email within a few minutes, check your spam folder.
                </p>
              )}
            </div>
          )}

          <div className="text-sm text-muted-foreground space-y-2 pt-4 border-t">
            <p className="font-medium">Troubleshooting:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Check your spam/junk folder</li>
              <li>Verify your email address is correct in your profile</li>
              <li>Wait 2-3 minutes for email delivery</li>
              <li>Check server logs for error messages</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
