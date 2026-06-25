import { 
  S3Client, GetObjectCommand, PutObjectCommand, 
  CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand 
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { pipeline } from 'stream/promises';

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

export const generateSignedUrl = async (objectKey: string): Promise<string> => {
  const command = new GetObjectCommand({ Bucket: bucketName, Key: objectKey });
  return getSignedUrl(s3Client, command, { expiresIn: 7200 });
};

export const generateUploadPresignedUrl = async (objectKey: string, contentType: string): Promise<string> => {
  const command = new PutObjectCommand({ Bucket: bucketName, Key: objectKey, ContentType: contentType });
  return getSignedUrl(s3Client, command, { expiresIn: 3600 });
};

// -----------------------------------------------------------------------------
// 🚨 NEW: MULTIPART UPLOAD SERVICES FOR HIGH-SPEED VIDEO
// -----------------------------------------------------------------------------
export const startMultipartUpload = async (objectKey: string, contentType: string): Promise<string> => {
  const command = new CreateMultipartUploadCommand({ Bucket: bucketName, Key: objectKey, ContentType: contentType });
  const res = await s3Client.send(command);
  if (!res.UploadId) throw new Error("Failed to get UploadId");
  return res.UploadId;
};

export const generatePartPresignedUrl = async (objectKey: string, uploadId: string, partNumber: number): Promise<string> => {
  const command = new UploadPartCommand({ Bucket: bucketName, Key: objectKey, UploadId: uploadId, PartNumber: partNumber });
  return getSignedUrl(s3Client, command, { expiresIn: 3600 });
};

export const completeMultipartUpload = async (objectKey: string, uploadId: string, parts: { ETag: string, PartNumber: number }[]): Promise<void> => {
  const command = new CompleteMultipartUploadCommand({ Bucket: bucketName, Key: objectKey, UploadId: uploadId, MultipartUpload: { Parts: parts } });
  await s3Client.send(command);
};

// -----------------------------------------------------------------------------
// Internal Worker Services
// -----------------------------------------------------------------------------
const uploadFileToR2 = async (filePath: string, r2Key: string, contentType: string) => {
  const fileStream = fs.createReadStream(filePath);
  const command = new PutObjectCommand({ Bucket: bucketName, Key: r2Key, Body: fileStream, ContentType: contentType });
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

export const downloadFileFromR2 = async (objectKey: string, downloadPath: string): Promise<void> => {
  const command = new GetObjectCommand({ Bucket: bucketName, Key: objectKey });
  const response = await s3Client.send(command);
  if (!response.Body) throw new Error("File body not found in R2");
  await pipeline(response.Body as any, fs.createWriteStream(downloadPath));
};