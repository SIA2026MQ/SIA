import { Worker, Job } from 'bullmq';
import { redisConnection } from '../services/queue.service';
import { prisma } from '../services/db.service';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';
// FIX: Changed from r2.service to s3.service
import { uploadFolderToR2 } from '../services/s3.service';

export const videoWorker = new Worker(
  'video-queue',
  async (job: Job) => {
    console.log(`[VIDEO WORKER] Starting job ${job.id}: Transcoding ${job.data.title}`);

    const { videoId, rawFilePath } = job.data;

    // Create a temporary folder to hold the hundreds of .ts chunks
    const outputDir = path.join(__dirname, `../../../temp/hls_${videoId}`);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, 'index.m3u8');

    // Return a Promise so BullMQ knows to wait for FFmpeg to finish
    return new Promise((resolve, reject) => {
      ffmpeg(rawFilePath)
        // Magic FFmpeg settings for HLS Streaming
        .outputOptions([
          '-codec: copy',          // Don't re-encode the video (saves massive CPU/time)
          '-start_number 0',       // Start naming chunks at 0
          '-hls_time 10',          // Make each chunk 10 seconds long
          '-hls_list_size 0',      // Keep all chunks in the playlist (don't delete old ones)
          '-f hls'                 // Format is HLS
        ])
        .output(outputPath)
        .on('end', async () => {
          console.log(`[VIDEO WORKER] Transcoding finished for ${videoId}. Uploading to R2...`);

          try {
            // 1. Upload the whole folder of chunks to Cloudflare R2
            const r2FolderUrl = await uploadFolderToR2(outputDir, `courses/${videoId}`);

            // 2. Update PostgreSQL so the frontend knows the video is ready to play!
            await prisma.courseVideo.update({
              where: { id: videoId },
              data: { videoUrlR2: `${r2FolderUrl}/index.m3u8` }
            });

            // 3. Clean up the temporary files so your hard drive doesn't fill up
            fs.rmSync(outputDir, { recursive: true, force: true });
            fs.unlinkSync(rawFilePath);

            console.log(`[VIDEO WORKER] Success! Video ${videoId} is live on Cloudflare R2.`);
            resolve(true);
          } catch (error) {
            reject(error);
          }
        })
        .on('error', (err) => {
          console.error(`[VIDEO WORKER] FFmpeg Error:`, err);
          reject(err);
        })
        .run(); // Start the process
    });
  },
  { connection: redisConnection }
);