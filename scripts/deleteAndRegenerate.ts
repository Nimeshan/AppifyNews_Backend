/**
 * Script to delete the most recent article and regenerate it
 */

import { prisma } from "../src/lib/prisma";
import { generateArticles } from "../src/cron/generateArticles";

async function deleteAndRegenerate() {
  try {
    console.log("[Script] Finding most recent article...");
    
    // Find the most recent article by createdAt
    const mostRecent = await prisma.article.findFirst({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        slug: true,
        title: true,
        createdAt: true,
      },
    });

    if (!mostRecent) {
      console.log("[Script] No articles found in database.");
      return;
    }

    console.log(`[Script] Found most recent article: ${mostRecent.title}`);
    console.log(`[Script] Slug: ${mostRecent.slug}`);
    console.log(`[Script] Created: ${mostRecent.createdAt}`);

    // Delete the article
    console.log("[Script] Deleting article...");
    await prisma.article.delete({
      where: { id: mostRecent.id },
    });
    console.log(`[Script] ✅ Deleted article: ${mostRecent.slug}`);

    // Generate a new article
    console.log("[Script] Generating new article...");
    await generateArticles();
    console.log("[Script] ✅ Article generation complete!");

  } catch (error: any) {
    console.error("[Script] Error:", error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

deleteAndRegenerate();
