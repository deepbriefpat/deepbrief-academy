/**
 * Branded email templates for AI Coach commitment accountability
 * Uses The Deep Brief brand colors and styling
 */

const emailBaseStyle = `
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #0a1628;
      color: #e8eef7;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #0f1f3a;
      border: 1px solid #1e3a5f;
    }
    .header {
      background: linear-gradient(135deg, #1e3a5f 0%, #0f1f3a 100%);
      padding: 40px 30px;
      text-align: center;
      border-bottom: 2px solid #c9a961;
    }
    .logo {
      font-size: 24px;
      font-weight: 600;
      color: #c9a961;
      margin: 0;
      letter-spacing: 0.5px;
    }
    .tagline {
      font-size: 14px;
      color: #b8c5d6;
      margin: 8px 0 0 0;
    }
    .content {
      padding: 40px 30px;
    }
    h1 {
      color: #e8eef7;
      font-size: 24px;
      margin: 0 0 20px 0;
      font-weight: 600;
    }
    p {
      color: #b8c5d6;
      font-size: 16px;
      line-height: 1.6;
      margin: 0 0 16px 0;
    }
    .commitment-box {
      background-color: #1a2d4a;
      border-left: 4px solid #c9a961;
      padding: 20px;
      margin: 24px 0;
      border-radius: 4px;
    }
    .commitment-text {
      color: #e8eef7;
      font-size: 18px;
      font-weight: 500;
      margin: 0 0 12px 0;
    }
    .commitment-deadline {
      color: #c9a961;
      font-size: 14px;
      font-weight: 600;
      margin: 0;
    }
    .cta-button {
      display: inline-block;
      background-color: #4A6741;
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 16px;
      margin: 24px 0;
      transition: background-color 0.2s;
    }
    .cta-button:hover {
      background-color: #3d5635;
    }
    .footer {
      background-color: #0a1628;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #1e3a5f;
    }
    .footer p {
      color: #6b7c93;
      font-size: 14px;
      margin: 8px 0;
    }
    .footer a {
      color: #c9a961;
      text-decoration: none;
    }
    .stats {
      background-color: #1a2d4a;
      padding: 20px;
      margin: 24px 0;
      border-radius: 4px;
      text-align: center;
    }
    .stat-item {
      display: inline-block;
      margin: 0 20px;
    }
    .stat-number {
      color: #c9a961;
      font-size: 32px;
      font-weight: 700;
      display: block;
    }
    .stat-label {
      color: #b8c5d6;
      font-size: 14px;
      display: block;
      margin-top: 4px;
    }
  </style>
`;

const emailHeader = `
  <div class="header">
    <h2 class="logo">The Deep Brief</h2>
    <p class="tagline">Your Leadership Partner</p>
  </div>
`;

const getEmailFooter = (unsubscribeToken: string) => `
  <div class="footer">
    <p>This email was sent by your AI Executive Coach</p>
    <p><a href="https://thedeepbrief.co.uk/ai-coach/dashboard">View Dashboard</a> | <a href="https://thedeepbrief.co.uk">The Deep Brief</a></p>
    <p style="margin-top: 20px;"><a href="https://thedeepbrief.co.uk/email-preferences?token=${unsubscribeToken}">Manage Email Preferences</a> | <a href="https://thedeepbrief.co.uk/unsubscribe?token=${unsubscribeToken}">Unsubscribe</a></p>
    <p>© 2026 The Deep Brief. All rights reserved.</p>
  </div>
`;

/**
 * 2-3 Day Follow-Up Email Template
 */
export function generateFollowUpEmail(data: {
  userName: string;
  commitmentDescription: string;
  dueDate: Date | null;
  daysSinceCommitment: number;
  unsubscribeToken: string;
}): { subject: string; html: string } {
  const dueDateStr = data.dueDate
    ? new Date(data.dueDate).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "No deadline set";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Commitment Check-In</title>
      ${emailBaseStyle}
    </head>
    <body>
      <div class="email-container">
        ${emailHeader}
        
        <div class="content">
          <h1>How's it going, ${data.userName}?</h1>
          
          <p>It's been ${data.daysSinceCommitment} days since you made this commitment during our coaching session:</p>
          
          <div class="commitment-box">
            <p class="commitment-text">"${data.commitmentDescription}"</p>
            <p class="commitment-deadline">Deadline: ${dueDateStr}</p>
          </div>
          
          <p>I'm checking in to see how you're progressing. Sometimes the hardest part is just getting started—and you've already done that by making the commitment.</p>
          
          <p><strong>Quick reflection questions:</strong></p>
          <ul style="color: #b8c5d6; margin: 16px 0; padding-left: 20px;">
            <li style="margin-bottom: 8px;">Have you taken the first step yet?</li>
            <li style="margin-bottom: 8px;">What's one thing blocking you (if anything)?</li>
            <li style="margin-bottom: 8px;">Do you need to adjust the approach or timeline?</li>
          </ul>
          
          <p>Remember: Progress matters more than perfection. Even small steps count.</p>
          
          <a href="https://thedeepbrief.co.uk/ai-coach/dashboard" class="cta-button">Update Your Progress</a>
          
          <p style="margin-top: 32px; font-size: 14px; color: #6b7c93;">If you've already completed this commitment, great! Mark it complete in your dashboard so I can celebrate with you.</p>
        </div>
        
        ${getEmailFooter(data.unsubscribeToken)}
      </div>
    </body>
    </html>
  `;

  return {
    subject: `Check-in: "${data.commitmentDescription.substring(0, 50)}${data.commitmentDescription.length > 50 ? "..." : ""}"`,
    html,
  };
}

/**
 * Weekly Accountability Email Template
 */
export function generateWeeklyCheckInEmail(data: {
  userName: string;
  openCommitments: Array<{
    description: string;
    deadline: Date | null;
    daysSinceCreated: number;
  }>;
  unsubscribeToken: string;
}): { subject: string; html: string } {
  const commitmentsHtml = data.openCommitments
    .map(
      (c) => `
    <div class="commitment-box">
      <p class="commitment-text">"${c.description}"</p>
      <p class="commitment-deadline">
        ${c.deadline ? `Deadline: ${new Date(c.deadline).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}` : "No deadline"}
        · Made ${c.daysSinceCreated} days ago
      </p>
    </div>
  `
    )
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Weekly Accountability Check-In</title>
      ${emailBaseStyle}
    </head>
    <body>
      <div class="email-container">
        ${emailHeader}
        
        <div class="content">
          <h1>Weekly Check-In: ${data.userName}</h1>
          
          <p>It's Monday—time for your weekly accountability check-in. Let's review what you committed to and see where you stand.</p>
          
          <div class="stats">
            <div class="stat-item">
              <span class="stat-number">${data.openCommitments.length}</span>
              <span class="stat-label">Open Commitments</span>
            </div>
          </div>
          
          <h2 style="color: #e8eef7; font-size: 20px; margin: 32px 0 16px 0;">Your Active Commitments:</h2>
          
          ${commitmentsHtml}
          
          <p style="margin-top: 32px;"><strong>This week's focus:</strong></p>
          <p>Pick ONE commitment from the list above and make meaningful progress on it this week. Don't try to do everything—just move one thing forward.</p>
          
          <p>What's the smallest next step you can take today?</p>
          
          <a href="https://thedeepbrief.co.uk/ai-coach/dashboard" class="cta-button">Review & Update</a>
          
          <p style="margin-top: 32px; font-size: 14px; color: #6b7c93;">Accountability isn't about pressure—it's about keeping your word to yourself. You've got this.</p>
        </div>
        
        ${getEmailFooter(data.unsubscribeToken)}
      </div>
    </body>
    </html>
  `;

  return {
    subject: `Weekly Check-In: ${data.openCommitments.length} Active Commitment${data.openCommitments.length !== 1 ? "s" : ""}`,
    html,
  };
}

/**
 * Overdue Alert Email Template
 */
export function generateOverdueAlertEmail(data: {
  userName: string;
  overdueCommitments: Array<{
    description: string;
    deadline: Date;
    daysOverdue: number;
  }>;
  unsubscribeToken: string;
}): { subject: string; html: string } {
  const commitmentsHtml = data.overdueCommitments
    .map(
      (c) => `
    <div class="commitment-box">
      <p class="commitment-text">"${c.description}"</p>
      <p class="commitment-deadline" style="color: #e74c3c;">
        Was due: ${new Date(c.deadline).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        · ${c.daysOverdue} days overdue
      </p>
    </div>
  `
    )
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Overdue Commitment Alert</title>
      ${emailBaseStyle}
    </head>
    <body>
      <div class="email-container">
        ${emailHeader}
        
        <div class="content">
          <h1>Commitment Alert: ${data.userName}</h1>
          
          <p>You have ${data.overdueCommitments.length} commitment${data.overdueCommitments.length !== 1 ? "s" : ""} that ${data.overdueCommitments.length !== 1 ? "have" : "has"} passed ${data.overdueCommitments.length !== 1 ? "their" : "its"} deadline.</p>
          
          <p>This isn't about judgment—it's about clarity. Let's figure out what to do next.</p>
          
          ${commitmentsHtml}
          
          <p style="margin-top: 32px;"><strong>Three options to consider:</strong></p>
          
          <ol style="color: #b8c5d6; margin: 16px 0; padding-left: 20px;">
            <li style="margin-bottom: 12px;"><strong style="color: #e8eef7;">Complete it now:</strong> If it's still important and doable, set a new realistic deadline and finish it.</li>
            <li style="margin-bottom: 12px;"><strong style="color: #e8eef7;">Adjust the commitment:</strong> Maybe the original plan wasn't realistic. What would a more achievable version look like?</li>
            <li style="margin-bottom: 12px;"><strong style="color: #e8eef7;">Let it go:</strong> If circumstances changed or it's no longer relevant, that's okay. Close it out and move on.</li>
          </ol>
          
          <p>The worst thing you can do is ignore it. Make a decision—any decision—and move forward.</p>
          
          <a href="https://thedeepbrief.co.uk/ai-coach/dashboard" class="cta-button">Take Action</a>
          
          <p style="margin-top: 32px; font-size: 14px; color: #6b7c93;">Missed deadlines happen. What matters is how you respond. Let's get this sorted.</p>
        </div>
        
        ${getEmailFooter(data.unsubscribeToken)}
      </div>
    </body>
    </html>
  `;

  return {
    subject: `⚠️ Overdue: ${data.overdueCommitments.length} Commitment${data.overdueCommitments.length !== 1 ? "s" : ""} Need Attention`,
    html,
  };
}
