// Quick test script to run article generation
// Usage: node test-generate.js

require('dotenv').config({ path: '.env' });
const { execSync } = require('child_process');

console.log('🧪 Testing Article Generation...\n');

// Check required environment variables
const required = ['DATABASE_URL', 'OPENAI_API_KEY', 'RSS_FEED_URL'];
const missing = required.filter(key => !process.env[key]);

if (missing.length > 0) {
  console.error('❌ Missing required environment variables:');
  missing.forEach(key => console.error(`   - ${key}`));
  console.error('\nPlease set these in your .env file or environment.');
  process.exit(1);
}

console.log('✅ Environment variables check passed\n');
console.log('🚀 Running article generation...\n');

try {
  execSync('pnpm generate', { stdio: 'inherit', cwd: __dirname });
  console.log('\n✅ Test run completed!');
} catch (error) {
  console.error('\n❌ Test run failed:', error.message);
  process.exit(1);
}
