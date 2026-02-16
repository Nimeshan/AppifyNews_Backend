import OpenAI from "openai";
import { uploadImageToRailbucket } from "./railbucket";
import slugify from "slugify";

let xai: OpenAI;

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

/**
 * Generate a blog hero image using Grok (xAI) image generation.
 * Downloads the image and uploads it to Railway Railbucket.
 * Returns the Railbucket URL.
 */
export async function generateImage(title: string, topic: string): Promise<string> {
  console.log(`[Grok] Generating image for: ${title}`);
  
  // Check if API key is set
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    throw new Error("XAI_API_KEY is not set. Cannot generate image with Grok.");
  }
  
  // Log API key info (first 10 chars only for security)
  console.log(`[Grok] API key present: ${apiKey.substring(0, 10)}... (length: ${apiKey.length})`);

  // Create a more relevant prompt based on the article title and topic
  // Extract key concepts from title to make the image more relevant
  const titleLower = title.toLowerCase();
  let imageDescription = "";
  
  // Generate relevant image description based on article content
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

  const prompt = `Create a professional, modern blog hero image representing: ${imageDescription}. Article topic: ${topic}. Style: clean, minimalist, futuristic, suitable for a technology blog. No text, no words, just visual elements.`;

  try {
    console.log(`[Grok] Calling API with model: grok-2-image`);
    console.log(`[Grok] Prompt: ${prompt.substring(0, 100)}...`);
    
    const response = await getXAI().images.generate({
      model: "grok-2-image",
      prompt: prompt,
      n: 1,
      // Note: Grok-2-image doesn't support size parameter - it generates at a fixed size
    });

    console.log(`[Grok] API response received:`, JSON.stringify(response, null, 2).substring(0, 500));

    const imageUrl = response.data?.[0]?.url;
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
