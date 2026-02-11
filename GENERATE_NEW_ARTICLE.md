# Generate New Article with Updated Workflow

## ✅ Changes Made

1. **Excerpt Improvement:**
   - Now generates 2-3 line descriptions
   - Removes hashtags automatically
   - Uses meta description as base (better quality)

2. **Image Priority:**
   - First: Uses image from RSS feed (if available)
   - Second: Generates with Grok-2-Image (already configured)
   - Fallback: Placeholder image

3. **RSS Image Extraction:**
   - Checks `enclosure.url` (RSS standard)
   - Extracts from `<img>` tags in content
   - Checks `itunes:image` and `media:content` extensions

## 🚀 Generate New Article

### Option 1: Via Railway Admin API (Recommended)

Once Railway deploys (2-3 minutes), use:

```bash
# Set your API_KEY
$API_KEY = "your-api-key-here"

# Generate articles
Invoke-RestMethod -Uri "https://appifyglobalbackend-production.up.railway.app/api/admin/generate" `
  -Method POST `
  -Headers @{"x-api-key"=$API_KEY}

# Publish articles
Invoke-RestMethod -Uri "https://appifyglobalbackend-production.up.railway.app/api/admin/publish-all" `
  -Method POST `
  -Headers @{"x-api-key"=$API_KEY}
```

### Option 2: Via Railway CLI

```bash
railway login
railway link
railway run npm run generate
railway run node publish-article.js
```

### Option 3: Local (if API keys are set)

```bash
# Set environment variables
$env:DATABASE_URL="postgresql://..."
$env:OPENAI_API_KEY="sk-..."
$env:XAI_API_KEY="xai-..."
$env:RSS_FEED_URL="https://rss.app/feeds/_Ftsh8MCjwTLhxIZJ.xml"

# Build and run
npm run build
node generate-and-publish.js
```

## ✅ What to Check

After generating, verify:
1. **Excerpt:** Should be 2-3 lines, no hashtags
2. **Image:** Should use RSS image if available, otherwise Grok-2-Image
3. **Content:** Should be clean and well-formatted

## 📝 Next Steps

1. Wait for Railway to deploy (check Railway dashboard)
2. Generate new article using one of the methods above
3. Check frontend to see the new article with improved excerpt
