# RSS Feed Configuration Guide

## Current Default Feeds

The system currently uses these RSS feeds by default:

### Core Tech Feeds
- **Wired**: `https://www.wired.com/feed/rss` - General tech, AI, culture
- **TechCrunch**: `https://techcrunch.com/feed/` - Startups, tech news, funding

### AI & Tech Focused
- **The Verge**: `https://www.theverge.com/rss/index.xml` - Tech reviews, AI, gadgets
- **Ars Technica**: `https://arstechnica.com/feed/` - Deep tech analysis, science
- **VentureBeat**: `https://venturebeat.com/feed/` - AI, enterprise tech, startups
- **MIT Technology Review**: `https://www.technologyreview.com/feed/` - AI research, emerging tech

### Startups & Business
- **Protocol**: `https://www.protocol.com/feed` - Tech industry news, startups
- **Fast Company**: `https://www.fastcompany.com/feed` - Innovation, business, design

## Configuration Options

### Option 1: Comma-Separated List (Recommended)
Set `RSS_FEED_URL` environment variable with all feeds:

```env
RSS_FEED_URL=https://www.wired.com/feed/rss,https://techcrunch.com/feed/,https://www.theverge.com/rss/index.xml,https://arstechnica.com/feed/
```

### Option 2: Individual Feed Variables
Set individual feed environment variables:

```env
WIRED_RSS_FEED_URL=https://www.wired.com/feed/rss
TECHCRUNCH_RSS_FEED_URL=https://techcrunch.com/feed/
VERGE_RSS_FEED_URL=https://www.theverge.com/rss/index.xml
ARS_TECHNICA_RSS_FEED_URL=https://arstechnica.com/feed/
VENTUREBEAT_RSS_FEED_URL=https://venturebeat.com/feed/
MIT_TECH_REVIEW_RSS_FEED_URL=https://www.technologyreview.com/feed/
PROTOCOL_RSS_FEED_URL=https://www.protocol.com/feed
FAST_COMPANY_RSS_FEED_URL=https://www.fastcompany.com/feed
```

### Option 3: Use Defaults
If no environment variables are set, the system uses the default feeds listed above.

## Additional RSS Feed Suggestions

### AI & Machine Learning
- **AI News**: `https://www.artificialintelligence-news.com/feed/`
- **Synced**: `https://syncedreview.com/feed/` (AI research)
- **Towards Data Science** (Medium): `https://towardsdatascience.com/feed`

### Web3 & Blockchain
- **CoinDesk**: `https://www.coindesk.com/arc/outboundfeeds/rss/`
- **Decrypt**: `https://decrypt.co/feed`
- **The Block**: `https://www.theblock.co/rss.xml`

### Design & UX
- **Smashing Magazine**: `https://www.smashingmagazine.com/feed/`
- **A List Apart**: `https://alistapart.com/main/feed/`
- **Designer News**: `https://www.designernews.co/?format=rss`

### Startups & Venture
- **Product Hunt**: `https://www.producthunt.com/feed`
- **Y Combinator**: `https://blog.ycombinator.com/feed/`
- **First Round Review**: `https://firstround.com/review/feed/`

### Work & Culture
- **Harvard Business Review**: `https://feeds.hbr.org/harvardbusiness`
- **Quartz**: `https://qz.com/feed/`
- **The Atlantic**: `https://www.theatlantic.com/feed/all/`

## Category Alignment

Current categories and suggested feeds:

- **AI**: MIT Technology Review, VentureBeat, Ars Technica
- **Web**: The Verge, Ars Technica, Smashing Magazine
- **Startups**: TechCrunch, Protocol, Product Hunt
- **Web3**: CoinDesk, Decrypt, The Block
- **Work**: Fast Company, Harvard Business Review
- **Design**: Smashing Magazine, A List Apart
- **Culture**: Wired, The Atlantic, Fast Company

## Adding New Feeds

To add a new feed:

1. **Via Environment Variable** (Recommended):
   ```env
   RSS_FEED_URL=existing_feeds,new_feed_url
   ```

2. **Update Default Feeds** (in code):
   Edit `src/services/rss.ts` and add to the default feeds array.

## Testing Feeds

You can test if an RSS feed is valid by:
1. Opening the URL in a browser
2. Checking if it returns valid XML/RSS content
3. Verifying the feed has recent articles

## Feed Limits

- The system processes up to 3 articles per cron run (configurable via `MAX_ARTICLES_PER_RUN`)
- Only new articles (not already in database) are processed
- Feeds are checked every hour when cron is enabled

## Troubleshooting

If a feed fails:
- The system logs an error but continues with other feeds
- Check the backend logs for `[RSS] Failed to fetch feed` messages
- Verify the feed URL is accessible and returns valid RSS/XML
