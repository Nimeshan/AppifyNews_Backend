// Regenerate content for existing articles
require('dotenv').config();

async function regenerateContent() {
  try {
    const { generateBlogContent } = require('./dist/services/contentGenerator');
    const { optimizeForSEO } = require('./dist/services/seoOptimizer');
    const { convertToHTML } = require('./dist/services/htmlConverter');
    const { parseContentBlocks } = require('./dist/services/contentParser');
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    console.log('🔄 Regenerating content for existing articles...\n');
    
    // Get all published articles
    const articles = await prisma.article.findMany({
      where: { status: 'published' },
      select: {
        id: true,
        slug: true,
        title: true,
        sourceUrl: true,
      },
    });
    
    console.log(`Found ${articles.length} articles to regenerate\n`);
    
    for (const article of articles) {
      try {
        console.log(`Processing: ${article.title}`);
        
        // Create a mock RSS item from the article
        const mockItem = {
          title: article.title,
          link: article.sourceUrl || `https://example.com/${article.slug}`,
          content: '',
          pubDate: new Date().toISOString(),
        };
        
        // Regenerate content
        const rawBlog = await generateBlogContent(mockItem);
        const seoResult = await optimizeForSEO(rawBlog);
        const htmlContent = await convertToHTML(seoResult.optimizedContent);
        const contentBlocks = parseContentBlocks(htmlContent);
        
        // Store as JSON
        const contentJson = contentBlocks.map((block) => ({
          type: block.type,
          text: block.text || null,
          src: block.src || null,
          alt: block.alt || null,
        }));
        
        // Update article
        await prisma.article.update({
          where: { id: article.id },
          data: {
            content: contentJson as any,
          },
        });
        
        console.log(`✅ Regenerated: ${article.slug} (${contentBlocks.length} blocks)\n`);
      } catch (error) {
        console.error(`❌ Failed to regenerate ${article.slug}:`, error.message);
      }
    }
    
    await prisma.$disconnect();
    console.log('✅ Content regeneration complete!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

regenerateContent();
