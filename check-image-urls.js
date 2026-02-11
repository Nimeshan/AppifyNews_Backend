const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  const articles = await prisma.article.findMany({
    select: {
      title: true,
      imageUrl: true,
    },
    take: 5,
    orderBy: { createdAt: 'desc' }
  });

  console.log('Sample article image URLs:\n');
  articles.forEach(a => {
    console.log(`${a.title.substring(0, 50)}...`);
    console.log(`  URL: ${a.imageUrl}`);
    console.log(`  Is Railbucket: ${a.imageUrl?.includes('t3.storageapi.dev') ? '✅' : '❌'}`);
    console.log('');
  });

  await prisma.$disconnect();
})();
