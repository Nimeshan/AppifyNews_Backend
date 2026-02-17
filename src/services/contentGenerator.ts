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
 * Extract key entities from a title dynamically with PRIMARY_ENTITY detection
 * This makes the system universal - works for any article title
 * Returns both primary entity (usually company name) and all key entities
 */
function extractEntities(title: string): {
  primaryEntity: string | null;
  keyEntities: string[];
} {
  const entities: string[] = [];

  // 1️⃣ Detect ALL CAPS acronyms (SRPO, GRPO, LLM, API)
  const allCaps = title.match(/\b[A-Z]{2,}\b/g) || [];
  entities.push(...allCaps);

  // 2️⃣ Detect multi-word capitalized phrases (Copilot Studio, Kwai AI)
  const multiCaps = title.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\b/g) || [];
  entities.push(...multiCaps);

  // 3️⃣ Detect single capitalized proper nouns (Debenhams, Microsoft)
  const singleCaps = title.match(/\b[A-Z][a-z]+\b/g) || [];
  entities.push(...singleCaps);

  // 4️⃣ Detect compound AI phrases (agentic AI, AI commerce, PayPal integration)
  const compoundPhrases =
    title.match(/\b([a-z]+ AI|AI [a-z]+|[A-Z][a-z]+ integration|AI commerce|AI platform|AI model)\b/gi) || [];
  // Capitalize properly
  const capitalizedPhrases = compoundPhrases.map(phrase => {
    return phrase.split(/\s+/).map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  });
  entities.push(...capitalizedPhrases);

  // 5️⃣ Detect financial / performance claims (10x, $500M, 20%)
  const metrics = title.match(/\d+x|\$\d+(?:M|B)?|\d+%/gi) || [];
  entities.push(...metrics);

  // 6️⃣ Extract quoted phrases
  const quoted = title.match(/"([^"]+)"/g) || [];
  entities.push(...quoted.map(q => q.replace(/"/g, '')));

  // 7️⃣ Extract hyphenated names
  const hyphenated = title.match(/\b[A-Z][a-z]+-[A-Z][a-z]+/g) || [];
  entities.push(...hyphenated);

  // 8️⃣ Clean stopwords
  const stopCaps = [
    "Can", "Will", "How", "Why", "When", "What", "Where",
    "Who", "Which", "This", "That", "These", "Those",
    "The", "A", "An"
  ];

  const commonWords = [
    "the", "a", "an", "and", "or", "but", "in", "on", "at",
    "to", "for", "of", "with", "by", "is", "are", "be",
    "via", "from"
  ];

  const cleaned = [...new Set(entities)]
    .filter(e => !commonWords.includes(e.toLowerCase()))
    .filter(e => !stopCaps.includes(e))
    .filter(e => e.length > 1);

  // 9️⃣ Detect PRIMARY_ENTITY (first strong capitalized brand name)
  const primaryMatch = title.match(/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/);
  let primaryEntity = primaryMatch ? primaryMatch[0] : null;
  
  // Validate primary entity is not a stopword
  if (primaryEntity && stopCaps.includes(primaryEntity)) {
    // Try to find next capitalized word
    const nextMatch = title.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g);
    if (nextMatch && nextMatch.length > 1) {
      primaryEntity = nextMatch[1];
    } else {
      primaryEntity = null;
    }
  }

  // 🔟 Prioritize primary entity first
  const finalEntities = primaryEntity
    ? [primaryEntity, ...cleaned.filter(e => e !== primaryEntity && !e.toLowerCase().includes(primaryEntity.toLowerCase()))]
    : cleaned;

  return {
    primaryEntity,
    keyEntities: finalEntities.slice(0, 6)
  };
}

/**
 * Generate article outline first - ensures headings match the RSS article
 */
async function generateArticleOutline(
  item: RSSItem, 
  primaryEntity: string | null, 
  keyEntities: string[],
  articleContent: string
): Promise<string> {
  console.log(`[OpenAI] Generating article outline for: ${item.title}`);
  
  const primaryTopic = item.title;
  
  // Extract action from title
  const actionMatch = item.title.match(/\b(pilots?|launches?|integrates?|acquires?|tests?|announces?|will be|is|are|out of stock|shortage|crisis)\b/i);
  const titleAction = actionMatch ? actionMatch[1] : 'action';
  
  const response = await getOpenAI().chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.3, // Lower temperature for more structured output
    max_tokens: 500,
    messages: [
      {
        role: "system",
        content: `You are creating an article outline for a technology news blog.

RSS TITLE: "${primaryTopic}"
PRIMARY_ENTITY: "${primaryEntity || primaryTopic}"
KEY_ENTITIES: ${keyEntities.join(', ')}
TITLE ACTION: "${titleAction}"

CRITICAL REQUIREMENTS:
1. Generate 4-6 H2 headings that MUST include PRIMARY_ENTITY "${primaryEntity || primaryTopic}" in at least 3 headings
2. Each heading must relate to the SPECIFIC NEWS STORY in the title, not generic topics
3. Headings must discuss the ACTION: "${titleAction}"
4. FORBIDDEN: Generic headings like "Understanding AI", "Benefits of AI App Development", "AI App Development Strategies", "The Future of AI in App Development"

OUTPUT FORMAT:
Return ONLY a numbered list of headings in this exact format:
1. <h2>HEADING TEXT HERE</h2>
2. <h2>HEADING TEXT HERE</h2>
3. <h2>HEADING TEXT HERE</h2>
...

Each heading must:
- Include PRIMARY_ENTITY or a KEY_ENTITY
- Be specific to the news story
- NOT be generic AI content

Example for "Debenhams pilots agentic AI commerce via PayPal integration":
1. <h2>DEBENHAMS' AGENTIC AI COMMERCE PILOT PROGRAM</h2>
2. <h2>PAYPAL INTEGRATION IN DEBENHAMS' CHECKOUT STRATEGY</h2>
3. <h2>HOW DEBENHAMS IS TESTING AGENTIC AI IN RETAIL</h2>
4. <h2>THE IMPACT OF DEBENHAMS' AI COMMERCE INITIATIVE</h2>

Example for "Valve's Steam Deck OLED will be intermittently out of stock":
1. <h2>VALVE'S STEAM DECK OLED STOCK SHORTAGE</h2>
2. <h2>THE RAM CRISIS IMPACTING STEAM DECK SUPPLY CHAINS</h2>
3. <h2>HOW VALVE IS MANAGING INTERMITTENT STOCK AVAILABILITY</h2>
4. <h2>THE SUPPLY CHAIN CHALLENGES AFFECTING GAMING HARDWARE</h2>

Return ONLY the numbered list, nothing else.`,
      },
      {
        role: "user",
        content: `RSS Article:
Title: ${item.title}
Content: ${articleContent.slice(0, 1500)}

Generate the article outline with headings that match this specific news story.`,
      },
    ],
  });

  let outline = response.choices[0]?.message?.content || "";
  
  // Validate outline
  if (primaryEntity) {
    const entityCount = (outline.match(new RegExp(primaryEntity, 'gi')) || []).length;
    if (entityCount < 3) {
      console.warn(`[OpenAI] Outline validation: PRIMARY_ENTITY "${primaryEntity}" appears only ${entityCount} times. Regenerating...`);
      // Retry once with stronger enforcement
      const retryResponse = await getOpenAI().chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.2,
        max_tokens: 500,
        messages: [
          {
            role: "system",
            content: `CRITICAL: The previous outline was rejected because PRIMARY_ENTITY "${primaryEntity}" did not appear in enough headings.

You MUST create an outline where "${primaryEntity}" appears in at least 3 headings.

RSS TITLE: "${primaryTopic}"
PRIMARY_ENTITY: "${primaryEntity}"
KEY_ENTITIES: ${keyEntities.join(', ')}

Generate 4-6 headings where "${primaryEntity}" is in at least 3 headings.

Format: Numbered list with <h2> tags.
FORBIDDEN: Generic AI headings.`,
          },
          {
            role: "user",
            content: `Title: ${item.title}\n\nGenerate outline with "${primaryEntity}" in at least 3 headings.`,
          },
        ],
      });
      outline = retryResponse.choices[0]?.message?.content || outline;
    }
  }
  
  console.log(`[OpenAI] Generated outline:\n${outline}`);
  return outline;
}

export async function generateBlogContent(item: RSSItem): Promise<string> {
  console.log(`[OpenAI] Generating blog for: ${item.title}`);

  // Extract key entities from title dynamically
  const { primaryEntity, keyEntities } = extractEntities(item.title);
  const primaryTopic = item.title;
  
  // Fallback: If we have less than 2 entities, add primary topic as context
  let finalKeyEntities = keyEntities;
  if (keyEntities.length < 2) {
    console.log(`[OpenAI] Warning: Only ${keyEntities.length} entities extracted. Adding primary topic as fallback.`);
    finalKeyEntities = [...keyEntities, primaryTopic];
  }
  
  console.log(`[OpenAI] Extracted entities: ${finalKeyEntities.join(', ')}`);
  if (primaryEntity) {
    console.log(`[OpenAI] Primary entity: ${primaryEntity}`);
  }

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

  // STEP 1: Generate outline first
  const outline = await generateArticleOutline(item, primaryEntity, finalKeyEntities, articleContent);
  
  // Extract headings from outline
  const headingMatches = outline.match(/<h2[^>]*>(.+?)<\/h2>/gi) || [];
  const headings = headingMatches.map(h => h.replace(/<\/?h2[^>]*>/gi, '').trim());
  
  if (headings.length === 0) {
    console.warn(`[OpenAI] No headings found in outline, falling back to direct generation`);
  } else {
    console.log(`[OpenAI] Using outline with ${headings.length} headings: ${headings.slice(0, 3).join(', ')}...`);
  }

  // STEP 2: Write the full article following the outline
  const response = await getOpenAI().chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.4,
    max_tokens: 2500,
    messages: [
      {
        role: "system",
        content: `You are a senior technology industry analyst writing for Appify Australia.

Your task is to write an article following the EXACT outline provided below.

RSS TITLE: "${primaryTopic}"
PRIMARY_ENTITY: "${primaryEntity || primaryTopic}"
KEY_ENTITIES: ${finalKeyEntities.join(', ')}

CRITICAL INSTRUCTIONS:
1. You MUST follow the provided outline EXACTLY - use the headings in the order given
2. Write content for each heading that discusses the SPECIFIC NEWS STORY in the title
3. PRIMARY_ENTITY "${primaryEntity || primaryTopic}" must appear in the introduction and throughout
4. Each paragraph must relate to the specific news story, NOT generic AI topics
5. FORBIDDEN: Generic "AI app development" content, generic AI benefits, how-to guides, definition sections

OUTLINE TO FOLLOW:
${outline}

Write the full article now, using the headings from the outline in order. Each section should discuss the specific news story about ${primaryEntity || 'the company'} and ${finalKeyEntities.slice(0, 2).join(' and ')}.

FORMATTING REQUIREMENTS:
- Use the exact headings from the outline (already in <h2> format)
- Paragraphs should be wrapped in <p> tags: <p>Paragraph text here.</p>
- Include 4-6 contextual links (internal: /automation, /projects, /studio; plus credible external sources)
- 1200-1600 words total
- Executive, analytical tone

ABSOLUTE BAN:
- Do NOT write generic "AI app development" content
- Do NOT write about general AI benefits or strategies
- Do NOT write definition sections unless directly about the news story
- The article is about the SPECIFIC NEWS STORY, not AI generally`,
      },
      {
        role: "user",
        content: `RSS Article:
Title: ${item.title}
URL: ${item.link || 'N/A'}
Content: ${articleContent.slice(0, 1500) || item.contentSnippet || item.content || 'No content available'}

Write the full article following the outline. Each section should discuss the specific news story about ${primaryEntity || 'the company'} and ${finalKeyEntities.slice(0, 2).join(' and ')}.`,
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
  // Check for HTML headings first, then markdown, then plain text
  const firstHtmlHeading = content.search(/^<h2[^>]*>/im);
  const firstMarkdownHeading = content.search(/^##\s+/m);
  const firstParagraph = content.search(/^<p[^>]*>|^[A-Z]/im);
  const startIndex = firstHtmlHeading !== -1 ? firstHtmlHeading : 
                     (firstMarkdownHeading !== -1 ? firstMarkdownHeading : 
                      (firstParagraph !== -1 ? firstParagraph : 0));
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
    // Check for HTML headings
    const htmlHeadingMatch = line.match(/^<h2[^>]*>(.+?)<\/h2>/i);
    // Check for markdown headings (fallback)
    const markdownHeadingMatch = line.match(/^##\s+(.+)$/);
    
    if (htmlHeadingMatch || markdownHeadingMatch) {
      const headingText = (htmlHeadingMatch ? htmlHeadingMatch[1] : markdownHeadingMatch![1]).trim().toLowerCase();
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
  content = content.replace(/<h2[^>]*>\s*Conclusion\s*<\/h2>[\s\S]*$/gim, "");
  
  // Ensure all headings have proper HTML format
  // Fix headings that are ALL CAPS without HTML tags
  const contentLines = content.split('\n');
  const fixedLines: string[] = [];
  
  for (let i = 0; i < contentLines.length; i++) {
    const line = contentLines[i];
    const trimmed = line.trim();
    
    // Check if this looks like a heading (ALL CAPS, no HTML/markdown prefix, on its own line)
    if (trimmed && 
        trimmed === trimmed.toUpperCase() && 
        trimmed.length > 10 && 
        trimmed.length < 100 &&
        !trimmed.match(/^<h[23][^>]*>/) &&
        !trimmed.match(/^##\s+/) &&
        !trimmed.match(/^###\s+/) &&
        (i === 0 || contentLines[i-1].trim() === '') &&
        (i === contentLines.length - 1 || contentLines[i+1].trim() === '' || contentLines[i+1].trim().match(/^<p|^[A-Z]/i))) {
      // Convert to HTML heading
      fixedLines.push(`<h2>${trimmed}</h2>`);
    } else {
      fixedLines.push(line);
    }
  }
  
  content = fixedLines.join('\n');
  
  // Clean up extra whitespace
  content = content.trim();

  console.log(`[OpenAI] Generated ${content.split(" ").length} words.`);
  return content;
}
