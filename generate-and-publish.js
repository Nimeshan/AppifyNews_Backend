// Generate and auto-publish articles
require('dotenv').config();

async function generateAndPublish() {
  try {
    const { generateArticles } = require('./dist/cron/generateArticles');
    const { prisma } = require('./dist/lib/prisma');
    
    console.log('🚀 Generating new articles...\n');
    
    // Generate articles
    await generateArticles();
    
    console.log('\n📝 Publishing all pending articles...\n');
    
    // Publish all pending articles
    const result = await prisma.article.updateMany({
      where: { status: 'pending_review' },
      data: { status: 'published' },
    });
    
    console.log(`✅ Published ${result.count} article(s)\n`);
    
    // Show latest articles
    const articles = await prisma.article.findMany({
      where: { status: 'published' },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        title: true,
        topics: true,
        slug: true,
        excerpt: true,
      }
    });
    
    console.log('📰 Latest published articles:');
    articles.forEach((article, i) => {
      console.log(`\n${i + 1}. ${article.title}`);
      console.log(`   Topics: ${article.topics}`);
      console.log(`   Excerpt: ${article.excerpt?.substring(0, 100)}...`);
      console.log(`   Slug: ${article.slug}`);
    });
    
    await prisma.$disconnect();
    console.log('\n✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

generateAndPublish();
