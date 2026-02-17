/**
 * Regenerate excerpt/summary for a specific article
 * Usage: node regenerate-excerpt.js "Article Title"
 */

require('dotenv').config();
const https = require('https');
const http = require('http');

const RAILWAY_URL = process.env.RAILWAY_URL || 'https://appifyglobalbackend-production.up.railway.app';
const API_KEY = process.env.API_KEY || 'your-secret-api-key-for-write-endpoints';

// Get article title from command line argument or use default
const articleTitle = process.argv[2] || "Building an AI Agent to Detect and Handle Anomalies in Time-Series Data";

function makeRequest(path, method = 'POST', body = null) {
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
    
    if (body) {
      req.write(JSON.stringify(body));
    }
    
    req.end();
  });
}

async function regenerateExcerpt() {
  try {
    console.log(`🔄 Regenerating excerpt for: "${articleTitle}"\n`);
    
    const result = await makeRequest('/api/admin/regenerate-excerpts', 'POST', {
      articleTitles: [articleTitle]
    });
    
    if (result.status === 200 && result.data.success) {
      console.log(`✅ ${result.data.message}\n`);
      
      result.data.results.forEach((r, i) => {
        if (r.success) {
          console.log(`${i + 1}. ✅ ${r.title}`);
          console.log(`   Slug: ${r.slug}`);
          console.log(`   Old excerpt: ${r.oldExcerpt.substring(0, 150)}...`);
          console.log(`   New excerpt: ${r.newExcerpt}`);
          console.log(`   Length: ${r.newExcerpt.length} characters\n`);
        } else {
          console.log(`${i + 1}. ❌ ${r.title || 'Unknown'}`);
          console.log(`   Error: ${r.error}\n`);
        }
      });
    } else {
      console.error('❌ Failed to regenerate excerpt:', result.data);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

regenerateExcerpt();
