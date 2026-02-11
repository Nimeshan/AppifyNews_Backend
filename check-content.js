// Check if content column has data
require('dotenv').config();

async function checkContent() {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const articles = await prisma.article.findMany({
      select: {
        slug: true,
        content: true,
      },
      take: 5,
    });
    
    console.log(`Found ${articles.length} articles:\n`);
    
    articles.forEach((article) => {
      const content = article.content;
      const blockCount = Array.isArray(content) ? content.length : 0;
      const hasContent = content !== null && content !== undefined;
      console.log(`${article.slug}:`);
      console.log(`   Has content: ${hasContent}`);
      console.log(`   Block count: ${blockCount}`);
      if (blockCount > 0) {
        console.log(`   First block type: ${content[0]?.type || 'N/A'}`);
      }
      console.log('');
    });
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkContent();
