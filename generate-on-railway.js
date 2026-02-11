// Script to generate and publish articles on Railway
const https = require('https');

const RAILWAY_URL = 'https://appifyglobalbackend-production.up.railway.app';
const API_KEY = process.env.API_KEY || 'your-api-key-here'; // Set this in Railway Variables

function makeRequest(path, method = 'GET') {
  return new Promise((resolve, reject) => {
    const options = {
      method,
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(`${RAILWAY_URL}${path}`, options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });

    req.on('error', reject);
    if (method === 'POST') {
      req.write('{}');
    }
    req.end();
  });
}

async function main() {
  console.log('🚀 Generating articles on Railway...\n');

  try {
    // Step 1: Check stats
    console.log('📊 Checking current stats...');
    const stats = await makeRequest('/api/admin/stats');
    console.log(`   Total: ${stats.total}, Published: ${stats.published}, Pending: ${stats.pending}\n`);

    // Step 2: Generate articles
    console.log('⚙️  Triggering article generation...');
    const generateResult = await makeRequest('/api/admin/generate', 'POST');
    console.log(`   ${generateResult.message}\n`);
    console.log('   ⏳ This may take a few minutes. Check Railway logs for progress.\n');

    // Wait a bit
    console.log('⏳ Waiting 10 seconds for generation to start...');
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Step 3: Publish articles
    console.log('📝 Publishing pending articles...');
    const publishResult = await makeRequest('/api/admin/publish-all', 'POST');
    console.log(`   ${publishResult.message}\n`);

    // Step 4: Check final stats
    console.log('📊 Final stats:');
    const finalStats = await makeRequest('/api/admin/stats');
    console.log(`   Total: ${finalStats.total}, Published: ${finalStats.published}, Pending: ${finalStats.pending}\n`);

    console.log('✅ Done! Visit your frontend to see the articles.');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Make sure:');
    console.log('   1. Railway has deployed the latest code');
    console.log('   2. API_KEY is set in Railway Variables');
    console.log('   3. Backend is running and accessible');
  }
}

main();
