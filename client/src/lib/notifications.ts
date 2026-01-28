/**
 * Browser Push Notification Utility
 * Handles requesting permissions and showing notifications for commitment deadlines
 */

export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) {
    console.warn("This browser does not support notifications");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
}

export function hasNotificationPermission(): boolean {
  return "Notification" in window && Notification.permission === "granted";
}

export function showCommitmentNotification(commitment: {
  id: number;
  title: string;
  dueDate: Date;
  hoursUntilDue: number;
}) {
  if (!hasNotificationPermission()) {
    return;
  }

  const urgencyText =
    commitment.hoursUntilDue <= 24
      ? "due in less than 24 hours"
      : `due in ${Math.floor(commitment.hoursUntilDue / 24)} days`;

  const notification = new Notification("Commitment Reminder", {
    body: `"${commitment.title}" is ${urgencyText}`,
    icon: "/favicon.ico",
    tag: `commitment-${commitment.id}`,
    requireInteraction: false,
    data: {
      commitmentId: commitment.id,
      url: "/ai-coach/dashboard?tab=commitments",
    },
  });

  notification.onclick = function (event) {
    event.preventDefault();
    window.focus();
    window.location.href = "/ai-coach/dashboard?tab=commitments";
    notification.close();
  };
}

/**
 * Check if any commitments are due soon and show notifications
 */
export function checkCommitmentDeadlines(commitments: Array<{
  id: number;
  title: string;
  dueDate: string | null;
  status: string;
}>) {
  if (!hasNotificationPermission()) {
    return;
  }

  const now = new Date();
  const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  commitments.forEach((commitment) => {
    if (!commitment.dueDate || commitment.status === "completed") {
      return;
    }

    const dueDate = new Date(commitment.dueDate);
    const hoursUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    // Show notification if due within 24 hours and not yet notified
    if (dueDate <= twentyFourHoursFromNow && hoursUntilDue > 0) {
      const notifiedKey = `notified-${commitment.id}-${commitment.dueDate}`;
      const alreadyNotified = localStorage.getItem(notifiedKey);

      if (!alreadyNotified) {
        showCommitmentNotification({
          id: commitment.id,
          title: commitment.title,
          dueDate,
          hoursUntilDue,
        });
        localStorage.setItem(notifiedKey, "true");
      }
    }
  });
}
