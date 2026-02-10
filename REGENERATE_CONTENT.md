# Regenerate Content for Existing Articles

## ✅ Changes Made

1. **Fixed Double Headings:**
   - Parser now prevents consecutive headings
   - Distinguishes between h2 (heading) and h3 (subheading)
   - Subheadings are smaller in frontend (already implemented)

2. **Updated Content Parser:**
   - `h2` or `##` → `heading` (main heading, larger font)
   - `h3` or `###` → `subheading` (subheading, smaller font)
   - Skips if previous block was also a heading

## 🚀 Regenerate Content

### Option 1: Via Railway Admin API

```powershell
# Trigger regeneration for all articles
# (You'll need to create an endpoint or use the generate endpoint)
```

### Option 2: Via Script (Local with API Keys)

```bash
# Set environment variables
$env:DATABASE_URL="postgresql://..."
$env:OPENAI_API_KEY="sk-..."
$env:XAI_API_KEY="xai-..."
$env:RSS_FEED_URL="https://rss.app/feeds/_Ftsh8MCjwTLhxIZJ.xml"

# Build and run
npm run build
node regenerate-content.js
```

### Option 3: Generate New Articles (Easier)

Just generate new articles - they'll use the new format:
- No double headings
- Proper subheadings (h3)
- Clean HTML

## 📝 Frontend Styling

Subheadings are already styled smaller:
- **Heading (h2)**: `text-[20px] md:text-[24px] lg:text-[28px]`
- **Subheading (h3)**: `text-[17px] md:text-[19px] lg:text-[22px]`

Both are uppercase and bold.
