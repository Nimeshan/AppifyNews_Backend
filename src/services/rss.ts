import Parser from "rss-parser";
import { prisma } from "../lib/prisma";

const parser = new Parser();

export interface RSSItem {
  title: string;
  link: string;
  contentSnippet?: string;
  content?: string;
  pubDate?: string;
  categories?: string[];
  enclosure?: { url?: string };
  imageUrl?: string; // Extracted image from content or enclosure
}

/**
 * Fetch new articles from the RSS feed that haven't been processed yet.
 * Returns only items whose source URL doesn't already exist in the database.
 */
export async function fetchNewRSSItems(): Promise<RSSItem[]> {
  const feedUrl = process.env.RSS_FEED_URL;
  if (!feedUrl) {
    throw new Error("RSS_FEED_URL is not set");
  }

  console.log(`[RSS] Fetching feed: ${feedUrl}`);
  const feed = await parser.parseURL(feedUrl);
  console.log(`[RSS] Found ${feed.items.length} items in feed.`);

  // Filter out items that already exist in the database
  const newItems: RSSItem[] = [];

  for (const item of feed.items) {
    if (!item.link) continue;

    const exists = await prisma.article.findUnique({
      where: { sourceUrl: item.link },
      select: { id: true },
    });

    if (!exists) {
      // Extract image from RSS item
      let imageUrl: string | undefined;
      
      // Check enclosure first (RSS standard for images)
      if (item.enclosure?.url) {
        imageUrl = item.enclosure.url;
      }
      // Check content for img tags
      else if (item.content) {
        const imgMatch = item.content.match(/<img[^>]+src="([^"]+)"[^>]*>/i);
        if (imgMatch && imgMatch[1]) {
          imageUrl = imgMatch[1];
        }
      }
      // Check itunes:image or media:content (common RSS extensions)
      else if ((item as any)["itunes:image"]?.href) {
        imageUrl = (item as any)["itunes:image"].href;
      }
      else if ((item as any)["media:content"]?.url) {
        imageUrl = (item as any)["media:content"].url;
      }

      newItems.push({
        title: item.title || "Untitled",
        link: item.link,
        contentSnippet: item.contentSnippet,
        content: item.content,
        pubDate: item.pubDate,
        categories: item.categories,
        enclosure: item.enclosure,
        imageUrl,
      });
    }
  }

  console.log(`[RSS] ${newItems.length} new items to process.`);
  return newItems;
}
