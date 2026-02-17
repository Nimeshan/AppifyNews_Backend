/**
 * Delete the Debenhams article and its image
 */

require('dotenv').config();
const https = require('https');
const http = require('http');

const RAILWAY_URL = process.env.RAILWAY_URL || 'https://appifyglobalbackend-production.up.railway.app';
const API_KEY = process.env.API_KEY || 'your-secret-api-key-for-write-endpoints';

function makeRequest(path, method = 'DELETE') {
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

async function deleteArticle() {
  try {
    const slug = "debenhams-pilots-agentic-ai-commerce-via-paypal-integration";
    
    console.log(`🗑️  Deleting article: ${slug}\n`);
    
    const result = await makeRequest(`/api/admin/article/${slug}`, 'DELETE');
    
    if (result.status === 200) {
      console.log('✅ Article deleted successfully!');
      if (result.data.deleted && result.data.deleted.imageDeleted) {
        console.log('✅ Image also deleted from Railbucket');
      }
      console.log(`\nDeleted: ${result.data.deleted.title}`);
    } else {
      console.error(`❌ Failed to delete: ${result.data.error || result.data}`);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

deleteArticle();
