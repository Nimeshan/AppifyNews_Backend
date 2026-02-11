# Quick Start: Generate Articles on Railway

## 🚀 Method 1: Use Admin API (Easiest)

Once Railway deploys the new code, you can trigger generation via API:

### Step 1: Get your API_KEY from Railway
1. Go to Railway → AppifyGlobal_Backend → Variables
2. Copy your `API_KEY` value (or set one if not set)

### Step 2: Generate Articles
```bash
curl -X POST https://appifyglobalbackend-production.up.railway.app/api/admin/generate \
  -H "x-api-key: YOUR_API_KEY"
```

### Step 3: Publish Articles
```bash
curl -X POST https://appifyglobalbackend-production.up.railway.app/api/admin/publish-all \
  -H "x-api-key: YOUR_API_KEY"
```

### Step 4: Check Stats
```bash
curl https://appifyglobalbackend-production.up.railway.app/api/admin/stats \
  -H "x-api-key: YOUR_API_KEY"
```

## 🛠️ Method 2: Railway CLI

1. Install Railway CLI:
   ```bash
   npm i -g @railway/cli
   ```

2. Login and link:
   ```bash
   railway login
   railway link
   ```

3. Generate articles:
   ```bash
   railway run npm run generate
   ```

4. Publish articles:
   ```bash
   railway run node publish-article.js
   ```

## ⚙️ Method 3: Enable Auto-Generation

1. In Railway → Variables, set:
   - `ENABLE_CRON=true`
   - `MAX_ARTICLES_PER_RUN=3`

2. Articles will auto-generate every 6 hours

## ✅ After Generation

Visit your frontend: `https://websitestagingnimeshan-production.up.railway.app/news`

Articles should now appear!
