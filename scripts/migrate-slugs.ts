/**
 * One-time migration: shorten existing article slugs to SEO-friendly format.
 *
 * Usage:
 *   DATABASE_URL="postgresql://..." npx tsx scripts/migrate-slugs.ts
 *   npx tsx scripts/migrate-slugs.ts --dry-run    # preview changes only
 *
 * What it does:
 *   1. Reads every article from the DB
 *   2. Generates a new concise slug from the title (same logic as generateSlug)
 *   3. Handles collisions by appending a numeric suffix
 *   4. Updates the slug in the DB (unless --dry-run)
 */

import { PrismaClient } from "@prisma/client";
import { generateSlug } from "../src/services/contentParser";

const prisma = new PrismaClient();
const dryRun = process.argv.includes("--dry-run");

async function migrate() {
  const articles = await prisma.article.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, slug: true, title: true },
  });

  console.log(`Found ${articles.length} articles. ${dryRun ? "(DRY RUN)" : ""}\n`);

  const usedSlugs = new Set<string>();
  let changed = 0;
  let skipped = 0;

  for (const article of articles) {
    let newSlug = generateSlug(article.title);

    // Handle collisions
    if (usedSlugs.has(newSlug)) {
      let suffix = 2;
      while (usedSlugs.has(`${newSlug}-${suffix}`)) suffix++;
      newSlug = `${newSlug}-${suffix}`;
    }
    usedSlugs.add(newSlug);

    if (newSlug === article.slug) {
      skipped++;
      continue;
    }

    const oldLen = article.slug.length;
    const newLen = newSlug.length;
    console.log(
      `[${oldLen} → ${newLen}]  ${article.slug}\n` +
      `           → ${newSlug}\n`
    );

    if (!dryRun) {
      await prisma.article.update({
        where: { id: article.id },
        data: { slug: newSlug },
      });
    }
    changed++;
  }

  console.log(`\nDone. ${changed} updated, ${skipped} unchanged.`);
  if (dryRun) console.log("(No DB writes — re-run without --dry-run to apply)");
}

migrate()
  .catch((e) => {
    console.error("Migration failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
