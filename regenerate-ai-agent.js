// Delete and regenerate AI agent article
const https = require('https');

const RAILWAY_URL = 'https://appifyglobalbackend-production.up.railway.app';
const API_KEY = process.env.API_KEY || 'your-secret-api-key-for-write-endpoints';

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
  console.log('🔄 Regenerating AI Agent article with new dynamic headings...\n');

  try {
    // Step 1: Delete the article
    console.log('🗑️  Deleting: i-loved-my-openclaw-ai-agentuntil-it-turned-on-me');
    const deleteResult = await makeRequest('/api/news/i-loved-my-openclaw-ai-agentuntil-it-turned-on-me', 'DELETE');
    console.log(`   Status: ${deleteResult.status}`);
    if (deleteResult.data && deleteResult.data.message) {
      console.log(`   ${deleteResult.data.message}\n`);
    }

    // Step 2: Generate articles
    console.log('⚙️  Triggering article generation...');
    const generateResult = await makeRequest('/api/admin/generate', 'POST');
    console.log(`   Status: ${generateResult.status}`);
    if (generateResult.data && generateResult.data.message) {
      console.log(`   ${generateResult.data.message}\n`);
    }
    console.log('   ⏳ This may take a few minutes. Check Railway logs for progress.\n');
    console.log('   The article will have dynamic, topic-specific headings like:');
    console.log('   - "Why Autonomous AI Agents Are Gaining Traction"');
    console.log('   - "How AI Agents Access Local Systems and APIs"');
    console.log('   - "Security Trade-Offs of Autonomous AI Systems"');
    console.log('   - "Evaluating AI Agent Deployment in Enterprise Environments"\n');

    console.log('✅ Done! The article will be regenerated with SEO-optimized headings.');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main();
