const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = 'postgresql://postgres:SutGuMkPQWYuWNudhUrpDWYWQgfUHYWZ@shortline.proxy.rlwy.net:53169/railway';
const sqlFile = path.join(__dirname, 'schema.sql');
const sql = fs.readFileSync(sqlFile, 'utf8');

async function migrate() {
  const client = new Client({ connectionString });
  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected! Running migration...');
    await client.query(sql);
    console.log('✅ Migration completed! Tables created.');
    const result = await client.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('articles', 'article_content_blocks') ORDER BY table_name;`);
    console.log('📊 Tables:', result.rows.map(r => r.table_name).join(', '));
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      console.error('⚠️  Internal Railway hostname not accessible. Use Railway CLI or external connection string.');
    }
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
