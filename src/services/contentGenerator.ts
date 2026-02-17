import OpenAI from "openai";
import { RSSItem } from "./rss";
import { detectTopic, getTopicBlueprint } from "./topicDetector";

let openai: OpenAI;

function getOpenAI(): OpenAI {
  if (!openai) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
}

/**
 * Generate a blog post from an RSS article using OpenAI GPT-4o-mini.
 * Mirrors the Make.com GPT step with the same prompts.
 */
/**
 * Extract key entities from a title dynamically
 * This makes the system universal - works for any article title
 */
function extractEntities(title: string): string[] {
  const entities: string[] = [];
  
  // Extract capitalized words (likely company/product names)
  const capitalized = title.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
  entities.push(...capitalized.filter(e => e.length > 2));
  
  // Extract quoted phrases
  const quoted = title.match(/"([^"]+)"/g) || [];
  entities.push(...quoted.map(q => q.replace(/"/g, '')));
  
  // Extract numbers with context (10x, $500M, etc.)
  const numbers = title.match(/\d+x|\$\d+M?|\d+%|\d+\.\d+x/gi) || [];
  entities.push(...numbers);
  
  // Extract acronyms (all caps words, 2+ chars)
  const acronyms = title.match(/\b[A-Z]{2,}\b/g) || [];
  entities.push(...acronyms);
  
  // Extract technology keywords (AI, ML, etc.)
  const techKeywords = ['AI', 'ML', 'GPT', 'LLM', 'API', 'SDK', 'SaaS', 'PaaS', 'IaaS', 'GRPO', 'SRPO'];
  techKeywords.forEach(keyword => {
    if (title.includes(keyword)) {
      entities.push(keyword);
    }
  });
  
  // Remove duplicates and common words
  const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'be', 'can', 'with', 'via'];
  return [...new Set(entities)]
    .filter(e => !commonWords.includes(e.toLowerCase()))
    .filter(e => e.length > 1)
    .slice(0, 10); // Limit to top 10 entities
}

export async function generateBlogContent(item: RSSItem): Promise<string> {
  console.log(`[OpenAI] Generating blog for: ${item.title}`);

  // Extract key entities from title dynamically
  const keyEntities = extractEntities(item.title);
  const primaryTopic = item.title;
  
  console.log(`[OpenAI] Extracted entities: ${keyEntities.join(', ')}`);

  // Fetch the actual article content from the URL (like Make.com does)
  let articleContent = "";
  if (item.link) {
    try {
      const { fetchArticleContent } = await import("../services/contentGeneratorCode");
      const articleData = await fetchArticleContent(item.link);
      articleContent = articleData.content || "";
      console.log(`[OpenAI] Fetched article content from URL (${articleContent.length} chars)`);
    } catch (error: any) {
      console.warn(`[OpenAI] Could not fetch article content from URL: ${error.message}`);
      // Fallback to RSS content
      articleContent = item.contentSnippet || item.content || "";
    }
  } else {
    articleContent = item.contentSnippet || item.content || "";
  }

  const response = await getOpenAI().chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 1, // Match Make.com temperature
    max_tokens: 2500, // Match Make.com max_tokens
    messages: [
      {
        role: "system",
        content: `You are a senior AI industry analyst writing for Appify Australia.

Your task: Rewrite the provided RSS article into an original, SEO-optimized thought-leadership blog that stays strictly focused on the RSS title topic.

**ENTITY ANCHORING SYSTEM:**

Before writing, you must extract and use KEY_ENTITIES from the RSS title:
KEY_ENTITIES: ${keyEntities.length > 0 ? keyEntities.join(', ') : '[Extract from title]'}
PRIMARY_TOPIC: "${primaryTopic}"

**CRITICAL RULES:**
1. Every H2 heading MUST contain at least one KEY_ENTITY
2. Every paragraph MUST directly reference at least one KEY_ENTITY
3. The article must stay within the scope of the PRIMARY_TOPIC
4. If more than 20% of headings don't contain KEY_ENTITIES, the article fails
5. If more than 25% of paragraphs don't mention KEY_ENTITIES, the article fails

**FORBIDDEN:**
- Generic headings like "Understanding AI", "Benefits of AI App Development", "The Future of AI"
- Generic paragraphs about "AI app development" unless PRIMARY_TOPIC is specifically about that
- Content that doesn't relate to KEY_ENTITIES or PRIMARY_TOPIC
- Standalone definition sections
- Generic filler content

**REQUIRED:**
- Introduction must mention at least 2 KEY_ENTITIES within first 120 words
- All headings must include KEY_ENTITIES
- All paragraphs must reference KEY_ENTITIES
- Include 4-6 strategic internal/external links with natural anchor text
- DO NOT include "Meta Title", "Meta Description", or "Topics" sections`,
      },
      {
        role: "assistant",
        content: `Rule 1: Blog length MUST be between 1200-1800 words.
Rule 2: Tone must be executive, analytical, strategic.
Rule 3: Every heading and paragraph must anchor to KEY_ENTITIES.
Rule 4: Structure: Introduction (mention 2+ KEY_ENTITIES in first 120 words) → Body sections (each with KEY_ENTITY in heading) → Conclusion.
Rule 5: Validation: More than 20% of headings without KEY_ENTITIES = FAIL. More than 25% of paragraphs without KEY_ENTITIES = FAIL.`,
      },
      {
        role: "user",
        content: `RSS Article:
Title: ${item.title}
URL: ${item.link || 'N/A'}
Content: ${articleContent.slice(0, 5000) || item.contentSnippet || item.content || 'No content available'}

**EXTRACTED ENTITIES:**
KEY_ENTITIES: ${keyEntities.join(', ')}
PRIMARY_TOPIC: "${primaryTopic}"

**YOUR TASK:**
Write an original, SEO-optimized blog about "${primaryTopic}".

**MANDATORY REQUIREMENTS:**
1. Introduction: Mention at least 2 KEY_ENTITIES within first 120 words
2. Headings: Every H2 must contain at least one KEY_ENTITY from the list above
3. Paragraphs: Every paragraph must directly reference at least one KEY_ENTITY
4. SEO: Include 4-6 strategic links (internal: /automation, /projects, /studio; external: credible sources)
5. Forbidden: Generic "AI App Development" content, generic headings, content unrelated to KEY_ENTITIES

**HEADING EXAMPLES (based on KEY_ENTITIES):**
${keyEntities.length > 0 ? `- Use KEY_ENTITIES in headings, e.g.:
  * If KEY_ENTITIES include "Debenhams" and "PayPal" → "Debenhams' PayPal Integration Strategy"
  * If KEY_ENTITIES include "GRPO" and "SRPO" → "GRPO vs SRPO: Efficiency Comparison"
  * If KEY_ENTITIES include "Microsoft" and "Copilot Studio" → "Microsoft's Copilot Studio for Enterprise Automation"` : '- Extract entities from title and use them in headings'}

**VALIDATION:**
- More than 20% of headings without KEY_ENTITIES = FAIL
- More than 25% of paragraphs without KEY_ENTITIES = FAIL

Write the article now, ensuring every section anchors to the KEY_ENTITIES: ${keyEntities.join(', ')}.`,
      },
    ],
  });

  let content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("OpenAI returned empty content");
  }

  // Clean up any AI explanations or markdown code blocks
  // Remove markdown code blocks (```markdown, ```, etc.)
  content = content.replace(/```[a-z]*\s*/gi, "");
  content = content.replace(/```\s*/g, "");
  
  // Convert bullet points and checklists to paragraphs (fallback - LLM should have already done this)
  // This expands any bullet points that slipped through into full paragraphs
  // Match bullet points at start of line (markdown format: - item, * item, • item)
  content = content.replace(/^[\s]*[-*•]\s+(.+)$/gm, (match, bulletText) => {
    // Remove bullet marker and return as paragraph text
    return bulletText.trim();
  });
  
  // Convert numbered lists to paragraphs
  content = content.replace(/^\d+\.\s+(.+)$/gm, (match, listText) => {
    return listText.trim();
  });
  
  // Remove any remaining list markers (•, ◦, ▪, ▫)
  content = content.replace(/^[\s]*[•◦▪▫]\s+/gm, "");
  
  // Detect and expand bullet-like patterns: "**Title:** description" or "*Title:* description"
  // These are often used for "best practices" or "key points" that should be full paragraphs
  content = content.replace(/\*\*([^*:]+):\*\*\s*([^\n]+)/g, (match, title, description) => {
    const titleClean = title.trim();
    const descClean = description.trim();
    const wordCount = descClean.split(/\s+/).length;
    
    // If description is already substantial (60+ words), it's probably already a paragraph
    if (wordCount >= 60) {
      return `**${titleClean}:** ${descClean}`;
    }
    
    // Otherwise, expand it into a full paragraph format
    // The LLM should have done this, but as fallback, we'll format it as a paragraph
    // Note: This is a minimal expansion - the LLM should be doing the real expansion
    return `**${titleClean}:** ${descClean}`;
  });
  
  // Remove common AI explanation patterns
  content = content.replace(/^(Here's|Here is|This article|This content|The following|Below is).*?:\s*/gim, "");
  content = content.replace(/^(I'll|I will|Let me|I'm going to).*?\.\s*/gim, "");
  
  // Remove any text before first heading or paragraph
  const firstHeading = content.search(/^##\s+/m);
  const firstParagraph = content.search(/^[A-Z]/m);
  const startIndex = firstHeading !== -1 ? firstHeading : (firstParagraph !== -1 ? firstParagraph : 0);
  if (startIndex > 0) {
    content = content.substring(startIndex);
  }
  
  // Remove any trailing explanations
  content = content.replace(/\n\n*(In conclusion|To summarize|In summary|Overall|Finally).*$/gim, "");
  
  // Remove promotional CTA sentences (keep only the last one if multiple exist, max 1 total)
  // Pattern: Sentences that mention "our [service/page/section]", "visit our", "explore our", etc.
  try {
    const ctaSentencePattern = /([^.!?\n]*(?:can be explored|visit our|explore our|our (?:dedicated|automation|projects|phone|studio|services|section)|for insights|for more|to learn more|to explore).*?(?:page|section|visit|check|see|explore).*?[.!?\n])/gi;
    
    const ctaMatches: Array<{ match: string; index: number }> = [];
    let match;
    
    // Reset regex lastIndex and find all matches
    ctaSentencePattern.lastIndex = 0;
    while ((match = ctaSentencePattern.exec(content)) !== null) {
      if (match.index !== undefined && match[0] && match[0].trim().length > 0) {
        ctaMatches.push({ match: match[0].trim(), index: match.index });
      }
    }
    
    // Remove all CTAs except the last one (if there are multiple)
    if (ctaMatches.length > 1) {
      // Sort by index in reverse order to remove from end to start (preserves indices)
      ctaMatches.sort((a, b) => b.index - a.index);
      // Remove all but the last CTA, working backwards to preserve indices
      let updatedContent = content;
      for (let i = 0; i < ctaMatches.length - 1; i++) {
        const cta = ctaMatches[i];
        const before = updatedContent.substring(0, cta.index);
        const after = updatedContent.substring(cta.index + cta.match.length);
        updatedContent = before + after;
      }
      content = updatedContent;
    }
  } catch (error) {
    // If CTA removal fails, log but don't break the pipeline
    console.warn("[ContentGenerator] Error removing CTAs:", error);
  }
  
  // Remove duplicate section headings (keep only first occurrence)
  const seenHeadings = new Set<string>();
  const lines = content.split('\n');
  const cleanedLines: string[] = [];
  
  for (const line of lines) {
    const headingMatch = line.match(/^##\s+(.+)$/);
    if (headingMatch) {
      const headingText = headingMatch[1].trim().toLowerCase();
      if (seenHeadings.has(headingText)) {
        // Skip duplicate heading and its content until next heading
        continue;
      }
      seenHeadings.add(headingText);
    }
    cleanedLines.push(line);
  }
  
  content = cleanedLines.join('\n');
  
  // Remove any "Conclusion" sections (we don't want conclusion sections)
  content = content.replace(/\n##\s+Conclusion\s*\n[\s\S]*$/gim, "");
  
  // Clean up extra whitespace
  content = content.trim();

  console.log(`[OpenAI] Generated ${content.split(" ").length} words.`);
  return content;
}
