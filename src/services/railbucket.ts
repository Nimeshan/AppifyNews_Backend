import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import https from "https";
import http from "http";
import { URL } from "url";

let s3Client: S3Client | null = null;

/**
 * Get or create S3 client for Railway Railbucket (S3-compatible)
 */
function getS3Client(): S3Client {
  if (!s3Client) {
    const endpoint = process.env.RAILBUCKET_ENDPOINT || "https://t3.storageapi.dev";
    const region = process.env.RAILBUCKET_REGION || "auto";
    const accessKeyId = process.env.RAILBUCKET_ACCESS_KEY_ID;
    const secretAccessKey = process.env.RAILBUCKET_SECRET_ACCESS_KEY;

    if (!accessKeyId || !secretAccessKey) {
      throw new Error(
        "RAILBUCKET_ACCESS_KEY_ID and RAILBUCKET_SECRET_ACCESS_KEY must be set"
      );
    }

    s3Client = new S3Client({
      endpoint,
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: false, // Use virtual-hosted-style URLs
    });
  }

  return s3Client;
}

/**
 * Upload an image to Railway Railbucket.
 * Downloads the image from a URL and uploads it to Railbucket using S3-compatible API.
 * Returns a signed URL if the bucket is not public, otherwise returns a public URL.
 */
export async function uploadImageToRailbucket(
  imageUrl: string,
  filename: string
): Promise<string> {
  console.log(`[Railbucket] Uploading image: ${filename}`);

  const bucketName = process.env.RAILBUCKET_BUCKET_NAME;
  if (!bucketName) {
    throw new Error("RAILBUCKET_BUCKET_NAME environment variable is not set");
  }

  // Download the image
  const imageBuffer = await downloadImage(imageUrl);

  // Upload to Railbucket using S3 API
  const s3Client = getS3Client();
  const putCommand = new PutObjectCommand({
    Bucket: bucketName,
    Key: filename,
    Body: imageBuffer,
    ContentType: "image/png", // Default to PNG
  });

  try {
    await s3Client.send(putCommand);
    
    // Try to construct public URL first
    const endpoint = process.env.RAILBUCKET_ENDPOINT || "https://t3.storageapi.dev";
    const publicUrl = `${endpoint}/${bucketName}/${filename}`;
    
    // Test if public URL works, if not, generate signed URL
    try {
      const testResponse = await fetch(publicUrl, { method: "HEAD" });
      if (testResponse.ok) {
        console.log(`[Railbucket] Image uploaded successfully (public): ${publicUrl}`);
        return publicUrl;
      }
    } catch (testError) {
      // Public URL doesn't work, generate signed URL
      console.log(`[Railbucket] Public URL not accessible, generating signed URL...`);
    }
    
    // Generate signed URL (valid for 1 year)
    const getCommand = new GetObjectCommand({
      Bucket: bucketName,
      Key: filename,
    });
    const signedUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 31536000 }); // 1 year
    
    console.log(`[Railbucket] Image uploaded successfully (signed URL): ${signedUrl}`);
    return signedUrl;
  } catch (error: any) {
    console.error("[Railbucket] Upload failed:", error);
    throw new Error(`Railbucket upload failed: ${error.message}`);
  }
}

/**
 * Download an image from a URL and return as Buffer
 */
async function downloadImage(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const client = parsedUrl.protocol === "https:" ? https : http;

    client
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download image: ${response.statusCode}`));
          return;
        }

        const chunks: Buffer[] = [];
        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", () => resolve(Buffer.concat(chunks)));
        response.on("error", reject);
      })
      .on("error", reject);
  });
}
