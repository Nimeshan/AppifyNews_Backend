/**
 * Script to trigger article generation that uses proper images from source URLs
 */

const https = require('https');

const RAILWAY_URL = process.env.RAILWAY_URL || 'https://appifyglobalbackend-production.up.railway.app';
const API_KEY = process.env.API_KEY || 'your-secret-api-key-for-write-endpoints';

function makeRequest(path, method = 'POST', body = null) {
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

async function generateArticles() {
  try {
    console.log('🚀 Triggering article generation with source image extraction...\n');
    console.log('📸 The generation will:');
    console.log('   1. Fetch articles from RSS feeds');
    console.log('   2. Extract images from source article pages (og:image, twitter:image, or first img tag)');
    console.log('   3. Upload images to Railbucket');
    console.log('   4. Create articles with proper source images\n');

    // Trigger generation with fetchAll=true to get all RSS items (including ones we just deleted)
    const result = await makeRequest('/api/admin/generate?fetchAll=true', 'POST');
    
    if (result.status === 200) {
      console.log('✅ Generation triggered successfully!');
      console.log(`   ${result.data.message || 'Check Railway logs for progress.'}\n`);
      console.log('⏳ This may take a few minutes. The process will:');
      console.log('   - Fetch RSS feeds');
      console.log('   - Extract content and images from source URLs');
      console.log('   - Upload images to Railbucket');
      console.log('   - Generate and publish articles\n');
      console.log('📊 You can check the progress in Railway logs or use:');
      console.log(`   ${RAILWAY_URL}/api/news?limit=10\n`);
    } else {
      console.error('❌ Failed to trigger generation:', result.data);
      console.error(`   Status: ${result.status}`);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

generateArticles();
