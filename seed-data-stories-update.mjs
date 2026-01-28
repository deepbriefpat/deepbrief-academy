import { drizzle } from 'drizzle-orm/mysql2';
import { stories } from './drizzle/schema.js';

const db = drizzle(process.env.DATABASE_URL);

const updatedStories = [
  {
    title: "The Dive That Almost Broke Me",
    slug: "dive-that-almost-broke-me",
    excerpt: "75 meters down on the Istar wreck off Durban. I'd just freed the anchor while my team started their ascent. When I looked up, they were already disappearing into the murk above me.",
    content: `# The Dive That Almost Broke Me

75 meters down on the Istar wreck off Durban. I'd just freed the anchor while my team started their ascent. When I looked up, they were already disappearing into the murk above me.

At 63 meters, I needed to switch gas. Regulator in mouth. Breathe in. Seawater.

The regulator had failed, faulty diaphragm. At 60 meters, alone, I was drowning in the ocean.

I signalled furiously with my light. Nothing. The team kept ascending. 5-meter visibility meant they couldn't properly see me.

Coughing. Spluttering. Fighting panic at depth. But here's what saved my preparation.

I always only hand-tightened my regulators onto the hose. Muscle memory kicked in. Switch the broken second stage for another. Breathe the right gas. Continue the ascent.

Back on the boat, I asked why they'd left me behind.

Their answer changed everything: "Oh, it was you, Patrick. You're one of the best technical divers we know. We didn't think you could possibly have a problem."

That's when I learned the most dangerous assumption in leadership: Competence makes you invisible when you need help most.

## The Pattern

The best performers often get the least support. We assume they'll figure it out. We see their strength, not their struggle. We mistake experience for invincibility.

From that day, every deep dive I led had one non-negotiable rule: We ascend as a team. No one gets left behind. Especially not the strongest swimmer.

In business, I see this constantly. Your top performers drowning in silence. Your most capable people signalling for help while everyone assumes they're fine.

Don't practice until you get it right. Practice until you can't get it wrong. And never, ever assume someone doesn't need you just because they usually don't.

What assumption about a strong team member might you need to challenge today?

Stay deep. Lead clear.`,
    category: "diving",
    featured: 1,
    publishedAt: new Date('2026-01-10'),
  },
  {
    title: "The Umzimvubu: Finding Clarity in Chaos",
    slug: "umzimvubu-finding-clarity",
    excerpt: "12 years ago today, 60 meters beneath the surface off Durban. I swallowed my doubts, pulled my mask over my face, and descended into the darkness. Alone, with no support divers, just a mission and a story waiting to be found.",
    content: `# The Umzimvubu: Finding Clarity in Chaos

12 years ago today, 60 meters beneath the surface off Durban.

I swallowed my doubts, pulled my mask over my face, and descended into the darkness. Alone, with no support divers, just a mission and a story waiting to be found.

At 60 meters, in that hush of weight and darkness, I made contact with history: the Umzimvubu.

Built in 1896, she was the mail vessel that never missed a trip, no matter the weather. So violent in her roll and pitch that Winston Churchill, after escaping the Boers, wrote it was "the worst I have ever experienced, as the beastly little boat rolled and pitched at the same time."

Churchill understood why she bore the name Umzimvubu, Zulu for hippopotamus. He said it felt like riding the back of a hippo.

Scuttled off Durban in 1932, she slept for decades among hulks, silenced by salt and sea.

When I laid eyes on her through my torch beam, something profound shifted.

In her corroded steel, I saw my own truth reflected: we're all shaped by pressure and time.

That wreck was a mirror.

## The Lesson

Because pressure, whether seven atmospheres underwater or the heat of leadership, is a transformation zone.

It doesn't break you. It reveals you. Then reshapes what it finds.

Solo at 60 meters, you face a specific kind of pressure. No buddy to share air. No hand signals for help. Your preparation becomes your only oxygen. Every gauge check, every mental checkpoint, every practiced emergency response, they're not procedures anymore. They're survival.

The same physics apply to leadership.

You don't wait for pressure to break you, you train so it refines you.

That dive taught me this: leaders must descend into the unknown. We must face the pressure, not avoid it. We must go alone sometimes, even when it's uncomfortable.

Like the Umzimvubu, uncomfortable but unstoppable.

When we do, we either collapse, or we discover something we didn't know was possible.

Today, when pressure mounts, whether on an expedition or in business, I reach back to that moment. To that "beastly little boat" that never missed a delivery. To the silence at 60 meters where I met her.

Because if you can find a ghost ship alone in the deep, you can find clarity in chaos.

What wreck, real or metaphorical, are you diving toward today?

Stay deep. Lead clear.`,
    category: "diving",
    featured: 1,
    publishedAt: new Date('2026-01-08'),
  },
];

async function updateStories() {
  console.log('Updating stories...');
  
  // Delete existing stories
  await db.delete(stories);
  
  // Insert updated stories
  await db.insert(stories).values(updatedStories);
  
  console.log('Stories updated successfully!');
  process.exit(0);
}

updateStories().catch((error) => {
  console.error('Error updating stories:', error);
  process.exit(1);
});
