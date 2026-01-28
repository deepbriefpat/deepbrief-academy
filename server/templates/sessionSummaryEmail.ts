/**
 * Post-Session Summary Email Template
 * Sent after each coaching session to reinforce commitments and insights
 */

export interface SessionSummaryData {
  userName: string;
  sessionDate: string;
  commitments: Array<{
    action: string;
    context?: string;
    deadline?: string;
  }>;
  keyThemes: string[];
  patrickObservation: string;
  nextSessionPrompt: string;
}

export function generateSessionSummaryEmail(data: SessionSummaryData): string {
  const { userName, sessionDate, commitments, keyThemes, patrickObservation, nextSessionPrompt } = data;
  
  const commitmentsHtml = commitments.length > 0 
    ? commitments.map((c, i) => `
        <div style="margin-bottom: 16px; padding: 16px; background: #f8f9fa; border-left: 3px solid #D4AF37; border-radius: 4px;">
          <p style="margin: 0 0 8px 0; font-weight: 600; color: #0A1628;">${i + 1}. ${c.action}</p>
          ${c.context ? `<p style="margin: 0 0 8px 0; font-size: 14px; color: #64748b;">${c.context}</p>` : ''}
          ${c.deadline ? `<p style="margin: 0; font-size: 13px; color: #94a3b8;"><strong>Deadline:</strong> ${c.deadline}</p>` : ''}
        </div>
      `).join('')
    : '<p style="color: #64748b;">No specific commitments captured this session.</p>';

  const themesHtml = keyThemes.length > 0
    ? keyThemes.map(theme => `
        <li style="margin-bottom: 8px; color: #475569;">${theme}</li>
      `).join('')
    : '<li style="color: #64748b;">General coaching conversation</li>';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Coaching Session Summary</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f1f5f9;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 24px 40px; background: linear-gradient(135deg, #0A1628 0%, #1e3a5f 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; line-height: 1.3;">Your Session Summary</h1>
              <p style="margin: 8px 0 0 0; color: #D4AF37; font-size: 14px; font-weight: 500;">${sessionDate}</p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 32px 40px 24px 40px;">
              <p style="margin: 0; color: #0A1628; font-size: 16px; line-height: 1.6;">Hi ${userName},</p>
              <p style="margin: 16px 0 0 0; color: #475569; font-size: 16px; line-height: 1.6;">
                Here's what we covered in your last coaching session. Keep this somewhere you'll see it—accountability starts with remembering what you said you'd do.
              </p>
            </td>
          </tr>

          <!-- Commitments Section -->
          <tr>
            <td style="padding: 0 40px 32px 40px;">
              <h2 style="margin: 0 0 16px 0; color: #0A1628; font-size: 20px; font-weight: 700; border-bottom: 2px solid #D4AF37; padding-bottom: 8px;">
                Your Commitments
              </h2>
              ${commitmentsHtml}
            </td>
          </tr>

          <!-- Key Themes Section -->
          <tr>
            <td style="padding: 0 40px 32px 40px;">
              <h2 style="margin: 0 0 16px 0; color: #0A1628; font-size: 20px; font-weight: 700; border-bottom: 2px solid #D4AF37; padding-bottom: 8px;">
                Key Themes
              </h2>
              <ul style="margin: 0; padding-left: 24px;">
                ${themesHtml}
              </ul>
            </td>
          </tr>

          <!-- Patrick's Observation -->
          <tr>
            <td style="padding: 0 40px 32px 40px;">
              <div style="background: #f8f9fa; border-left: 4px solid #D4AF37; padding: 20px; border-radius: 4px;">
                <p style="margin: 0 0 8px 0; color: #D4AF37; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Patrick's Observation</p>
                <p style="margin: 0; color: #1e293b; font-size: 16px; line-height: 1.6; font-style: italic;">
                  "${patrickObservation}"
                </p>
              </div>
            </td>
          </tr>

          <!-- Next Session Prompt -->
          <tr>
            <td style="padding: 0 40px 32px 40px;">
              <h2 style="margin: 0 0 16px 0; color: #0A1628; font-size: 20px; font-weight: 700; border-bottom: 2px solid #D4AF37; padding-bottom: 8px;">
                Before Your Next Session
              </h2>
              <p style="margin: 0; color: #475569; font-size: 16px; line-height: 1.6;">
                ${nextSessionPrompt}
              </p>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 40px 40px 40px;" align="center">
              <a href="https://thedeepbrief.co.uk/ai-coach" style="display: inline-block; padding: 14px 32px; background-color: #D4AF37; color: #0A1628; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 6px; box-shadow: 0 2px 4px rgba(212, 175, 55, 0.3);">
                Continue Coaching
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 8px 0; color: #64748b; font-size: 13px; line-height: 1.5; text-align: center;">
                The Deep Brief · Clarity Under Pressure
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 12px; line-height: 1.5; text-align: center;">
                You're receiving this because you had a coaching session. 
                <a href="https://thedeepbrief.co.uk/settings" style="color: #D4AF37; text-decoration: none;">Manage preferences</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function generateSessionSummaryPlainText(data: SessionSummaryData): string {
  const { userName, sessionDate, commitments, keyThemes, patrickObservation, nextSessionPrompt } = data;
  
  let text = `YOUR SESSION SUMMARY\n${sessionDate}\n\n`;
  text += `Hi ${userName},\n\n`;
  text += `Here's what we covered in your last coaching session. Keep this somewhere you'll see it—accountability starts with remembering what you said you'd do.\n\n`;
  
  text += `YOUR COMMITMENTS\n${'='.repeat(50)}\n\n`;
  if (commitments.length > 0) {
    commitments.forEach((c, i) => {
      text += `${i + 1}. ${c.action}\n`;
      if (c.context) text += `   ${c.context}\n`;
      if (c.deadline) text += `   Deadline: ${c.deadline}\n`;
      text += `\n`;
    });
  } else {
    text += `No specific commitments captured this session.\n\n`;
  }
  
  text += `KEY THEMES\n${'='.repeat(50)}\n\n`;
  if (keyThemes.length > 0) {
    keyThemes.forEach(theme => {
      text += `• ${theme}\n`;
    });
  } else {
    text += `• General coaching conversation\n`;
  }
  text += `\n`;
  
  text += `PATRICK'S OBSERVATION\n${'='.repeat(50)}\n\n`;
  text += `"${patrickObservation}"\n\n`;
  
  text += `BEFORE YOUR NEXT SESSION\n${'='.repeat(50)}\n\n`;
  text += `${nextSessionPrompt}\n\n`;
  
  text += `Continue coaching: https://thedeepbrief.co.uk/ai-coach\n\n`;
  text += `---\n`;
  text += `The Deep Brief · Clarity Under Pressure\n`;
  text += `Manage preferences: https://thedeepbrief.co.uk/settings\n`;
  
  return text;
}
