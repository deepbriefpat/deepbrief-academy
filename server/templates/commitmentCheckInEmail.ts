/**
 * Commitment Check-In Email Template
 * 
 * Sent 3 days after a commitment is made to remind users and encourage progress updates.
 */

export interface CommitmentCheckInData {
  userName: string;
  commitmentText: string;
  deadline: string;
  commitmentId: number;
  progressUpdateUrl: string;
}

export function generateCommitmentCheckInEmail(data: CommitmentCheckInData): {
  subject: string;
  htmlBody: string;
  textBody: string;
} {
  const subject = `How's it going with: "${data.commitmentText}"?`;

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Commitment Check-In</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #2C2C2C; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <div style="background: linear-gradient(135deg, #4A6741 0%, #2C2C2C 100%); padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
    <h1 style="color: #FDFCF8; margin: 0; font-size: 24px; font-weight: 600;">Commitment Check-In</h1>
  </div>
  
  <div style="background: #FDFCF8; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #E5E5E0; border-top: none;">
    
    <p style="font-size: 16px; margin-bottom: 20px;">Hey ${data.userName},</p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">Three days ago, you committed to:</p>
    
    <div style="background: #F2F0E9; padding: 20px; border-left: 4px solid #4A6741; margin: 20px 0; border-radius: 4px;">
      <p style="font-size: 16px; font-weight: 600; margin: 0; color: #2C2C2C;">"${data.commitmentText}"</p>
      ${data.deadline ? `<p style="font-size: 14px; color: #6B6B60; margin: 10px 0 0 0;">Deadline: ${data.deadline}</p>` : ''}
    </div>
    
    <p style="font-size: 16px; margin-bottom: 20px;">How's it going?</p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">This isn't about perfection. It's about momentum. Even small progress counts.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.progressUpdateUrl}" style="display: inline-block; background: #4A6741; color: #FDFCF8; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">Update Your Progress</a>
    </div>
    
    <p style="font-size: 14px; color: #6B6B60; margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E5E0;">
      <strong>Why this matters:</strong> Leaders who track commitments are 3x more likely to follow through. This check-in is your accountability partner.
    </p>
    
    <p style="font-size: 14px; color: #6B6B60; margin-top: 20px;">
      — Patrick & The Deep Brief Team
    </p>
    
  </div>
  
  <div style="text-align: center; margin-top: 20px; padding: 20px; color: #6B6B60; font-size: 12px;">
    <p style="margin: 5px 0;">The Deep Brief | Leadership Clarity Under Pressure</p>
    <p style="margin: 5px 0;">
      <a href="https://thedeepbrief.com" style="color: #4A6741; text-decoration: none;">Visit Website</a> | 
      <a href="https://thedeepbrief.com/ai-coach" style="color: #4A6741; text-decoration: none;">AI Coach</a>
    </p>
  </div>
  
</body>
</html>
  `;

  const textBody = `
Hey ${data.userName},

Three days ago, you committed to:

"${data.commitmentText}"
${data.deadline ? `Deadline: ${data.deadline}` : ''}

How's it going?

This isn't about perfection. It's about momentum. Even small progress counts.

Update your progress here: ${data.progressUpdateUrl}

Why this matters: Leaders who track commitments are 3x more likely to follow through. This check-in is your accountability partner.

— Patrick & The Deep Brief Team

The Deep Brief | Leadership Clarity Under Pressure
Visit: https://thedeepbrief.com
  `.trim();

  return { subject, htmlBody, textBody };
}
