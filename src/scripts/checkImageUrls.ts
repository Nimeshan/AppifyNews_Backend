import { prisma } from "../lib/prisma";

async function checkImageUrls() {
  try {
    // Get the 3 most recent articles
    const recentArticles = await prisma.article.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        slug: true,
        imageUrl: true,
        sourceUrl: true,
        createdAt: true,
      },
    });

    console.log("\n=== Recent Articles Image URLs ===\n");
    
    for (const article of recentArticles) {
      console.log(`Title: ${article.title}`);
      console.log(`Slug: ${article.slug}`);
      console.log(`Image URL: ${article.imageUrl}`);
      console.log(`Source URL: ${article.sourceUrl}`);
      console.log(`Created: ${article.createdAt}`);
      
      // Check if it's a Grok URL, Railbucket URL, or other
      if (article.imageUrl.includes("railbucket") || article.imageUrl.includes("t3.storageapi.dev")) {
        console.log(`✅ Image Source: Railbucket (from article/RSS)`);
      } else if (article.imageUrl.includes("grok") || article.imageUrl.includes("xai")) {
        console.log(`⚠️  Image Source: Grok-generated`);
      } else if (article.imageUrl.includes("unsplash")) {
        console.log(`⚠️  Image Source: Placeholder (Unsplash)`);
      } else if (article.imageUrl.includes("media.wired.com") || article.imageUrl.includes("media.")) {
        console.log(`✅ Image Source: Direct from source (not uploaded)`);
      } else {
        console.log(`❓ Image Source: Unknown`);
      }
      console.log("---\n");
    }
  } catch (error) {
    console.error("Error checking image URLs:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkImageUrls();
