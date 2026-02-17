import OpenAI from "openai";
import { uploadImageToRailbucket } from "./railbucket";
import slugify from "slugify";

let xai: OpenAI;
let openai: OpenAI;

function getXAI(): OpenAI {
  if (!xai) {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      throw new Error("XAI_API_KEY environment variable is not set");
    }
    xai = new OpenAI({
      apiKey: apiKey,
      baseURL: "https://api.x.ai/v1",
    });
  }
  return xai;
}

function getOpenAI(): OpenAI {
  if (!openai) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is not set");
    }
    openai = new OpenAI({ apiKey });
  }
  return openai;
}

/**
 * Generate a custom image prompt using OpenAI based on article title, description, and topic.
 */
async function generateImagePrompt(title: string, description?: string, topic?: string): Promise<string> {
  console.log(`[ImagePrompt] Generating custom prompt for: ${title}`);
  
  const context = description 
    ? `Article Title: ${title}\nArticle Description: ${description.slice(0, 500)}${topic ? `\nTopic: ${topic}` : ''}`
    : `Article Title: ${title}${topic ? `\nTopic: ${topic}` : ''}`;

  try {
    const response = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.8,
      max_tokens: 150,
      messages: [
        {
          role: "system",
          content: `You are an expert at creating image generation prompts. Generate a detailed, visual description for a blog hero image that matches the article heading/title EXACTLY.

CRITICAL PRIORITY: The image MUST visually represent the specific article heading/title. Extract the exact visual concept from the heading.

CRITICAL RULES:
1. **MATCH THE ARTICLE HEADING** - The image must visually represent what the article heading describes. If heading is "Valve's Steam Deck OLED stock shortage", show Steam Deck hardware, stock/supply chain visuals, not generic tech.
2. **Be SPECIFIC to the article topic** - Do NOT use generic AI/brain imagery unless the article is specifically about neural networks or brain-like AI
3. **Extract the UNIQUE visual concept** from the title/heading:
   - "Valve's Steam Deck OLED stock shortage" → Steam Deck handheld device, supply chain, stock availability visuals
   - "Debenhams pilots agentic AI commerce" → retail commerce, payment integration, AI-powered shopping
   - "Anomalies in Time-Series Data" → data charts, graphs, anomaly detection visualization, time-series plots
   - "Multiple GPUs" → GPU hardware, parallel processing architecture, computer chips, server racks
   - "Banking AI" → financial technology, banking systems, fintech interfaces
4. **Avoid generic AI imagery** (brains, neural networks) unless the article is specifically about neural networks or brain-like AI
5. Focus on concrete visual elements (objects, scenes, concepts) that match the heading - not abstract ideas
6. **STYLE REQUIREMENT** - Apply this unified style to ALL images:
   Modern editorial illustration, sharp, high-contrast lighting, cinematic composition, minimal clutter, professional publication quality, distinctive and visually bold.
7. **NO HUMANS** - Do not show people, faces, or human figures. Focus on objects, environments, technology, data visualizations, interfaces, or abstract concepts.
8. **Avoid repetitive templates** - Use varied composition, perspective, and lighting depending on topic. No generic boardroom scenes or office environments with people.
9. No text, no words, no letters - pure visual elements only
10. The visual must directly relate to the article heading - if heading mentions a product, show that product; if it mentions an action, show that action
11. If it's about a specific company or person, focus on the concept/industry related to the heading, not generic company imagery or people
11. Output ONLY the image description prompt - no explanations, no labels, just the prompt text`,
        },
        {
          role: "user",
          content: `Create an image generation prompt that MUST visually match the article heading/title.

CRITICAL: The image must represent what the article heading describes. Extract the exact visual concept from the heading.

STYLE REQUIREMENT (applies to ALL images):
Modern editorial illustration, sharp, high-contrast lighting, cinematic composition, minimal clutter, professional publication quality, distinctive and visually bold.

CRITICAL: NO HUMANS - Do not show people, faces, or human figures. Focus on objects, environments, technology, data visualizations, interfaces, or abstract concepts that match the article heading.

The visual concept should match the article domain (finance, gaming, healthcare, etc.) but the STYLE is always: modern editorial illustration with sharp, high-contrast lighting and cinematic composition.

Avoid repetitive visual templates. Use varied composition, perspective, and lighting depending on topic. No generic "AI brain" imagery. No people or human figures.

Article Context:
${context}

Generate a visual prompt that:
1. Directly matches the article heading with appropriate visual concepts
2. Uses the unified style: modern editorial illustration, sharp, high-contrast lighting, cinematic composition, minimal clutter, professional publication quality, distinctive and visually bold
3. Shows NO humans, people, or faces - only objects, environments, technology, data visualizations, interfaces, or abstract concepts`,
        },
      ],
    });

    const prompt = response.choices[0]?.message?.content?.trim();
    if (!prompt) {
      throw new Error("OpenAI returned empty prompt");
    }

    // Clean up the prompt (remove quotes, labels, etc.)
    const cleanPrompt = prompt
      .replace(/^["']|["']$/g, "")
      .replace(/^(prompt|image|description):\s*/i, "")
      .trim();

    console.log(`[ImagePrompt] Generated prompt: ${cleanPrompt.substring(0, 100)}...`);
    return cleanPrompt;
  } catch (error: any) {
    console.warn(`[ImagePrompt] Failed to generate custom prompt with OpenAI: ${error.message}. Using fallback.`);
    // Fallback to simple keyword-based prompt
    const titleLower = title.toLowerCase();
    let imageDescription = "";
    
    if (titleLower.includes("ai") || titleLower.includes("artificial intelligence") || titleLower.includes("agent")) {
      imageDescription = "futuristic AI technology, neural networks, digital brain, artificial intelligence visualization";
    } else if (titleLower.includes("app") || titleLower.includes("development") || titleLower.includes("software")) {
      imageDescription = "modern software development, code visualization, app interface, digital technology";
    } else if (titleLower.includes("startup") || titleLower.includes("business") || titleLower.includes("company")) {
      imageDescription = "modern business workspace, startup environment, innovation, growth";
    } else if (titleLower.includes("web3") || titleLower.includes("blockchain") || titleLower.includes("crypto")) {
      imageDescription = "blockchain technology, decentralized network, digital currency, web3 infrastructure";
    } else if (titleLower.includes("design") || titleLower.includes("ux") || titleLower.includes("ui")) {
      imageDescription = "modern design interface, user experience, creative design elements, digital aesthetics";
    } else if (titleLower.includes("automation") || titleLower.includes("workflow")) {
      imageDescription = "automation technology, workflow visualization, process optimization, digital efficiency";
    } else if (titleLower.includes("work") || titleLower.includes("workplace") || titleLower.includes("culture")) {
      imageDescription = "modern workplace, collaboration, professional environment, team culture";
    } else {
      imageDescription = "modern technology, innovation, digital transformation";
    }
    
    return `Create a blog hero image representing: ${imageDescription}. Style: modern editorial illustration, sharp, high-contrast lighting, cinematic composition, minimal clutter, professional publication quality, distinctive and visually bold. No humans, no people, no faces. No text, no words, just visual elements.`;
  }
}

/**
 * Generate a blog hero image using Grok (xAI) image generation.
 * Downloads the image and uploads it to Railway Railbucket.
 * Returns the Railbucket URL.
 */
export async function generateImage(title: string, topic: string, description?: string): Promise<string> {
  console.log(`[Grok] Generating image for: ${title}`);
  
  // Check if API key is set
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    throw new Error("XAI_API_KEY is not set. Cannot generate image with Grok.");
  }
  
  // Log API key info (first 10 chars only for security)
  console.log(`[Grok] API key present: ${apiKey.substring(0, 10)}... (length: ${apiKey.length})`);

  // Generate custom prompt using OpenAI based on article content
  const prompt = await generateImagePrompt(title, description, topic);

  try {
    console.log(`[Grok] Calling API with model: grok-2-image`);
    console.log(`[Grok] Prompt: ${prompt.substring(0, 100)}...`);
    console.log(`[Grok] Base URL: https://api.x.ai/v1`);
    console.log(`[Grok] Endpoint: /images/generations`);
    
    const response = await getXAI().images.generate({
      model: "grok-2-image",
      prompt: prompt,
      n: 1,
      // Note: Grok-2-image doesn't support size parameter - it generates at a fixed size
    });

    console.log(`[Grok] API response received:`, JSON.stringify(response, null, 2));

    // Handle response structure - based on n8n example, response is: { data: [{ url: "...", revised_prompt: "" }] }
    // The OpenAI SDK returns: { data: [{ url: string, revised_prompt?: string }] }
    let imageUrl: string | undefined;
    
    const responseAny = response as any;
    if (responseAny?.data) {
      const data = responseAny.data;
      if (Array.isArray(data) && data.length > 0 && data[0]?.url) {
        imageUrl = data[0].url;
      } else if (data?.url) {
        imageUrl = data.url;
      }
    } else if (Array.isArray(responseAny) && responseAny[0]?.data?.[0]?.url) {
      // Handle array response structure: [{ data: [{ url: "...", revised_prompt: "" }] }]
      imageUrl = responseAny[0].data[0].url;
    }
    if (!imageUrl) {
      console.error(`[Grok] No image URL in response. Full response:`, JSON.stringify(response, null, 2));
      throw new Error("Grok returned no image URL in response");
    }
    
    console.log(`[Grok] Image generated successfully. URL: ${imageUrl.substring(0, 100)}...`);

    // Upload to Railbucket
    try {
      const filename = `${slugify(title, { lower: true, strict: true })}-${Date.now()}.png`;
      const railbucketUrl = await uploadImageToRailbucket(imageUrl, filename);
      console.log("[Grok] Image uploaded to Railbucket.");
      return railbucketUrl;
    } catch (error) {
      console.error("[Grok] Failed to upload to Railbucket, using original URL:", error);
      // Fallback to original URL if Railbucket upload fails
      return imageUrl;
    }
  } catch (error: any) {
    // Better error logging for debugging
    console.error(`[Grok] Image generation error:`, error);
    console.error(`[Grok] Error message:`, error.message);
    console.error(`[Grok] Error type:`, error.constructor.name);
    
    if (error.status) {
      console.error(`[Grok] HTTP Status: ${error.status}`);
    }
    if (error.statusCode) {
      console.error(`[Grok] HTTP Status Code: ${error.statusCode}`);
    }
    if (error.response) {
      console.error(`[Grok] Response:`, JSON.stringify(error.response, null, 2));
    }
    if (error.body) {
      console.error(`[Grok] Error body:`, JSON.stringify(error.body, null, 2));
    }
    if (error.error) {
      console.error(`[Grok] Error object:`, JSON.stringify(error.error, null, 2));
    }
    
    // Check for common issues
    const errorStr = JSON.stringify(error).toLowerCase();
    if (errorStr.includes("401") || errorStr.includes("unauthorized") || error.message?.includes("401")) {
      throw new Error("Grok API key is invalid or missing. Check XAI_API_KEY environment variable in Railway.");
    }
    if (errorStr.includes("402") || errorStr.includes("payment") || error.message?.includes("402")) {
      throw new Error("Grok API requires payment/subscription. Check your xAI account billing.");
    }
    if (errorStr.includes("404") || error.message?.includes("404")) {
      throw new Error("Grok API endpoint not found. Model 'grok-2-image' may not be available or API endpoint changed.");
    }
    if (errorStr.includes("429") || error.message?.includes("429")) {
      throw new Error("Grok API rate limit exceeded. Please wait and try again.");
    }
    
    throw new Error(`Grok image generation failed: ${error.message || 'Unknown error'}`);
  }
}
