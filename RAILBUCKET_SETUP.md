# Railbucket Image Storage Setup

This project uses Railway Railbucket (S3-compatible storage) to store blog article images.

## Environment Variables

Add the following environment variables to your Railway backend service:

```
RAILBUCKET_ENDPOINT=https://t3.storageapi.dev
RAILBUCKET_REGION=auto
RAILBUCKET_BUCKET_NAME=appify-railbucket-oa2fx2s
RAILBUCKET_ACCESS_KEY_ID=your-access-key-id
RAILBUCKET_SECRET_ACCESS_KEY=your-secret-access-key
```

## How to Get Credentials

1. Go to your Railway project dashboard
2. Open the Railbucket service
3. Go to the "Credentials" tab
4. Copy the following values:
   - **Endpoint URL** → `RAILBUCKET_ENDPOINT`
   - **Region** → `RAILBUCKET_REGION`
   - **Bucket Name** → `RAILBUCKET_BUCKET_NAME`
   - **Access Key ID** → `RAILBUCKET_ACCESS_KEY_ID`
   - **Secret Access Key** → `RAILBUCKET_SECRET_ACCESS_KEY`

## How It Works

1. **Generated Images**: When Grok-2-Image generates a new image, it's automatically uploaded to Railbucket
2. **RSS Images**: Images from RSS feeds are also downloaded and uploaded to Railbucket
3. **Storage**: All images are stored in Railbucket with unique filenames based on article title and timestamp
4. **S3-Compatible API**: Uses AWS S3 SDK with Railway's S3-compatible endpoint

## Setup Steps

1. Create a Railbucket service in your Railway project
2. Get the credentials from Railway dashboard (Credentials tab)
3. Add all environment variables to your backend service
4. Redeploy the backend service

## File Naming

Images are named using the format:
- Generated images: `{article-slug}-{timestamp}.png`
- RSS images: `{article-slug}-rss-{timestamp}.png`

## Public URLs

Images are uploaded with `public-read` ACL, so they're accessible via:
```
https://t3.storageapi.dev/{bucket-name}/{filename}
```

## Fallback Behavior

If Railbucket upload fails, the system will:
- For generated images: Use the original Grok image URL
- For RSS images: Use the original RSS image URL

This ensures articles always have images, even if Railbucket is temporarily unavailable.
