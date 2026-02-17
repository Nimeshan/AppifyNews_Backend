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
export async function generateExcerpt(blogContent: string): Promise<string> {
  console.log("[OpenAI] Generating excerpt/summary...");

  const response = await getOpenAI().chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 1,
    max_tokens: 200,
    messages: [
      {
        role: "system",
        content: `Write a short summary of the blog post that will be used as the article excerpt.

Follow these rules:

1. Keep the summary between 150-250 characters (2-3 sentences).
2. Summarize what the article is actually about - focus on the main topic and key points.
3. Write in a neutral, informative tone — avoid fluff, clickbait, or sales language.
4. Do not use the em dash (—) or symbols like #, %, $, *, etc.
5. Avoid phrases like "discover", "explore", "case study of", or "get in touch".
6. Only mention specific companies or industries if they are central to the article's focus.
7. Write as if explaining the article to a busy reader — make it clear and concise.
8. Output only the plain text of the summary — no extra labels, markdown, or quotes.
9. Focus on the actual content of the article, not generic descriptions.`,
      },
      {
        role: "user",
        content: `Here is the blog post content to summarize:\n\n${blogContent.slice(0, 4000)}`, // First 4000 chars for context
      },
    ],
  });

  const excerpt = response.choices[0]?.message?.content?.trim();
  if (!excerpt) {
    throw new Error("OpenAI returned empty excerpt");
  }

  // Remove quotes if wrapped
  const cleanExcerpt = excerpt.replace(/^["']|["']$/g, "").trim();
  
  // Ensure it's between 150-250 characters (but allow up to 500 for database)
  let finalExcerpt = cleanExcerpt;
  if (finalExcerpt.length > 500) {
    // If too long, truncate at sentence boundary
    const truncated = finalExcerpt.slice(0, 497);
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

  console.log(`[OpenAI] Generated excerpt (${finalExcerpt.length} chars)`);
  return finalExcerpt;
}
