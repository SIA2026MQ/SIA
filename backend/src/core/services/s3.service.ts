import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const bucketName = process.env.R2_BUCKET_NAME;
const publicUrl = process.env.R2_PUBLIC_URL;

export const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

// -----------------------------------------------------------------------------
// [READ] Generate URL for streaming/viewing
// -----------------------------------------------------------------------------
export const generateSignedUrl = async (objectKey: string): Promise<string> => {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: objectKey,
  });
  // URL expires in 2 hours
  return getSignedUrl(s3Client, command, { expiresIn: 7200 });
};

// -----------------------------------------------------------------------------
// [WRITE] Generate VIP Pass for Direct Frontend Uploads (Phase 1 Fix)
// -----------------------------------------------------------------------------
export const generateUploadPresignedUrl = async (objectKey: string, contentType: string): Promise<string> => {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: objectKey,
    ContentType: contentType, // R2 needs to know if it's an .mp4, .png, etc.
  });

  // URL expires in 1 hour (plenty of time for a 3GB upload)
  return getSignedUrl(s3Client, command, { expiresIn: 3600 });
};

// -----------------------------------------------------------------------------
// Used by the Video Worker to upload chunks internally
// -----------------------------------------------------------------------------
const uploadFileToR2 = async (filePath: string, r2Key: string, contentType: string) => {
  const fileStream = fs.createReadStream(filePath);
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: r2Key,
    Body: fileStream,
    ContentType: contentType,
  });
  await s3Client.send(command);
};

export const uploadFolderToR2 = async (localFolderPath: string, r2DestinationFolder: string): Promise<string> => {
  const files = fs.readdirSync(localFolderPath);

  const uploadPromises = files.map((file) => {
    const filePath = path.join(localFolderPath, file);
    const r2Key = `${r2DestinationFolder}/${file}`;

    let contentType = 'application/octet-stream';
    if (file.endsWith('.m3u8')) contentType = 'application/vnd.apple.mpegurl';
    if (file.endsWith('.ts')) contentType = 'video/MP2T';

    return uploadFileToR2(filePath, r2Key, contentType);
  });

  await Promise.all(uploadPromises);
  return `${publicUrl}/${r2DestinationFolder}`;
};