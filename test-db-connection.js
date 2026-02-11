// Test database connection directly
const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:SutGuMkPQWYuWNudhUrpDWYWQgfUHYWZ@shortline.proxy.rlwy.net:53169/railway';

async function testDB() {
  console.log('🧪 Testing Database Connection...\n');
  
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('✅ Connected to database!\n');
    
    // Check if tables exist
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('articles', 'article_content_blocks')
      ORDER BY table_name;
    `);
    
    console.log('📊 Tables found:');
    tablesRes.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    
    // Check article count
    const countRes = await client.query('SELECT COUNT(*) as count FROM articles');
    console.log(`\n📰 Total articles in database: ${countRes.rows[0].count}`);
    
    // Get latest articles
    const articlesRes = await client.query(`
      SELECT id, slug, title, topics, status, created_at 
      FROM articles 
      ORDER BY created_at DESC 
      LIMIT 5;
    `);
    
    if (articlesRes.rows.length > 0) {
      console.log('\n📝 Latest articles:');
      articlesRes.rows.forEach((article, i) => {
        console.log(`\n   ${i + 1}. ${article.title}`);
        console.log(`      Slug: ${article.slug}`);
        console.log(`      Topics: ${article.topics}`);
        console.log(`      Status: ${article.status}`);
        console.log(`      Created: ${article.created_at}`);
      });
    } else {
      console.log('\n⚠️  No articles found in database.');
      console.log('   Run article generation to create articles.');
    }
    
    console.log('\n✅ Database test complete!');
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
  } finally {
    await client.end();
  }
}

testDB();
