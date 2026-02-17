/**
 * Script to check which generation mode is being used
 */

const https = require('https');

const RAILWAY_URL = process.env.RAILWAY_URL || 'https://appifyglobalbackend-production.up.railway.app';
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
    req.end();
  });
}

async function checkMode() {
  try {
    console.log('🔍 Checking generation mode...\n');
    
    // Trigger generation and check logs (we can't directly check env vars via API)
    // But we can trigger generation and see what happens
    console.log('📝 Note: To verify generation mode:');
    console.log('   1. Check Railway logs after generation');
    console.log('   2. Look for: "[Pipeline] Generation Mode: OpenAI" or "CODE-BASED"');
    console.log('   3. If you see generic filler content, it\'s using CODE-BASED');
    console.log('   4. If you see unique, high-quality content, it\'s using OpenAI\n');
    
    console.log('🚀 Triggering generation to test...\n');
    const result = await makeRequest('/api/admin/generate?fetchAll=false', 'POST');
    
    if (result.status === 200) {
      console.log('✅ Generation triggered!');
      console.log(`   ${result.data.message || 'Check Railway logs for mode confirmation'}\n`);
      console.log('📊 Check the latest article to verify:');
      console.log('   - OpenAI: Unique, high-quality, natural content');
      console.log('   - Code-based: Generic filler like "Scaling technology typically requires..."\n');
    } else {
      console.error('❌ Failed to trigger generation:', result.data);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkMode();
