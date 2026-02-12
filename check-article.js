// Check if article exists
const https = require('https');

const RAILWAY_URL = 'https://appifyglobalbackend-production.up.railway.app';

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const req = https.request(`${RAILWAY_URL}${path}`, (res) => {
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

async function main() {
  console.log('Checking for article...\n');
  
  try {
    // Check specific article
    const article = await makeRequest('/api/news/ai-industry-rivals-are-teaming-up-on-a-startup-accelerator');
    if (article.status === 200) {
      console.log('✅ Article found!');
      console.log('Title:', article.data.title);
      console.log('Slug:', article.data.slug);
      console.log('Created:', article.data.timestamp);
    } else {
      console.log('❌ Article not found (Status:', article.status + ')');
    }
    
    // Check recent articles
    console.log('\n📰 Recent articles:');
    const recent = await makeRequest('/api/news?status=published&limit=5');
    if (recent.status === 200 && Array.isArray(recent.data)) {
      recent.data.forEach((a, i) => {
        console.log(`${i + 1}. ${a.title} (${a.slug})`);
      });
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
