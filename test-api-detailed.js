// Detailed API test with CORS check
const https = require('https');

const API_URL = 'https://appifyglobalbackend-production.up.railway.app';
const FRONTEND_URL = 'https://websitestagingnimeshan-production.up.railway.app';

console.log('🧪 Testing Railway API with Frontend URL...\n');
console.log(`Backend: ${API_URL}`);
console.log(`Frontend: ${FRONTEND_URL}\n`);

// Test with frontend origin header (simulating browser request)
const options = {
  headers: {
    'Origin': FRONTEND_URL,
    'Content-Type': 'application/json',
  }
};

https.get(`${API_URL}/api/news?status=published`, options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  console.log(`CORS Headers:`);
  console.log(`  access-control-allow-origin: ${res.headers['access-control-allow-origin']}`);
  console.log(`  access-control-allow-methods: ${res.headers['access-control-allow-methods']}`);
  console.log('');
  
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const articles = JSON.parse(data);
      console.log(`✅ API Response: ${articles.length} published articles\n`);
      
      if (articles.length > 0) {
        const article = articles[0];
        console.log('📰 First Article:');
        console.log(`   Title: ${article.title}`);
        console.log(`   Topics: ${article.topics}`);
        console.log(`   Status: ${article.status}`);
        console.log(`   Slug: ${article.slug}`);
        console.log(`   Content Blocks: ${article.content?.length || 0}\n`);
        
        // Check CORS
        const corsOrigin = res.headers['access-control-allow-origin'];
        if (corsOrigin === FRONTEND_URL || corsOrigin === '*') {
          console.log('✅ CORS is configured correctly!');
        } else {
          console.log(`⚠️  CORS issue: Allowing ${corsOrigin}, but frontend is ${FRONTEND_URL}`);
        }
      } else {
        console.log('⚠️  No published articles returned.');
        console.log('   Full response:', data);
      }
    } catch (error) {
      console.error('❌ Error parsing response:', error.message);
      console.log('Raw response:', data.substring(0, 500));
    }
  });
}).on('error', (err) => {
  console.error('❌ Request failed:', err.message);
});
