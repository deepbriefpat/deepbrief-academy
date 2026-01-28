import { db } from "./server/db.ts";
import { resources } from "./drizzle/schema.ts";
import fs from 'fs';

const articlesData = JSON.parse(fs.readFileSync('/home/ubuntu/linkedin_articles.json', 'utf-8'));

console.log(`Inserting ${articlesData.length} articles...`);

// Delete existing resources first
await db.delete(resources);

// Insert all articles
for (const article of articlesData) {
  await db.insert(resources).values({
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt,
    content: article.content,
    theme: article.theme,
    publishedAt: new Date(article.published_at),
  });
  console.log(`✓ Inserted: ${article.title.substring(0, 60)}...`);
}

console.log(`\n✅ Successfully inserted ${articlesData.length} articles!`);
process.exit(0);
