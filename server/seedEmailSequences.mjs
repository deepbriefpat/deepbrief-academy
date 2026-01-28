/**
 * Seed email sequences into the database
 * Run with: node server/seedEmailSequences.mjs
 */

import mysql from "mysql2/promise";

const connection = await mysql.createConnection(process.env.DATABASE_URL);

const sequences = [
  {
    name: "Pressure Guide Welcome",
    triggerSource: "pressure_guide_modal",
    delayDays: 0,
    subject: "Your Pressure Management Guide is Ready",
    body: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>The Deep Brief</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #e0e6ed;
      background-color: #0a1628;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      border-bottom: 2px solid #c9a961;
      padding-bottom: 20px;
    }
    .logo {
      font-size: 18px;
      font-weight: 600;
      letter-spacing: 2px;
      color: #c9a961;
      text-transform: uppercase;
    }
    .content {
      background: #1a2942;
      padding: 30px;
      border-radius: 8px;
      border-left: 4px solid #c9a961;
    }
    h1 {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 32px;
      color: #c9a961;
      margin-top: 0;
      margin-bottom: 20px;
    }
    p {
      margin-bottom: 16px;
      color: #b8c5d6;
    }
    .cta {
      display: inline-block;
      background: #c9a961;
      color: #0a1628;
      padding: 14px 32px;
      text-decoration: none;
      border-radius: 4px;
      font-weight: 600;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #2a3f5f;
      font-size: 14px;
      color: #6b7c93;
    }
    .footer a {
      color: #c9a961;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">The Deep Brief</div>
    </div>
    <div class="content">
      <h1>Welcome to The Deep Brief</h1>
      <p>Thank you for your interest in understanding how pressure affects leadership clarity.</p>
      <p>I've prepared a comprehensive guide that breaks down the three patterns I see most often in founders and senior leaders who are performing well—but can feel their judgment starting to bend under pressure.</p>
      <p><strong>Inside the Pressure Management Guide:</strong></p>
      <ul style="color: #b8c5d6; margin-bottom: 20px;">
        <li>The "Thermocline Effect" – why pressure's impact is invisible until it's not</li>
        <li>Three early-warning signs that pressure is distorting your thinking</li>
        <li>A simple framework for building the peer support you actually need</li>
      </ul>
      <p>This isn't about stress management or resilience. It's about maintaining clear judgment when the stakes are high.</p>
      <a href="https://thedeepbrief.co.uk/resources/pressure-management-guide" class="cta">Download Your Guide</a>
      <p style="margin-top: 30px;">If you're curious about where pressure might be affecting <em>your</em> judgment specifically, the <a href="https://thedeepbrief.co.uk/assessment" style="color: #c9a961;">Pressure Audit</a> takes 8-10 minutes and gives you immediate, personalized results.</p>
      <p style="margin-top: 20px;">— Patrick</p>
    </div>
    <div class="footer">
      <p>You're receiving this because you subscribed at <a href="https://thedeepbrief.co.uk">thedeepbrief.co.uk</a></p>
      <p>© ${new Date().getFullYear()} The Deep Brief. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`,
    active: 1,
  },
  {
    name: "Nurture Day 3",
    triggerSource: "pressure_guide_modal",
    delayDays: 3,
    subject: "The pattern I see in every founder who waits too long",
    body: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>The Deep Brief</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #e0e6ed;
      background-color: #0a1628;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      border-bottom: 2px solid #c9a961;
      padding-bottom: 20px;
    }
    .logo {
      font-size: 18px;
      font-weight: 600;
      letter-spacing: 2px;
      color: #c9a961;
      text-transform: uppercase;
    }
    .content {
      background: #1a2942;
      padding: 30px;
      border-radius: 8px;
      border-left: 4px solid #c9a961;
    }
    h1 {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 32px;
      color: #c9a961;
      margin-top: 0;
      margin-bottom: 20px;
    }
    p {
      margin-bottom: 16px;
      color: #b8c5d6;
    }
    .cta {
      display: inline-block;
      background: #c9a961;
      color: #0a1628;
      padding: 14px 32px;
      text-decoration: none;
      border-radius: 4px;
      font-weight: 600;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #2a3f5f;
      font-size: 14px;
      color: #6b7c93;
    }
    .footer a {
      color: #c9a961;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">The Deep Brief</div>
    </div>
    <div class="content">
      <h1>They all say the same thing</h1>
      <p>"I wish I'd reached out six months earlier."</p>
      <p>Not because they were failing. They weren't. They were still performing, still delivering, still making it work.</p>
      <p>But something had shifted. Decision-making felt harder. Confidence felt thinner. The gap between "I've got this" and "I'm not sure anymore" was closing.</p>
      <p><strong>Here's what I've learned from working with 50+ founders and senior leaders:</strong></p>
      <p>The leaders who maintain clarity under pressure don't wait until they're drowning. They build the support structure <em>before</em> they need it.</p>
      <p>They recognize that isolation—even high-performing isolation—is a risk factor.</p>
      <p style="margin-top: 30px; padding: 20px; background: #0f1e35; border-left: 3px solid #c9a961; font-style: italic;">
        "I thought I just needed to push through. Patrick helped me see I was making decisions from a place I didn't recognize. Within two months, I had the clarity back—and a peer group I could actually be honest with."<br>
        <span style="font-size: 14px; color: #6b7c93;">— Tech Founder, Series B</span>
      </p>
      <p style="margin-top: 30px;">If you're curious whether this resonates with where you are right now, I'd be happy to talk.</p>
      <a href="https://thedeepbrief.co.uk/book-call" class="cta">Book a 30-Minute Call</a>
      <p style="margin-top: 20px; font-size: 14px; color: #6b7c93;">No pitch. Just a conversation about what you're navigating and whether I can help.</p>
    </div>
    <div class="footer">
      <p>You're receiving this because you subscribed at <a href="https://thedeepbrief.co.uk">thedeepbrief.co.uk</a></p>
      <p>© ${new Date().getFullYear()} The Deep Brief. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`,
    active: 1,
  },
  {
    name: "Nurture Day 7",
    triggerSource: "pressure_guide_modal",
    delayDays: 7,
    subject: "One last thing before I let you go",
    body: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>The Deep Brief</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #e0e6ed;
      background-color: #0a1628;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      border-bottom: 2px solid #c9a961;
      padding-bottom: 20px;
    }
    .logo {
      font-size: 18px;
      font-weight: 600;
      letter-spacing: 2px;
      color: #c9a961;
      text-transform: uppercase;
    }
    .content {
      background: #1a2942;
      padding: 30px;
      border-radius: 8px;
      border-left: 4px solid #c9a961;
    }
    h1 {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 32px;
      color: #c9a961;
      margin-top: 0;
      margin-bottom: 20px;
    }
    p {
      margin-bottom: 16px;
      color: #b8c5d6;
    }
    .cta {
      display: inline-block;
      background: #c9a961;
      color: #0a1628;
      padding: 14px 32px;
      text-decoration: none;
      border-radius: 4px;
      font-weight: 600;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #2a3f5f;
      font-size: 14px;
      color: #6b7c93;
    }
    .footer a {
      color: #c9a961;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">The Deep Brief</div>
    </div>
    <div class="content">
      <h1>You don't have to figure this out alone</h1>
      <p>Over the past week, I've shared insights about pressure, judgment, and the patterns I see in leaders who maintain clarity when it matters most.</p>
      <p>If any of this resonated—if you recognized yourself in the "still performing but something's shifting" description—I want to make one final offer.</p>
      <p><strong>The Clarity Under Pressure program</strong> is designed for founders and senior leaders who:</p>
      <ul style="color: #b8c5d6; margin-bottom: 20px;">
        <li>Are still performing well, but can feel judgment starting to bend</li>
        <li>Need a structured way to process decisions without the usual filters</li>
        <li>Want peer support that actually understands the depth they're operating at</li>
      </ul>
      <p>It's not coaching. It's not therapy. It's a partnership built around maintaining clarity when pressure is highest.</p>
      <p style="margin-top: 30px; padding: 20px; background: #0f1e35; border-left: 3px solid #c9a961;">
        <strong>What's included:</strong><br>
        • One-to-one sessions focused on your specific pressure points<br>
        • Access to a vetted peer group of founders at similar depth<br>
        • Real-time support when decisions feel unclear<br>
        • A structured framework for building lasting clarity
      </p>
      <a href="https://thedeepbrief.co.uk/clarity-under-pressure" class="cta">Learn More About the Program</a>
      <p style="margin-top: 30px;">If you'd rather just talk first, that works too.</p>
      <a href="https://thedeepbrief.co.uk/book-call" style="color: #c9a961; text-decoration: none;">Book a 30-minute call →</a>
      <p style="margin-top: 30px;">Either way, I hope the guide and these emails have been useful.</p>
      <p>— Patrick</p>
      <p style="margin-top: 20px; font-size: 14px; color: #6b7c93;">P.S. If you haven't taken the Pressure Audit yet, it's the fastest way to see where pressure might be affecting your judgment. <a href="https://thedeepbrief.co.uk/assessment" style="color: #c9a961;">Take it here</a> (8-10 minutes, immediate results).</p>
    </div>
    <div class="footer">
      <p>You're receiving this because you subscribed at <a href="https://thedeepbrief.co.uk">thedeepbrief.co.uk</a></p>
      <p>© ${new Date().getFullYear()} The Deep Brief. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`,
    active: 1,
  },
];

async function seed() {
  console.log("Seeding email sequences...");
  
  for (const sequence of sequences) {
    await connection.execute(
      `INSERT INTO email_sequences (name, trigger_source, delay_days, subject, body, active) VALUES (?, ?, ?, ?, ?, ?)`,
      [sequence.name, sequence.triggerSource, sequence.delayDays, sequence.subject, sequence.body, sequence.active]
    );
    console.log(`✓ Created sequence: ${sequence.name}`);
  }
  
  await connection.end();
  console.log("\nEmail sequences seeded successfully!");
  console.log("\nNext steps:");
  console.log("1. Test by subscribing via the email capture modal");
  console.log("2. Set up a daily cron job to run: node server/processEmails.mjs");
  process.exit(0);
}

seed().catch(err => {
  console.error("Error seeding sequences:", err);
  process.exit(1);
});
