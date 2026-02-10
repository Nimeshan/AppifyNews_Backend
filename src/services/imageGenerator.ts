import OpenAI from "openai";

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
 * Returns the image URL.
 */
export async function generateImage(title: string, topic: string): Promise<string> {
  console.log(`[Grok] Generating image for: ${title}`);

  const response = await getXAI().images.generate({
    model: "grok-2-image",
    prompt: `A modern, clean, professional blog hero image for a tech article titled "${title}". Topic: ${topic}. Style: minimalist, futuristic, suitable for a technology company blog. No text in the image.`,
    n: 1,
    size: "1024x768",
  });

  const imageUrl = response.data[0]?.url;
  if (!imageUrl) {
    throw new Error("Grok returned no image");
  }

  console.log("[Grok] Image generated successfully.");
  return imageUrl;
}
