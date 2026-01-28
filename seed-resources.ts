import { getDb } from "./server/db";
import { resources } from "./drizzle/schema";
import articlesData from "/home/ubuntu/linkedin_articles.json" assert { type: "json" };

async function seedResources() {
  console.log("🌱 Seeding resources...");
  
  const db = await getDb();
  if (!db) {
    console.error("❌ Database not available");
    process.exit(1);
  }

  // Delete existing resources
  await db.delete(resources);
  console.log("✓ Cleared existing resources");

  // Insert articles
  let count = 0;
  for (const article of articlesData) {
    await db.insert(resources).values({
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      content: article.content,
      theme: article.theme as "pressure_management" | "diving_metaphors" | "leadership_isolation" | "vulnerability",
      publishedAt: new Date(article.published_at),
    });
    count++;
    console.log(`✓ Inserted: ${article.title.substring(0, 60)}...`);
  }

  console.log(`\n✅ Successfully seeded ${count} resources!`);
  process.exit(0);
}

seedResources().catch((error) => {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
});
