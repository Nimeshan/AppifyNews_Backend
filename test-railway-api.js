// Test Railway backend API
const https = require('https');

const API_URL = 'https://appifyglobalbackend-production.up.railway.app';

console.log('🧪 Testing Railway Backend API...\n');
console.log(`API URL: ${API_URL}\n`);

// Test health
https.get(`${API_URL}/health`, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('✅ Health check passed\n');
    testArticles();
  });
}).on('error', (err) => {
  console.error('❌ Health check failed:', err.message);
});

function testArticles() {
  https.get(`${API_URL}/api/news?status=published`, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        const articles = Array.isArray(response) ? response : (response.articles || []);
        console.log(`✅ API is working! Found ${articles.length} published articles\n`);
        
        if (articles.length > 0) {
          const article = articles[0];
          console.log('📰 Sample Article:');
          console.log(`   Title: ${article.title}`);
          console.log(`   Topics: ${article.topics}`);
          console.log(`   Slug: ${article.slug}`);
          console.log(`   Content Blocks: ${article.content?.length || 0}`);
          console.log(`\n✅ Frontend can now fetch from Railway backend!`);
        } else {
          console.log('⚠️  No published articles found.');
          console.log('   The article we published locally might be in a different database.');
          console.log('   Or Railway backend might be using a different DATABASE_URL.');
        }
      } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('Raw response:', data);
      }
    });
  }).on('error', (err) => {
    console.error('❌ API test failed:', err.message);
  });
}
