/**
 * Check the actual images that were generated and their prompts
 */

require('dotenv').config();
const https = require('https');
const http = require('http');

const RAILWAY_URL = process.env.RAILWAY_URL || 'https://appifyglobalbackend-production.up.railway.app';
const API_KEY = process.env.API_KEY || 'your-secret-api-key-for-write-endpoints';

const articlesToCheck = [
  "Building an AI Agent to Detect and Handle Anomalies in Time-Series Data",
  "AI in Multiple GPUs: Understanding the Host and Device Paradigm in AI App Development",
  "How to Leverage Explainable AI for Better Business Decisions and Outcomes",
  "AI in Multiple GPUs: Point-to-Point and Collective Operations"
];

function makeRequest(path, method = 'GET') {
  return new Promise((resolve, reject) => {
    const url = new URL(`${RAILWAY_URL}${path}`);
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method,
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json',
      },
    };

    const client = url.protocol === 'https:' ? https : http;
    const req = client.request(options, (res) => {
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

async function checkImages() {
  try {
    console.log('🔍 Checking generated images...\n');
    
    // Fetch all articles
    const result = await makeRequest('/api/news?limit=50', 'GET');
    
    if (result.status !== 200 || !Array.isArray(result.data)) {
      console.error('❌ Failed to fetch articles:', result.data);
      return;
    }

    const allArticles = result.data;
    
    console.log('📋 Found articles with images:\n');
    
    articlesToCheck.forEach((searchTitle, index) => {
      const article = allArticles.find(a => 
        a.title && a.title.toLowerCase().includes(searchTitle.toLowerCase())
      );
      
      if (article) {
        console.log(`${index + 1}. ${article.title}`);
        console.log(`   Image URL: ${article.imageUrl}`);
        console.log(`   Topics: ${article.topics}`);
        console.log(`   Description: ${article.metaDescription ? article.metaDescription.substring(0, 100) + '...' : 'None'}`);
        console.log('');
      } else {
        console.log(`${index + 1}. ❌ Not found: ${searchTitle}\n`);
      }
    });
    
    // Check if images are similar (all brain images)
    const brainImages = allArticles.filter(a => 
      a.imageUrl && (
        a.imageUrl.includes('building-an-ai-agent') ||
        a.imageUrl.includes('ai-in-multiple-gpus') ||
        a.imageUrl.includes('explainable-ai') ||
        a.imageUrl.includes('point-to-point')
      )
    );
    
    if (brainImages.length > 0) {
      console.log('⚠️  Note: If all images look similar (brain/neural network), the prompts might be too generic.');
      console.log('   The custom prompt system should generate unique prompts for each article.\n');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkImages();
