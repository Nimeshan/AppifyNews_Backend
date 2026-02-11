// Test all articles regardless of status
const https = require('https');

const API_URL = 'https://appifyglobalbackend-production.up.railway.app';

console.log('🧪 Testing Railway Backend - All Articles\n');

// Test without status filter
https.get(`${API_URL}/api/news`, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log(`Status Code: ${res.statusCode}`);
    console.log(`Response Headers:`, res.headers);
    console.log(`Raw Response:`, data.substring(0, 500));
    console.log('\n');
    
    try {
      const response = JSON.parse(data);
      const articles = Array.isArray(response) ? response : (response.articles || []);
      console.log(`✅ Found ${articles.length} articles (all statuses)\n`);
      
      if (articles.length > 0) {
        articles.forEach((article, i) => {
          console.log(`${i + 1}. ${article.title}`);
          console.log(`   Status: ${article.status}`);
          console.log(`   Topics: ${article.topics}`);
          console.log(`   Slug: ${article.slug}\n`);
        });
      } else {
        console.log('⚠️  No articles found at all.');
        console.log('Full response:', JSON.stringify(response, null, 2));
      }
    } catch (error) {
      console.error('❌ Error parsing:', error.message);
      console.log('Raw response:', data);
    }
  });
}).on('error', (err) => {
  console.error('❌ Error:', err.message);
});
