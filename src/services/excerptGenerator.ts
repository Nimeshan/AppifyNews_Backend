import OpenAI from "openai";

let openai: OpenAI;

function getOpenAI(): OpenAI {
  if (!openai) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
}

/**
 * Generate excerpt/summary using OpenAI.
 * Creates a tailored summary of the article content.
 */
export async function generateExcerpt(blogContent: string, articleTitle?: string): Promise<string> {
  console.log("[OpenAI] Generating excerpt/summary...");

  const response = await getOpenAI().chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 1,
    max_tokens: 150, // Reduced to enforce shorter output
    messages: [
      {
        role: "system",
        content: `Write a short summary of the blog post that will be used as the article excerpt.

🚨 CRITICAL REQUIREMENTS:

1. **STRICT LENGTH LIMIT**: The summary MUST be between 150-250 characters (2-3 sentences maximum). This is non-negotiable.

2. **NO META LANGUAGE - ABSOLUTELY FORBIDDEN**:
   - DO NOT use phrases like "this article examines", "the article outlines", "it discusses", "this piece explores"
   - DO NOT describe what the article does - describe what the TOPIC is about
   - Write directly about the subject matter, not about the article itself
   - Example WRONG: "The article examines NatWest's AI implementation"
   - Example RIGHT: "NatWest is implementing AI across multiple banking functions"

3. **TOPIC-SPECIFIC CONTENT**:
   - The summary MUST be about the specific topic in the article title${articleTitle ? `: "${articleTitle}"` : ''}
   - If the title mentions a specific company (e.g., "NatWest"), mention that company
   - If the title mentions a specific industry (e.g., "banking"), mention that industry
   - If the title mentions specific functions/use cases, include those
   - DO NOT write generic descriptions - be specific to the article's actual topic

4. **DIRECT AND FACTUAL**:
   - State what the topic is about directly
   - Focus on the main point and key information
   - Be clear and concise
   - Write as if explaining the topic to a busy reader

5. **TONE AND STYLE**:
   - Neutral, informative tone
   - Avoid fluff, clickbait, or sales language
   - Do not use em dash (—) or symbols like #, %, $, *, etc.
   - Avoid phrases like "discover", "explore", "case study of", or "get in touch"
   - Output only plain text - no labels, markdown, or quotes

6. **CONTENT FOCUS**:
   - Focus on the actual topic/content, not generic descriptions
   - If the article is about "Banking AI at NatWest", write about NatWest's banking AI implementation
   - If the article is about a data breach, write about that specific breach
   - Match the specificity of the article title`,
      },
      {
        role: "user",
        content: `Article Title: ${articleTitle || 'Not provided'}

Here is the blog post content to summarize:

${blogContent.slice(0, 4000)}

Write a 150-250 character summary about the specific topic in the article title. Be direct - state what the topic is about, not what the article does.`,
      },
    ],
  });

  const excerpt = response.choices[0]?.message?.content?.trim();
  if (!excerpt) {
    throw new Error("OpenAI returned empty excerpt");
  }

  // Remove quotes if wrapped
  const cleanExcerpt = excerpt.replace(/^["']|["']$/g, "").trim();
  
  // Remove meta language patterns
  let finalExcerpt = cleanExcerpt
    .replace(/^(this article|the article|it|this piece|this post|this blog)(\s+(examines|outlines|discusses|explores|covers|analyzes|describes|presents|reviews|highlights|focuses on|looks at|delves into|investigates|addresses|explains|details|summarizes|provides|offers|shows|reveals|demonstrates|illustrates|presents|introduces|examines|explores|discusses|analyzes|reviews|highlights|focuses|looks|delves|investigates|addresses|explains|details|summarizes|provides|offers|shows|reveals|demonstrates|illustrates|presents|introduces))(\s+)/i, "")
    .replace(/^(this article|the article|it|this piece|this post|this blog)(\s+(examines|outlines|discusses|explores|etc))(\s+)/i, "")
    .trim();
  
  // Ensure it's between 150-250 characters (strict limit)
  if (finalExcerpt.length > 250) {
    // Truncate at sentence boundary
    const truncated = finalExcerpt.slice(0, 247);
    const lastPeriod = truncated.lastIndexOf(".");
    const lastSpace = truncated.lastIndexOf(" ");
    
    if (lastPeriod > 100) {
      finalExcerpt = finalExcerpt.slice(0, lastPeriod + 1);
    } else if (lastSpace > 100) {
      finalExcerpt = finalExcerpt.slice(0, lastSpace) + "...";
    } else {
      finalExcerpt = truncated + "...";
    }
  }
  
  // Ensure minimum length (at least 150 chars if possible)
  if (finalExcerpt.length < 150 && cleanExcerpt.length >= 150) {
    // Try to get a bit more from the original if we removed too much
    const originalTruncated = cleanExcerpt.slice(0, 250);
    const lastPeriod = originalTruncated.lastIndexOf(".");
    if (lastPeriod > 100) {
      finalExcerpt = cleanExcerpt.slice(0, lastPeriod + 1);
    } else {
      finalExcerpt = originalTruncated;
    }
  }

  console.log(`[OpenAI] Generated excerpt (${finalExcerpt.length} chars)`);
  return finalExcerpt;
}
