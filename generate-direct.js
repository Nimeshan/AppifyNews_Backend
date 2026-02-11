// Direct article generation - can be run via Railway CLI
// This bypasses API_KEY requirement since it runs in Railway environment

require('dotenv').config();
const { generateArticles } = require('./dist/cron/generateArticles');
const { prisma } = require('./dist/lib/prisma');

async function main() {
  console.log('🚀 Starting article generation...\n');
  
  try {
    await generateArticles();
    console.log('\n✅ Article generation complete!');
    
    // Auto-publish pending articles
    console.log('\n📝 Publishing pending articles...');
    const result = await prisma.article.updateMany({
      where: { status: 'pending_review' },
      data: { status: 'published' },
    });
    
    console.log(`✅ Published ${result.count} articles\n`);
    
    // Show stats
    const [total, published] = await Promise.all([
      prisma.article.count(),
      prisma.article.count({ where: { status: 'published' } }),
    ]);
    
    console.log('📊 Final Stats:');
    console.log(`   Total: ${total}`);
    console.log(`   Published: ${published}\n`);
    
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();
