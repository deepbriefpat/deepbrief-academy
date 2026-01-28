/**
 * Tactical Scenario Templates
 * 
 * Specific, high-stakes situations that leaders face.
 * These replace generic conversation starters with surgical, situation-specific prompts.
 */

export interface TacticalTemplate {
  id: string;
  title: string;
  category: "people" | "money" | "strategy" | "crisis" | "growth" | "identity" | "power" | "pressure" | "trust" | "self-leadership";
  situation: string;
  prompt: string;
  icon: string;
  tags: string[];
  depth?: "pressure-scenario" | "leadership-identity" | "scaling-moment" | "founder-psychology"; // Optional depth marker
}

export const tacticalTemplates: TacticalTemplate[] = [
  {
    id: "fire-someone-you-like",
    title: "Firing Someone You Like",
    category: "people",
    situation: "You need to let someone go who you genuinely care about, but they're not performing.",
    prompt: "I need to fire someone I actually like. They're a good person, but they're not delivering. I keep finding reasons to delay the conversation. The team knows it needs to happen. I know it needs to happen. But I'm stuck.",
    icon: "👤",
    tags: ["termination", "difficult conversations", "performance management", "people decisions"]
  },
  {
    id: "equity-conversation",
    title: "Equity Negotiation with Co-Founder",
    category: "money",
    situation: "You need to renegotiate equity split with a co-founder who isn't pulling their weight.",
    prompt: "My co-founder and I split equity 50/50 at the start. But I'm doing 80% of the work now. I need to have the equity conversation, but I'm worried it'll blow up the partnership. How do I approach this without destroying the relationship?",
    icon: "💰",
    tags: ["equity", "co-founder conflict", "difficult conversations", "partnership issues"]
  },
  {
    id: "board-losing-control",
    title: "Board Meeting Going Sideways",
    category: "crisis",
    situation: "Your board meeting is tomorrow and you're losing control of the narrative.",
    prompt: "I have a board meeting in 24 hours. The numbers aren't good. I can feel them losing confidence. I need to walk in with clarity, not panic. What's the play here?",
    icon: "📊",
    tags: ["board management", "crisis communication", "investor relations", "bad news"]
  },
  {
    id: "investor-update-bad-news",
    title: "Investor Update with Bad Numbers",
    category: "money",
    situation: "You need to send an investor update but the metrics are declining.",
    prompt: "I need to send my monthly investor update. Revenue is down 15%. Churn is up. I know I need to be transparent, but I'm worried about triggering a down round or losing their confidence. How do I frame this without sugarcoating or catastrophizing?",
    icon: "📉",
    tags: ["investor relations", "bad news", "transparency", "fundraising"]
  },
  {
    id: "out-of-runway",
    title: "Telling Team About Runway",
    category: "crisis",
    situation: "You need to tell your team you're running out of money.",
    prompt: "We have 4 months of runway left. The team doesn't know yet. I need to tell them without causing mass panic or resignations. But I also can't lie. What's the right way to have this conversation?",
    icon: "⏰",
    tags: ["crisis communication", "transparency", "team management", "runway", "bad news"]
  },
  {
    id: "confront-cofounder-performance",
    title: "Co-Founder Performance Issue",
    category: "people",
    situation: "Your co-founder isn't performing but you're afraid to address it.",
    prompt: "My co-founder is checked out. They're not delivering. The team sees it. I see it. But we've been through everything together. How do I have this conversation without ending the friendship or the company?",
    icon: "🤝",
    tags: ["co-founder conflict", "performance management", "difficult conversations", "partnership issues"]
  },
  {
    id: "negotiate-own-compensation",
    title: "Negotiating Your Own Comp",
    category: "money",
    situation: "You need to ask the board for a raise but feel guilty about it.",
    prompt: "I've been underpaying myself for 2 years. The company can afford to pay me market rate now. But I feel guilty asking the board when we're still not profitable. How do I approach this conversation?",
    icon: "💵",
    tags: ["compensation", "board management", "self-advocacy", "founder salary"]
  },
  {
    id: "pivot-or-persist",
    title: "Pivot vs Persist Decision",
    category: "strategy",
    situation: "You're not sure if you should pivot the product or keep pushing.",
    prompt: "We've been at this for 18 months. Traction is slow. Some customers love it, but not enough. The team is asking if we should pivot. I don't know if I'm being stubborn or strategic. How do I think through this clearly?",
    icon: "🔄",
    tags: ["strategy", "product decisions", "pivot", "traction", "decision-making"]
  },
  {
    id: "toxic-high-performer",
    title: "Managing Toxic High Performer",
    category: "people",
    situation: "Your best performer is destroying team morale.",
    prompt: "My top salesperson brings in 40% of revenue. But they're toxic. The team is miserable. Two people have quit because of them. I know I need to act, but I'm terrified of losing the revenue. What's the right move?",
    icon: "⚠️",
    tags: ["performance management", "team culture", "difficult conversations", "termination", "toxic behavior"]
  },
  {
    id: "bad-news-key-client",
    title: "Delivering Bad News to Client",
    category: "crisis",
    situation: "You need to tell a key client about a major delay or failure.",
    prompt: "We missed a critical deadline for our biggest client. They're going to be furious. I need to call them today. How do I deliver this news without losing the account?",
    icon: "📞",
    tags: ["client management", "bad news", "crisis communication", "account retention"]
  },
  {
    id: "pr-crisis",
    title: "Handling Public PR Crisis",
    category: "crisis",
    situation: "Your company is facing public criticism or a PR disaster.",
    prompt: "We're getting hammered on Twitter. A customer posted about a bad experience and it's going viral. The team is panicking. I need to respond in the next 2 hours. What do I say?",
    icon: "🔥",
    tags: ["crisis communication", "public relations", "reputation management", "social media"]
  },
  {
    id: "unsure-hire",
    title: "Making an Uncertain Hire",
    category: "people",
    situation: "You need to make a hiring decision but you're not confident about the candidate.",
    prompt: "I have to decide on a VP of Engineering hire by Friday. They're good, but not great. I'm worried we're settling because we're desperate. But we also can't wait another 3 months. How do I think through this?",
    icon: "🎯",
    tags: ["hiring", "decision-making", "leadership hiring", "recruiting"]
  },
  {
    id: "fire-founding-team",
    title: "Letting Go of Founding Team Member",
    category: "people",
    situation: "You need to let go of someone who was there from day one.",
    prompt: "One of our first 5 employees isn't scaling with the company. They were critical in the early days, but now they're a bottleneck. I owe them everything. But I also owe the company its best chance. How do I handle this?",
    icon: "👥",
    tags: ["termination", "founding team", "difficult conversations", "scaling challenges", "loyalty"]
  },
  {
    id: "hostile-acquisition",
    title: "Responding to Acquisition Offer",
    category: "strategy",
    situation: "You received an acquisition offer but you're conflicted about selling.",
    prompt: "We got an acquisition offer. It's life-changing money for me personally. But I think we could be worth 10x in 3 years. My co-founder wants to sell. The team doesn't know. How do I think through this decision clearly?",
    icon: "🏢",
    tags: ["acquisition", "exit strategy", "decision-making", "co-founder conflict", "valuation"]
  },
  {
    id: "morale-after-layoffs",
    title: "Rebuilding After Layoffs",
    category: "people",
    situation: "You just did layoffs and need to rebuild team morale.",
    prompt: "We just let go of 30% of the team. The survivors are shell-shocked. Productivity is down. Trust is broken. I need to rebuild morale without making empty promises. What do I actually say and do?",
    icon: "💔",
    tags: ["layoffs", "team morale", "crisis management", "trust building", "leadership"]
  },
  {
    id: "performance-review-conflict",
    title: "Difficult Performance Review",
    category: "people",
    situation: "You need to deliver a tough performance review to a long-tenured employee.",
    prompt: "I have a performance review tomorrow with someone who's been here 8 years. Their performance has declined significantly. They think they're doing great. I need to be honest without destroying them. How do I approach this?",
    icon: "📋",
    tags: ["performance review", "difficult conversations", "performance management", "feedback"]
  },
  {
    id: "budget-cut-decision",
    title: "Making Budget Cut Decisions",
    category: "money",
    situation: "You need to cut 20% from your department budget and decide where.",
    prompt: "Finance just told me I need to cut 20% from my budget. I can either cut headcount, delay projects, or reduce quality. Every option hurts. How do I think through this systematically?",
    icon: "✂️",
    tags: ["budget cuts", "resource allocation", "decision-making", "trade-offs"]
  },
  {
    id: "team-restructure",
    title: "Announcing Team Restructure",
    category: "people",
    situation: "You need to announce a major team restructure that will upset people.",
    prompt: "We're restructuring the department. Some people are getting promoted, others are losing direct reports. I need to announce this next week. The team is going to be angry. How do I communicate this without losing good people?",
    icon: "🔄",
    tags: ["restructuring", "change management", "team communication", "organizational change"]
  },
  {
    id: "stakeholder-conflict",
    title: "Managing Stakeholder Conflict",
    category: "strategy",
    situation: "Two senior stakeholders want opposite things and you're caught in the middle.",
    prompt: "The CEO wants us to move faster. The CFO wants us to cut costs. I'm stuck in the middle. Both are right from their perspective. I need to navigate this without picking sides. What's my play?",
    icon: "⚖️",
    tags: ["stakeholder management", "conflict resolution", "executive alignment", "politics"]
  },
  {
    id: "underperforming-manager",
    title: "Managing an Underperforming Manager",
    category: "people",
    situation: "One of your managers isn't developing their team and you need to address it.",
    prompt: "One of my managers is technically strong but terrible at developing people. Their team is stagnating. I've given feedback before but nothing's changed. I need to escalate this conversation. How do I do it?",
    icon: "👔",
    tags: ["manager development", "performance management", "leadership coaching", "difficult conversations"]
  },
  {
    id: "cross-functional-deadlock",
    title: "Breaking Cross-Functional Deadlock",
    category: "strategy",
    situation: "Your team and another department are deadlocked on a critical decision.",
    prompt: "We've been stuck in meetings for 3 weeks. My team and Product can't agree on priorities. We're both dug in. The project is stalled. I need to break this deadlock without escalating to the CEO. How?",
    icon: "🤝",
    tags: ["cross-functional collaboration", "conflict resolution", "decision-making", "negotiation"]
  },
  {
    id: "promotion-decision",
    title: "Choosing Between Two Promotion Candidates",
    category: "people",
    situation: "You have two strong candidates for one promotion and need to choose.",
    prompt: "I have one director role and two strong candidates. One is more experienced, the other has more potential. Both deserve it. I can only promote one. How do I make this decision and handle the conversation with the person who doesn't get it?",
    icon: "🎯",
    tags: ["promotions", "talent management", "difficult decisions", "career development"]
  },
  {
    id: "remote-team-performance",
    title: "Addressing Remote Team Performance Issues",
    category: "people",
    situation: "Your remote team's performance is slipping and you can't see what's happening.",
    prompt: "Since going remote, I can't tell what's really happening with my team. Productivity feels down. Communication is fragmented. I don't want to micromanage, but I also can't ignore this. How do I address it?",
    icon: "💻",
    tags: ["remote management", "performance management", "team productivity", "visibility"]
  },
  {
    id: "executive-presentation-pushback",
    title: "Handling Executive Pushback on Your Proposal",
    category: "strategy",
    situation: "You're presenting a major initiative to executives and expect resistance.",
    prompt: "I'm presenting a proposal to the executive team tomorrow. I know the CFO is going to push back hard on the cost. I need to defend this without getting defensive. How do I prepare for the objections?",
    icon: "📊",
    tags: ["executive communication", "presentations", "stakeholder management", "influence"]
  },
  {
    id: "inherited-problem-team",
    title: "Fixing an Inherited Dysfunctional Team",
    category: "people",
    situation: "You just took over a team with serious performance and culture issues.",
    prompt: "I just inherited a team that's a mess. Low morale, missed deadlines, toxic dynamics. The previous manager let it slide. I need to turn this around fast without being the bad guy. Where do I start?",
    icon: "🔧",
    tags: ["team turnaround", "change management", "leadership transition", "culture fix"]
  },
  // Identity, Loneliness, and Inner Load
  {
    id: "carrying-whole-thing-alone",
    title: "Carrying the Whole Thing Alone",
    category: "identity",
    situation: "You're the final decision-maker and there's no one you can fully speak to.",
    prompt: "I'm the one who has to decide everything. And there's no one I can actually talk to about it. Not really. People want answers from me, not questions. I'm carrying the whole thing and I don't know who carries me.",
    icon: "🎯",
    tags: ["founder isolation", "decision fatigue", "leadership psychology"],
    depth: "founder-psychology"
  },
  {
    id: "leadership-not-worth-it",
    title: "When Leadership Stops Feeling Worth It",
    category: "identity",
    situation: "You're questioning whether the cost of leading is still acceptable.",
    prompt: "I'm starting to wonder if this is worth it. The stress, the responsibility, the constant weight. I used to love this. Now I'm just tired. I don't know if I'm burning out or if I've outgrown the role.",
    icon: "🔥",
    tags: ["burnout", "meaning", "leadership endurance"],
    depth: "founder-psychology"
  },
  {
    id: "imposter-after-success",
    title: "Imposter Syndrome After Success",
    category: "identity",
    situation: "The business is working but you feel exposed, not confident.",
    prompt: "The company is doing well. People think I know what I'm doing. But I feel like I'm faking it. Every success feels like luck. I'm waiting for someone to figure out I don't belong here.",
    icon: "🎭",
    tags: ["identity", "confidence", "psychological safety"],
    depth: "leadership-identity"
  },
  {
    id: "miss-being-operator",
    title: "When You Miss Being an Operator",
    category: "identity",
    situation: "You've grown out of the work you were good at and now feel detached.",
    prompt: "I used to build things. Now I manage people who build things. I'm good at it, but I don't love it. I miss the work that made me feel competent. Now I just feel distant from what actually matters.",
    icon: "🔧",
    tags: ["founder transition", "role evolution", "control"],
    depth: "leadership-identity"
  },
  // Power, Authority, and Control
  {
    id: "authority-without-villain",
    title: "Using Authority Without Becoming the Villain",
    category: "power",
    situation: "You need to make a hard call without hiding behind consensus.",
    prompt: "I need to make a decision that people won't like. I can't hide behind consensus this time. But I also don't want to be the dictator. How do I use my authority without becoming the person everyone resents?",
    icon: "⚡",
    tags: ["authority", "accountability", "leadership presence"],
    depth: "scaling-moment"
  },
  {
    id: "agree-too-quickly",
    title: "When People Agree With You Too Quickly",
    category: "power",
    situation: "You suspect your title is killing honest debate.",
    prompt: "People keep agreeing with me in meetings. Too quickly. I can feel it—they're not actually thinking, they're just deferring. My title is killing the debate. How do I get people to actually challenge me?",
    icon: "🤐",
    tags: ["power dynamics", "psychological safety"],
    depth: "scaling-moment"
  },
  {
    id: "control-without-standards",
    title: "Letting Go of Control Without Losing Standards",
    category: "power",
    situation: "Delegation is happening, quality is slipping, resentment is building.",
    prompt: "I'm trying to delegate. But the quality isn't there. I keep stepping back in. The team feels micromanaged. I feel resentful. I don't know how to let go without watching everything fall apart.",
    icon: "🎚️",
    tags: ["delegation", "trust", "standards"],
    depth: "scaling-moment"
  },
  {
    id: "name-is-bottleneck",
    title: "When Your Name Is the Bottleneck",
    category: "power",
    situation: "Every decision still comes back to you and it's killing momentum.",
    prompt: "Everything still comes to me. 'Let's check with [my name].' 'We need [my name]'s approval.' I'm the bottleneck. I've tried to push decisions down, but they keep coming back. How do I actually let go?",
    icon: "🚧",
    tags: ["scaling leadership", "decision rights"],
    depth: "scaling-moment"
  },
  // Pressure Moments That Break Companies
  {
    id: "deciding-to-shut-down",
    title: "Deciding Whether to Shut It Down",
    category: "pressure",
    situation: "You're not failing yet, but you can see the edge.",
    prompt: "We're not dead yet. But I can see the edge from here. The numbers aren't catastrophic, but they're not good. I don't know if I'm being realistic or giving up too early. How do I think through whether to keep going or shut it down?",
    icon: "🛑",
    tags: ["existential decisions", "founder judgement"],
    depth: "pressure-scenario"
  },
  {
    id: "numbers-changed-everything",
    title: "The Day the Numbers Changed Everything",
    category: "pressure",
    situation: "A single metric shift has altered reality overnight.",
    prompt: "One number changed and now everything is different. Yesterday we were growing. Today we're in crisis mode. I need to recalibrate fast, but I'm still processing what just happened.",
    icon: "📉",
    tags: ["financial pressure", "clarity under pressure"],
    depth: "pressure-scenario"
  },
  {
    id: "growth-creates-chaos",
    title: "When Growth Creates Chaos",
    category: "pressure",
    situation: "Success has outrun systems, culture, and capability.",
    prompt: "We're growing fast. Which should be good. But it feels like chaos. Systems are breaking. Culture is fragmenting. People are overwhelmed. Success is killing us. How do I stabilize without killing momentum?",
    icon: "🌪️",
    tags: ["scaling pain", "organisational design"],
    depth: "scaling-moment"
  },
  {
    id: "hired-ahead-of-yourself",
    title: "Realising You Hired Ahead of Yourself",
    category: "pressure",
    situation: "Senior hire, wrong timing, high cost, big ego.",
    prompt: "I hired someone more experienced than me. I thought that's what we needed. But now they're undermining me. Questioning every decision. The team is confused about who's in charge. I think I made a mistake.",
    icon: "🎪",
    tags: ["hiring mistakes", "leadership maturity"],
    depth: "scaling-moment"
  },
  // Trust, Loyalty, and Betrayal
  {
    id: "backed-someone-let-down",
    title: "When Someone You Backed Lets You Down",
    category: "trust",
    situation: "The breach isn't performance, it's trust.",
    prompt: "I went to bat for them. Defended them. Gave them chances others didn't get. And they betrayed that trust. Not by failing—by lying. I don't know if I can come back from this.",
    icon: "💔",
    tags: ["trust repair", "emotional leadership"],
    depth: "founder-psychology"
  },
  {
    id: "keeping-for-loyalty",
    title: "Keeping Someone for Loyalty, Not Impact",
    category: "trust",
    situation: "You know the reason they're still here.",
    prompt: "They were there from the beginning. They believed when no one else did. But they're not growing with the company. I'm keeping them out of loyalty, not performance. And it's starting to hurt the team.",
    icon: "🤝",
    tags: ["loyalty bias", "tough calls"],
    depth: "founder-psychology"
  },
  {
    id: "senior-leader-politics",
    title: "When a Senior Leader Starts Playing Politics",
    category: "trust",
    situation: "The behaviour is subtle but corrosive.",
    prompt: "One of my senior leaders is playing politics. It's subtle—undermining in private, positioning themselves, building alliances. It's poisoning the culture. But I don't have hard evidence. How do I address this?",
    icon: "🎭",
    tags: ["power", "culture", "ethics"],
    depth: "scaling-moment"
  },
  // Board, Investors, and External Pressure
  {
    id: "board-optimising-exit",
    title: "Managing a Board That's Optimising for Exit, Not Reality",
    category: "pressure",
    situation: "Different clocks. Different incentives.",
    prompt: "My board wants an exit in 18 months. I think we need 3 years to build something real. They're optimising for their fund timeline. I'm optimising for the business. We're misaligned and I don't know how to bridge it.",
    icon: "⏰",
    tags: ["governance", "misalignment"],
    depth: "pressure-scenario"
  },
  {
    id: "investors-lose-confidence",
    title: "When Investors Lose Confidence in You",
    category: "pressure",
    situation: "Nothing explicit. Everything implied.",
    prompt: "I can feel my investors losing confidence. No one's said anything directly. But the tone has changed. The questions are sharper. The silence is longer. I need to address this before it becomes a real problem.",
    icon: "📊",
    tags: ["credibility", "executive presence"],
    depth: "pressure-scenario"
  },
  {
    id: "say-no-powerful-stakeholder",
    title: "Saying No to a Powerful Stakeholder",
    category: "power",
    situation: "The ask crosses a line you don't want to cross.",
    prompt: "A powerful stakeholder wants something that crosses a line for me. It's not illegal, but it's not right. I need to say no. But I'm worried about the consequences. How do I hold the boundary without blowing up the relationship?",
    icon: "🚫",
    tags: ["boundaries", "values"],
    depth: "pressure-scenario"
  },
  // Self-Leadership Under Sustained Pressure
  {
    id: "emotionally-flooded",
    title: "Operating While Emotionally Flooded",
    category: "self-leadership",
    situation: "You're still functional but judgement is bending.",
    prompt: "I'm holding it together on the outside. But inside I'm flooded. Anxious. Reactive. I can feel my judgment bending. I'm making decisions from a bad place. How do I regain clarity when I can't afford to stop?",
    icon: "🌊",
    tags: ["pressure distortion", "emotional regulation"],
    depth: "founder-psychology"
  },
  {
    id: "calm-feels-like-complacency",
    title: "When Calm Feels Like Complacency",
    category: "self-leadership",
    situation: "You're worried that slowing down means falling behind.",
    prompt: "I can't slow down. Every time I try to pause, I feel like I'm falling behind. Calm feels like complacency. But I know I'm burning out. How do I rest without feeling like I'm giving up?",
    icon: "⚖️",
    tags: ["nervous system", "performance myths"],
    depth: "founder-psychology"
  },
  {
    id: "recovering-bad-call",
    title: "Recovering After a Bad Leadership Call",
    category: "self-leadership",
    situation: "You were wrong. Publicly.",
    prompt: "I made a bad call. Publicly. People saw it. I was wrong and now I need to recover credibility without being defensive. How do I own it and move forward without losing authority?",
    icon: "🔄",
    tags: ["recovery", "credibility", "resilience"],
    depth: "leadership-identity"
  }
];

export const getTacticalTemplatesByCategory = (category: TacticalTemplate["category"]) => {
  return tacticalTemplates.filter(t => t.category === category);
};

export const getTacticalTemplateById = (id: string) => {
  return tacticalTemplates.find(t => t.id === id);
};
