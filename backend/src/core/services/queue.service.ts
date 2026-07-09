import { Queue } from 'bullmq';

import dotenv from 'dotenv';

dotenv.config();

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  throw new Error('CRITICAL: REDIS_URL is not defined in the environment variables.');
}

// -----------------------------------------------------------------------------
// 1. Establish the connection to Local Redis (Optimized for Docker)
// -----------------------------------------------------------------------------
// export const redisConnection = new Redis(redisUrl, {
//   // 🚨 BullMQ strictly requires this to be null so it can handle its own retries
//   maxRetriesPerRequest: null,
// });

// -----------------------------------------------------------------------------
// 2. Standard Error Handling
// -----------------------------------------------------------------------------
// redisConnection.on('error', (err: any) => {
//   console.error('Redis Connection Error:', err.message);
// });

// -----------------------------------------------------------------------------
// 3. Export the Video Queue
// -----------------------------------------------------------------------------
// export const videoQueue = new Queue('video-queue', {
//   connection: redisConnection,
//   defaultJobOptions: {
//     removeOnComplete: true, // Keep your local RAM clean by deleting finished jobs!
//     removeOnFail: false,    // Leave failed jobs in the queue so you can debug them
//   }
// });

// export const emailQueue = new Queue('email-queue', {
//   connection: redisConnection
// });

console.log('📦 Local Redis Video Queue initialized successfully.');