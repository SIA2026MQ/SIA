import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('CRITICAL: DATABASE_URL is not defined in the environment variables.');
}

// 1. Initialize the Connection Pool
const pool = new Pool({
  connectionString,
  max: 20,
  idleTimeoutMillis: 30000
});

// 2. Wrap the pool in the Prisma Adapter
const adapter = new PrismaPg(pool);

// 3. Export the Prisma Client for the rest of the app to use
export const prisma = new PrismaClient({ adapter });

console.log('✅ Database Connection Pool initialized.');