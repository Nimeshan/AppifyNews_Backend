const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = 'postgresql://postgres:SutGuMkPQWYuWNudhUrpDWYWQgfUHYWZ@shortline.proxy.rlwy.net:53169/railway';
const sqlFile = path.join(__dirname, 'rename_category_to_topics.sql');
const sql = fs.readFileSync(sqlFile, 'utf8');

async function migrate() {
  const client = new Client({ connectionString });
  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected! Renaming category to topics...');
    await client.query(sql);
    console.log('✅ Column renamed successfully!');
    
    // Verify the change
    const result = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'articles' 
      AND column_name IN ('category', 'topics')
      ORDER BY column_name;
    `);
    
    console.log('📊 Column status:');
    result.rows.forEach(row => {
      console.log(`   - ${row.column_name} (${row.data_type})`);
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
