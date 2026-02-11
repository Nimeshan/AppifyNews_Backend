# Solution: No Articles Showing on Frontend

## 🔍 Problem
The Railway backend has **0 published articles**. The article we created locally is in a different database.

## ✅ Solution Steps

### Step 1: Wait for Railway Deployment (2-3 minutes)
Railway is currently deploying the new admin endpoints. Check the Railway dashboard to see when deployment completes.

### Step 2: Set API_KEY in Railway
1. Go to Railway → **AppifyGlobal_Backend** → **Variables**
2. Add/Update: `API_KEY` = `your-secret-key-here` (use any secure string)

### Step 3: Generate Articles

**Option A: Use the script (easiest)**
```bash
cd AppifyBackend
# Set your API_KEY first
$env:API_KEY="your-secret-key-here"
node generate-on-railway.js
```

**Option B: Use curl/PowerShell**
```powershell
# Generate
Invoke-RestMethod -Uri "https://appifyglobalbackend-production.up.railway.app/api/admin/generate" `
  -Method POST `
  -Headers @{"x-api-key"="your-secret-key-here"}

# Publish
Invoke-RestMethod -Uri "https://appifyglobalbackend-production.up.railway.app/api/admin/publish-all" `
  -Method POST `
  -Headers @{"x-api-key"="your-secret-key-here"}
```

**Option C: Use Railway CLI**
```bash
railway run npm run generate
railway run node publish-article.js
```

### Step 4: Verify
Visit: `https://websitestagingnimeshan-production.up.railway.app/news`

Articles should now appear!

## 🔄 Alternative: Enable Auto-Generation

In Railway Variables, set:
- `ENABLE_CRON=true`
- `MAX_ARTICLES_PER_RUN=3`

Articles will generate automatically every 6 hours.

## 📝 Required Environment Variables in Railway

Make sure these are set:
- ✅ `DATABASE_URL` (auto-set from Postgres)
- ✅ `OPENAI_API_KEY`
- ✅ `XAI_API_KEY`
- ✅ `RSS_FEED_URL`
- ✅ `FRONTEND_URL` = `https://websitestagingnimeshan-production.up.railway.app`
- ✅ `API_KEY` (for admin endpoints)
