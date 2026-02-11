# Quick Test Instructions

## To Test Article Generation:

### On Railway (Easiest):
1. Go to your Railway dashboard
2. Open the backend service
3. Go to "Deployments" or "Logs"
4. Use Railway CLI or terminal:
   ```bash
   railway run npm run generate
   ```

### Locally:
1. Set environment variables (you can use Railway's values):
   ```powershell
   $env:DATABASE_URL="postgresql://postgres:SutGuMkPQWYuWNudhUrpDWYWQgfUHYWZ@shortline.proxy.rlwy.net:53169/railway"
   $env:OPENAI_API_KEY="your-key"
   $env:XAI_API_KEY="your-key"
   $env:RSS_FEED_URL="https://rss.app/feeds/_Ftsh8MCjwTLhxIZJ.xml"
   $env:MAX_ARTICLES_PER_RUN="1"
   ```

2. Run:
   ```bash
   npx tsx src/cron/generateArticles.ts
   ```

## What to Check After Generation:

1. **Database** - Query articles table:
   ```sql
   SELECT slug, title, topics, excerpt, meta_title, meta_description 
   FROM articles 
   ORDER BY created_at DESC 
   LIMIT 1;
   ```

2. **Content Blocks**:
   ```sql
   SELECT type, text, src, alt, sort_order 
   FROM article_content_blocks 
   WHERE article_id = (SELECT id FROM articles ORDER BY created_at DESC LIMIT 1)
   ORDER BY sort_order;
   ```

3. **API Response** - Check:
   ```
   GET http://localhost:4000/api/news
   ```
   Should return articles with `topics` field.

## Frontend Compatibility Note:

The frontend expects `category` but API returns `topics`. We should either:
- Update frontend to use `topics`, OR
- Map `topics` → `category` in API response
