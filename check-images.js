// Check article images
require('dotenv').config();

async function checkImages() {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const articles = await prisma.article.findMany({
      where: { status: 'published' },
      select: {
        title: true,
        imageUrl: true,
        slug: true,
        isFeatured: true,
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`Found ${articles.length} published articles:\n`);
    
    articles.forEach((article, i) => {
      console.log(`${i + 1}. ${article.title}`);
      console.log(`   Featured: ${article.isFeatured}`);
      console.log(`   Image: ${article.imageUrl}`);
      console.log(`   Slug: ${article.slug}\n`);
    });
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkImages();
