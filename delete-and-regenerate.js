// Delete article and regenerate on Railway
const https = require('https');

const RAILWAY_URL = 'https://appifyglobalbackend-production.up.railway.app';
const API_KEY = process.env.API_KEY || 'your-api-key-here';

function makeRequest(path, method = 'GET', body = null) {
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
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function main() {
  console.log('🗑️  Deleting article and regenerating...\n');

  try {
    // Step 1: Delete the article
    console.log('🗑️  Deleting: ai-industry-rivals-are-teaming-up-on-a-startup-accelerator');
    const deleteResult = await makeRequest('/api/news/ai-industry-rivals-are-teaming-up-on-a-startup-accelerator', 'DELETE');
    console.log(`   Status: ${deleteResult.status}`);
    if (deleteResult.data.message) {
      console.log(`   ${deleteResult.data.message}\n`);
    }

    // Step 2: Generate articles
    console.log('⚙️  Triggering article generation...');
    const generateResult = await makeRequest('/api/admin/generate', 'POST');
    console.log(`   Status: ${generateResult.status}`);
    if (generateResult.data.message) {
      console.log(`   ${generateResult.data.message}\n`);
    }
    console.log('   ⏳ This may take a few minutes. Check Railway logs for progress.\n');

    console.log('✅ Done! The article will be regenerated with the new rules.');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main();
