// Regenerate content via Railway admin API
const https = require('https');

const RAILWAY_URL = 'https://appifyglobalbackend-production.up.railway.app';
const API_KEY = process.env.API_KEY || 'your-secret-api-key-for-write-endpoints';

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
  console.log('🔄 Regenerating content for existing articles...\n');
  
  try {
    const result = await makeRequest('/api/admin/regenerate-content', 'POST');
    
    if (result.status === 401) {
      console.log('❌ API_KEY authentication failed.');
      console.log('   Please set API_KEY in Railway → AppifyGlobal_Backend → Variables');
      return;
    }
    
    if (result.status === 200) {
      console.log('✅', result.data.message);
      console.log('\n⏳ This may take 5-10 minutes (regenerating all articles with AI)');
      console.log('   Check Railway logs for progress.');
    } else {
      console.log(`❌ Error: ${result.status}`);
      console.log('Response:', result.data);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main();
