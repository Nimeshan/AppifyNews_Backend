// Test article detail endpoint
const http = require('http');

const slug = 'anthropic-buys-super-bowl-ads-to-slap-openai-for-selling-ads-in-chatgpt';

http.get(`http://localhost:4000/api/news/${slug}`, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const article = JSON.parse(data);
      console.log('✅ Article detail endpoint working!\n');
      console.log('📰 Article Details:');
      console.log(`   Title: ${article.title}`);
      console.log(`   Topics: ${article.topics}`);
      console.log(`   Author: ${article.author}`);
      console.log(`   Date: ${article.date}`);
      console.log(`   Excerpt: ${article.excerpt?.substring(0, 100)}...`);
      console.log(`   Content Blocks: ${article.content?.length || 0}`);
      console.log(`   Featured: ${article.isFeatured}`);
      console.log(`\n✅ Frontend can display this article!`);
    } catch (error) {
      console.error('❌ Error:', error.message);
      console.log('Response:', data);
    }
  });
}).on('error', (error) => {
  console.error('❌ Error:', error.message);
});
