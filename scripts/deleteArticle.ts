import { prisma } from "../src/lib/prisma";

async function deleteArticle() {
  try {
    const article = await prisma.article.findFirst({
      where: { slug: "ai-industry-rivals-are-teaming-up-on-a-startup-accelerator" },
    });
    
    if (article) {
      await prisma.article.delete({ where: { id: article.id } });
      console.log("✅ Deleted:", article.slug);
    } else {
      console.log("Article not found");
    }
  } catch (error: any) {
    console.error("Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

deleteArticle();
