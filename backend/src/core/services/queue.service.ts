import { Queue } from 'bullmq';
import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  throw new Error('CRITICAL: REDIS_URL is not defined in the environment variables.');
}

// 1. Establish the connection to Redis
export const redisConnection = new Redis(redisUrl, {
  maxRetriesPerRequest: null, // BullMQ requires this to prevent crashing
});

// 2. Export the Queues (The Waiting Rooms)
export const emailQueue = new Queue('email-queue', { connection: redisConnection });
export const videoQueue = new Queue('video-queue', { connection: redisConnection }); // <-- ADDED THIS

console.log('📦 Redis Message Queues initialized successfully.');