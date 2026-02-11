// Test database using Prisma
require('dotenv').config();

async function testDB() {
  try {
    // Dynamically import Prisma
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    console.log('🧪 Testing Database Connection with Prisma...\n');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Connected to database!\n');
    
    // Check article count
    const count = await prisma.article.count();
    console.log(`📰 Total articles in database: ${count}\n`);
    
    if (count > 0) {
      // Get latest articles
      const articles = await prisma.article.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          slug: true,
          title: true,
          topics: true,
          status: true,
          createdAt: true,
          _count: {
            select: { contentBlocks: true }
          }
        }
      });
      
      console.log('📝 Latest articles:');
      articles.forEach((article, i) => {
        console.log(`\n   ${i + 1}. ${article.title}`);
        console.log(`      Slug: ${article.slug}`);
        console.log(`      Topics: ${article.topics}`);
        console.log(`      Status: ${article.status}`);
        console.log(`      Content Blocks: ${article._count.contentBlocks}`);
        console.log(`      Created: ${article.createdAt.toLocaleString()}`);
      });
    } else {
      console.log('⚠️  No articles found in database.');
      console.log('   Run: npm run generate (or npx tsx src/cron/generateArticles.ts)');
      console.log('   to generate articles from RSS feed.');
    }
    
    await prisma.$disconnect();
    console.log('\n✅ Database test complete!');
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    if (error.message.includes('DATABASE_URL')) {
      console.error('\n⚠️  DATABASE_URL not set. Set it in .env file or environment variables.');
    }
  }
}

testDB();
