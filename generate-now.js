// Generate article right now
const https = require('https');

const RAILWAY_URL = 'https://appifyglobalbackend-production.up.railway.app';
// Try common API key values or get from env
const API_KEY = process.env.API_KEY || 'your-secret-api-key-for-write-endpoints';

console.log('🚀 Generating new article on Railway...\n');

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
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
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
  try {
    // Step 1: Generate
    console.log('⚙️  Triggering article generation...');
    const generateResult = await makeRequest('/api/admin/generate', 'POST');
    
    if (generateResult.status === 401) {
      console.log('❌ API_KEY authentication failed.');
      console.log('   Please set API_KEY in Railway → AppifyGlobal_Backend → Variables');
      console.log('   Then update this script with the correct API_KEY');
      return;
    }
    
    if (generateResult.status !== 200) {
      console.log(`❌ Generation failed: ${generateResult.status}`);
      console.log('Response:', generateResult.data);
      return;
    }
    
    console.log('✅ Generation started:', generateResult.data.message);
    console.log('⏳ This may take 2-5 minutes. Waiting 30 seconds...\n');
    
    // Wait for generation
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    // Step 2: Publish
    console.log('📝 Publishing articles...');
    const publishResult = await makeRequest('/api/admin/publish-all', 'POST');
    
    if (publishResult.status === 200) {
      console.log('✅', publishResult.data.message);
    } else {
      console.log(`⚠️  Publishing status: ${publishResult.status}`);
    }
    
    // Step 3: Check stats
    console.log('\n📊 Final stats:');
    const stats = await makeRequest('/api/admin/stats');
    if (stats.status === 200) {
      console.log(`   Total: ${stats.data.total}`);
      console.log(`   Published: ${stats.data.published}`);
      console.log(`   Pending: ${stats.data.pending}\n`);
    }
    
    console.log('✅ Done! Check your frontend to see the new article.');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main();
