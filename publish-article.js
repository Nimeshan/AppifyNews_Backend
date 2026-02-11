// Publish pending articles
require('dotenv').config();

async function publishArticles() {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    console.log('📝 Publishing pending articles...\n');
    
    // Get pending articles
    const pending = await prisma.article.findMany({
      where: { status: 'pending_review' },
      select: { id: true, slug: true, title: true }
    });
    
    if (pending.length === 0) {
      console.log('✅ No pending articles to publish.');
      await prisma.$disconnect();
      return;
    }
    
    console.log(`Found ${pending.length} pending article(s):\n`);
    
    // Publish them
    for (const article of pending) {
      await prisma.article.update({
        where: { id: article.id },
        data: { status: 'published' }
      });
      console.log(`✅ Published: ${article.title}`);
      console.log(`   Slug: ${article.slug}\n`);
    }
    
    await prisma.$disconnect();
    console.log('✅ All articles published!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

publishArticles();
