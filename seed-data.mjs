import { drizzle } from 'drizzle-orm/mysql2';
import { resources, stories, testimonials } from './drizzle/schema.js';

const db = drizzle(process.env.DATABASE_URL);

const sampleResources = [
  {
    title: "The Buddy Check: Why High Performers Need Support",
    slug: "buddy-check-high-performers",
    excerpt: "Every dive starts with a buddy check. At depth, a loose strap becomes a crisis. In leadership, the strongest performers often get the least support.",
    content: `# The Buddy Check: Why High Performers Need Support

Every dive starts with a buddy check.

Air on. Releases clear. Mask sealed. Weight secure.

You don't skip it because you're experienced. You do it because experience taught you what happens when you don't.

At depth, a loose strap becomes a crisis. A sticky valve becomes a decision you shouldn't have to make.

So divers check each other. Every time. No exceptions for the senior diver. No shortcuts for the one who's "done this a thousand times."

## In Leadership, We Skip This Entirely

The more competent you become, the less anyone checks on you. Silence gets mistaken for strength. Track record becomes an excuse for everyone to stop watching.

I learned this the hard way on a dive off Durban. My team left me behind at 60 metres. Not because they were careless. Because they assumed I couldn't possibly have a problem.

They were wrong.

## The Invisible Performer

The strongest performers often get the least support. Not because people don't care. But because competence makes you invisible when you need help most.

I see this in business all the time. High performers carrying weight no one asks about. Capable people quietly signalling. While everyone assumes they're fine.

A buddy check isn't about doubting ability. It's about refusing to let experience turn into isolation.

## Who's Checking Your Gear?

So I'll ask you this: Who's checking your gear? And when did you last let them?

Stay deep. Lead clear.`,
    theme: "leadership_isolation",
    impressions: 216,
    reactions: 18,
    comments: 25,
    publishedAt: new Date('2026-01-15'),
  },
  {
    title: "The First Business Lessons That Cost Me Everything",
    slug: "first-business-lessons",
    excerpt: "I lost sleep, money, and my ego building my first business. The lessons had nothing to do with ideas. They had everything to do with survival.",
    content: `# The First Business Lessons That Cost Me Everything

I lost sleep, money, and my ego building my first business. The lessons had nothing to do with ideas.

Most people assume success comes from intelligence. Or strategy. Or timing. It doesn't.

## From Military to Business

I came into business after eight years in the military as a captain. Leadership under pressure was familiar. Cash flow was not.

### Lesson 1: Cash Flow Kills

The first lesson was tough. Cash flow kills more businesses than bad ideas. I learned that one the hard way.

### Lesson 2: Hiring is Hard

The second lesson hurt my ego. Your first hire will probably be wrong. "Hire slow, fire fast" isn't a quote. It's survival when payroll shows up every month.

### Lesson 3: Nobody Cares About Your Product

The third lesson took me the longest to understand. Nobody actually cares about your product. They care about their problem. Your product is just a tool they'll use if it helps them win.

## The Real Cost

Every real lesson came at a cost. Money. Time. Pride.

Business doesn't reward smart ideas. It rewards solving the right problem.

## If You're Early in Your Journey

Watch cash like oxygen. Be ruthless with hiring decisions. Obsess over your customer's problem, not your solution.

Everything else is noise.

Stay deep. Lead clear.`,
    theme: "vulnerability",
    impressions: 394,
    reactions: 17,
    comments: 28,
    publishedAt: new Date('2026-01-14'),
  },
  {
    title: "Nitrogen Narcosis: When Pressure Distorts Judgment",
    slug: "nitrogen-narcosis-pressure",
    excerpt: "At depth underwater, there's a phenomenon called nitrogen narcosis. Your brain gets foggy. Your judgement slows. Everything feels fine, but it isn't.",
    content: `# Nitrogen Narcosis: When Pressure Distorts Judgment

At depth underwater, there's a phenomenon called nitrogen narcosis.

Your brain gets foggy. Your judgement slows. Everything feels fine, but it isn't.

The dangerous part? You don't notice it happening.

## The Invisible Impairment

You just start making slightly worse decisions. Slightly slower reactions. Slightly less sharp. Until something goes wrong and you can't figure out why.

I've felt narcosis dozens of times across thousands of dives. I've also made decisions under it I'm not proud of. Choices that looked reasonable in the moment but were obviously compromised when I surfaced and reviewed them.

## The Same Pattern in Boardrooms

I've felt the exact same thing in boardrooms.

Leaders at depth. Carrying too much pressure for too long. Making decisions through fog they can't see.

The symptoms are identical:
- You process slower
- Create less
- Struggle to tell what's urgent from what actually matters
- Something feels off, but you can't name it

## The Critical Difference

The difference is this: Underwater, we measure it. We monitor it. We surface before it gets dangerous.

In leadership? We call it "stress" and push through.

That's the problem.

## Pressure Has Patterns

Pressure has patterns. And patterns can be measured, if you know what to look for.

Underwater, we have tools for this. I built one for leadership.

Stay deep. Lead clear.`,
    theme: "pressure_management",
    impressions: 263,
    reactions: 14,
    comments: 15,
    publishedAt: new Date('2026-01-13'),
  },
  {
    title: "Two Types of Tired",
    slug: "two-types-of-tired",
    excerpt: "There's the kind where you rest and recover. And the kind where you rest and don't. Most leaders I work with are experiencing the second one.",
    content: `# Two Types of Tired

Two types of tired:

1. The kind where you rest and recover
2. The kind where you rest and don't

Most leaders I work with are experiencing the second one.

## When Rest Doesn't Work

Weekends don't reset them. Holidays don't clear it. Sleep helps, but not enough.

I watched a founder take two weeks off last year. Came back more exhausted than when she left. That's when I knew rest wasn't her problem.

This isn't a recovery problem. It's a pressure problem.

## Resting at Depth

You're not failing to rest. You're resting at depth.

And recovery doesn't work the same at depth.

Underwater, we know this. You can't decompress properly if you're still under load. The physics won't let you. Your body needs shallower water before it can off-gas.

Leadership works the same way.

## The Solution Isn't More Rest

The solution isn't more rest. It's surfacing.

Reducing the pressure load. Closing the open loops. Handing back the decisions that were never yours.

Then rest works again.

## When Did You Last Actually Surface?

If you want to see where the pressure is actually coming from, I built a short diagnostic for exactly this.

Takes five minutes. Might explain why the last holiday didn't help.

Stay deep. Lead clear.`,
    theme: "pressure_management",
    impressions: 145,
    reactions: 6,
    comments: 6,
    publishedAt: new Date('2026-01-12'),
  },
];

const sampleStories = [
  {
    title: "Left Behind at 60 Metres: A Lesson in Assumptions",
    slug: "left-behind-60-metres",
    excerpt: "My team left me behind at 60 metres. Not because they were careless. Because they assumed I couldn't possibly have a problem.",
    content: `# Left Behind at 60 Metres

It was a routine wreck dive off the coast of Durban. I'd done hundreds like it. My team knew I was experienced. That was the problem.

## The Dive

We descended together, following the anchor line down to the wreck at 60 metres. The visibility was good. The current was manageable. Everything was going according to plan.

Until it wasn't.

## The Problem

I noticed my air consumption was higher than usual. Not dramatically so, but enough to be concerning. I signaled to my buddy, but he was focused on the wreck. I tried again. Nothing.

By the time I looked up, my team had moved on. They were 20 metres ahead, disappearing into the blue.

## The Realization

They didn't leave me because they were careless. They left me because they assumed I couldn't possibly have a problem. I was the experienced one. The technical diver. The instructor.

Competence made me invisible when I needed help most.

## The Lesson

I made it back to the surface safely. But the lesson stayed with me: The more capable you appear, the less people check on you.

In diving, we fixed this with protocols. Buddy checks. Regular signals. No exceptions.

In leadership, we haven't.

Stay deep. Lead clear.`,
    category: "diving",
    featured: 1,
    publishedAt: new Date('2026-01-10'),
  },
  {
    title: "Discovering Shipwrecks: What Lies Beneath",
    slug: "discovering-shipwrecks",
    excerpt: "I've discovered 10 shipwrecks off the South African coast. Each one taught me something about what happens when systems fail under pressure.",
    content: `# Discovering Shipwrecks: What Lies Beneath

I've discovered 10 shipwrecks off the South African coast. Each one tells a story of what happens when systems fail under pressure.

## The Search

Finding a shipwreck isn't about luck. It's about pattern recognition. Reading the ocean. Understanding currents. Knowing where things settle when they sink.

It's detective work at depth.

## The Discovery

The first wreck I discovered was a cargo ship from the 1940s. It was sitting upright on the seabed at 45 metres, perfectly preserved by the cold water.

Walking through it was like stepping back in time. The bridge was intact. The cargo holds were full. The crew quarters were frozen in place.

## The Lesson

But what struck me most wasn't what was there. It was what wasn't. The lifeboat davits were empty. The emergency equipment was gone. The crew had time to evacuate.

This wasn't a catastrophic failure. It was a slow cascade. Small problems compounding until the ship couldn't stay afloat.

## The Pattern

I've seen the same pattern in every wreck I've found. And I see it in failing businesses too.

It's never one big thing. It's a series of small things that nobody fixed in time.

Stay deep. Lead clear.`,
    category: "diving",
    featured: 1,
    publishedAt: new Date('2026-01-08'),
  },
];

const sampleTestimonials = [
  {
    authorRole: "Tech Founder, Series A",
    content: "I thought I was handling the pressure fine. The audit showed me I was operating at crush depth. The peer group gave me the space to surface.",
    outcome: "Reduced decision load by 40%, rebuilt strategic thinking capacity, raised Series B six months later.",
    featured: 1,
    displayOrder: 1,
  },
  {
    authorRole: "CEO, Manufacturing",
    content: "For two years, I carried every decision alone. I didn't realize how much it was costing me until I had people who understood the weight.",
    outcome: "Established clear decision protocols, built executive team capacity, recovered weekends.",
    featured: 1,
    displayOrder: 2,
  },
  {
    authorRole: "Founder, SaaS",
    content: "The group doesn't give advice. They ask questions that make you think. That's more valuable than any consultant.",
    outcome: "Clarified product strategy, exited unprofitable segment, doubled revenue in 12 months.",
    featured: 1,
    displayOrder: 3,
  },
];

async function seed() {
  console.log('Seeding database...');
  
  try {
    // Insert resources
    for (const resource of sampleResources) {
      await db.insert(resources).values(resource);
      console.log(`✓ Inserted resource: ${resource.title}`);
    }

    // Insert stories
    for (const story of sampleStories) {
      await db.insert(stories).values(story);
      console.log(`✓ Inserted story: ${story.title}`);
    }

    // Insert testimonials
    for (const testimonial of sampleTestimonials) {
      await db.insert(testimonials).values(testimonial);
      console.log(`✓ Inserted testimonial from: ${testimonial.authorRole}`);
    }

    console.log('\n✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seed();
