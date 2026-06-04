import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('CRITICAL: DATABASE_URL is not defined in the environment variables.');
}

// 1. Initialize the Connection Pool (Optimized for High Concurrency)
const pool = new Pool({
  connectionString,
  max: 50, // Increased to allow up to 50 simultaneous database transactions
  idleTimeoutMillis: 10000, // Drop connections after 10s of inactivity to free up RAM
  connectionTimeoutMillis: 5000 // If DB is locked, fail after 5s instead of hanging the user forever
});

// 2. Wrap the pool in the Prisma Adapter
const adapter = new PrismaPg(pool);

// 3. Export the Prisma Client for the rest of the app to use
export const prisma = new PrismaClient({ adapter });

console.log('✅ Database Connection Pool initialized (Max: 50).');