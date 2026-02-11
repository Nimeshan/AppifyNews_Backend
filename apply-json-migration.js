// Apply JSON migration: Add column and migrate data
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrate() {
  try {
    console.log('🔄 Starting migration to JSON column...\n');
    
    // Step 1: Add content column (if not exists)
    console.log('Step 1: Adding content column...');
    await prisma.$executeRawUnsafe(`
      ALTER TABLE articles 
      ADD COLUMN IF NOT EXISTS content JSONB;
    `);
    console.log('✅ Column added\n');
    
    // Step 2: Migrate existing content blocks to JSON
    console.log('Step 2: Migrating existing content blocks...');
    const result = await prisma.$executeRawUnsafe(`
      UPDATE articles a
      SET content = (
        SELECT COALESCE(
          json_agg(
            json_build_object(
              'type', acb.type::text,
              'text', acb.text,
              'src', acb.src,
              'alt', acb.alt
            ) ORDER BY acb.sort_order
          ) FILTER (WHERE acb.id IS NOT NULL),
          '[]'::json
        )
        FROM article_content_blocks acb
        WHERE acb.article_id = a.id
      )
      WHERE EXISTS (
        SELECT 1 FROM article_content_blocks acb WHERE acb.article_id = a.id
      );
    `);
    console.log(`✅ Migrated ${result} articles\n`);
    
    // Step 3: Set empty array for articles with no content
    console.log('Step 3: Setting default for articles without content...');
    await prisma.$executeRawUnsafe(`
      UPDATE articles
      SET content = '[]'::jsonb
      WHERE content IS NULL;
    `);
    console.log('✅ Default values set\n');
    
    // Step 4: Verify
    console.log('Step 4: Verifying migration...');
    const articles = await prisma.article.findMany({
      select: {
        slug: true,
        content: true,
      },
      take: 5,
    });
    
    console.log(`✅ Verified ${articles.length} articles:`);
    articles.forEach((article) => {
      const content = article.content;
      const blockCount = Array.isArray(content) ? content.length : 0;
      console.log(`   ${article.slug}: ${blockCount} content blocks`);
    });
    
    console.log('\n✅ Migration complete!');
    console.log('\n⚠️  Note: The article_content_blocks table still exists.');
    console.log('   You can drop it later after verifying everything works:');
    console.log('   DROP TABLE article_content_blocks;');
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Migration error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

migrate();
