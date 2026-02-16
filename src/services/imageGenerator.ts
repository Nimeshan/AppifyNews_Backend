import OpenAI from "openai";
import { uploadImageToRailbucket } from "./railbucket";
import slugify from "slugify";

let xai: OpenAI;

function getXAI(): OpenAI {
  if (!xai) {
    xai = new OpenAI({
      apiKey: process.env.XAI_API_KEY,
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

  const response = await getXAI().images.generate({
    model: "grok-2-image",
    prompt: `A modern, clean, professional blog hero image for a tech article titled "${title}". Topic: ${topic}. Style: minimalist, futuristic, suitable for a technology company blog. No text in the image.`,
    n: 1,
    // Note: Grok-2-image doesn't support size parameter - it generates at a fixed size
  });

  const imageUrl = response.data?.[0]?.url;
  if (!imageUrl) {
    throw new Error("Grok returned no image");
  }

  console.log("[Grok] Image generated successfully.");

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
}
