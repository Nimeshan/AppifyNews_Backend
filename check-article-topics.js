// Check article topics
require('dotenv').config();

async function checkArticleTopics() {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    console.log('📰 Checking article topics...\n');
    
    const articles = await prisma.article.findMany({
      select: {
        id: true,
        title: true,
        topics: true,
        status: true,
        slug: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    if (articles.length === 0) {
      console.log('⚠️  No articles found in database.');
      await prisma.$disconnect();
      return;
    }
    
    console.log(`Found ${articles.length} article(s):\n`);
    
    articles.forEach((article, i) => {
      console.log(`${i + 1}. ${article.title}`);
      console.log(`   Topics: ${article.topics || 'Not set'}`);
      console.log(`   Status: ${article.status}`);
      console.log(`   Slug: ${article.slug}\n`);
    });
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('getaddrinfo ENOTFOUND')) {
      console.log('\n💡 Make sure DATABASE_URL is set correctly.');
    }
  }
}

checkArticleTopics();
