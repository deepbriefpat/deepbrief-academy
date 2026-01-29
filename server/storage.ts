// Storage helpers using AWS S3
// Uses S3 presigned URLs for secure uploads/downloads

import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Initialize S3 client
const getS3Client = () => {
  const region = process.env.AWS_REGION || "eu-west-2";
  return new S3Client({ region });
};

function getBucket(): string {
  const bucket = process.env.S3_BUCKET;
  if (!bucket) {
    throw new Error("S3_BUCKET environment variable is not set");
  }
  return bucket;
}

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

/**
 * Upload data to S3 and return a presigned URL for access
 */
export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const s3 = getS3Client();
  const bucket = getBucket();
  const key = normalizeKey(relKey);

  // Convert string to buffer if needed
  const body = typeof data === "string" ? Buffer.from(data) : data;

  // Upload to S3
  await s3.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentType: contentType,
  }));

  // Generate presigned URL for access (valid for 1 hour)
  const url = await getSignedUrl(s3, new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  }), { expiresIn: 3600 });

  return { key, url };
}

/**
 * Get a presigned URL for downloading a file from S3
 */
export async function storageGet(relKey: string): Promise<string> {
  const s3 = getS3Client();
  const bucket = getBucket();
  const key = normalizeKey(relKey);

  const url = await getSignedUrl(s3, new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  }), { expiresIn: 3600 });

  return url;
}

/**
 * Get a presigned URL for uploading a file to S3
 * Client can PUT directly to this URL
 */
export async function getUploadUrl(
  relKey: string,
  contentType = "application/octet-stream"
): Promise<{ key: string; uploadUrl: string }> {
  const s3 = getS3Client();
  const bucket = getBucket();
  const key = normalizeKey(relKey);

  const uploadUrl = await getSignedUrl(s3, new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  }), { expiresIn: 300 }); // 5 minutes for upload

  return { key, uploadUrl };
}
