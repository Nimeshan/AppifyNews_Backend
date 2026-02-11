// Publish articles in Railway database
require('dotenv').config();

async function publishArticles() {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    console.log('📝 Publishing articles in Railway database...\n');
    
    // Get all pending articles
    const pending = await prisma.article.findMany({
      where: { status: 'pending_review' },
      select: { id: true, slug: true, title: true, status: true }
    });
    
    if (pending.length === 0) {
      console.log('✅ No pending articles found.');
      
      // Check if any articles exist
      const all = await prisma.article.findMany({
        select: { id: true, slug: true, title: true, status: true }
      });
      
      if (all.length === 0) {
        console.log('⚠️  No articles found in database at all.');
      } else {
        console.log(`\n📊 Current articles:`);
        all.forEach((article, i) => {
          console.log(`   ${i + 1}. ${article.title}`);
          console.log(`      Status: ${article.status}`);
          console.log(`      Slug: ${article.slug}\n`);
        });
      }
      
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
    
    // Show final stats
    const [total, published, stillPending] = await Promise.all([
      prisma.article.count(),
      prisma.article.count({ where: { status: 'published' } }),
      prisma.article.count({ where: { status: 'pending_review' } }),
    ]);
    
    console.log('📊 Final Stats:');
    console.log(`   Total: ${total}`);
    console.log(`   Published: ${published}`);
    console.log(`   Pending: ${stillPending}\n`);
    
    await prisma.$disconnect();
    console.log('✅ All articles published!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('getaddrinfo ENOTFOUND')) {
      console.log('\n💡 Make sure DATABASE_URL is set correctly.');
      console.log('   Use the Railway Postgres connection string.');
    }
    process.exit(1);
  }
}

publishArticles();
