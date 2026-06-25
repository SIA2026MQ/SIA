import { Worker, Job } from 'bullmq';
import { redisConnection } from '../services/queue.service'; // Make sure this path is correct!
import { prisma } from '../services/db.service';
import ffmpeg from 'fluent-ffmpeg';

import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import ffprobeInstaller from '@ffprobe-installer/ffprobe';
ffmpeg.setFfmpegPath(ffmpegInstaller.path);
ffmpeg.setFfprobePath(ffprobeInstaller.path);

import fs from 'fs';
import path from 'path';
import { uploadFolderToR2, downloadFileFromR2 } from '../services/s3.service';

console.log('👷‍♂️ Video Processing Worker Initialized...');

export const videoWorker = new Worker(
  'video-queue', // 🚨 Make sure this EXACT string matches the queue name in your controller!
  async (job: Job) => {
    console.log(`\n[VIDEO WORKER] 🎬 Starting job ${job.id}: Processing ${job.data.title || 'Unknown Video'}`);

    const { videoId, r2ObjectKey, courseId } = job.data;

    // 🚨 FIXED: Bullet-proof pathing. This safely puts the temp folder in your backend root folder.
    const tempDir = path.join(process.cwd(), 'temp');
    const rawFilePath = path.join(tempDir, `raw_${videoId}.mp4`);
    const outputDir = path.join(tempDir, `hls_${videoId}`);

    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    try {
      console.log(`[VIDEO WORKER] ⬇️ Downloading raw file from Cloudflare R2...`);
      await downloadFileFromR2(r2ObjectKey, rawFilePath);

      const outputPath = path.join(outputDir, 'master.m3u8');

      console.log(`[VIDEO WORKER] 🔪 Transcoding via FFmpeg...`);
      await new Promise((resolve, reject) => {
        ffmpeg(rawFilePath)
          .outputOptions([
            '-c:v libx264',          // Force H.264 video codec (100% Browser Support)
            '-c:a aac',              // Force AAC audio codec (100% Browser Support)
            '-profile:v main',       // Standard video profile for web playback
            '-preset fast',          // Fast encoding speed
            '-start_number 0',
            '-hls_time 10',          // 🚨 10-second segments are industry standard for stable web streaming
            '-hls_list_size 0',      // Keep entire VOD playlist
            '-f hls'
          ])
          .output(outputPath)
          .on('end', () => resolve(true))
          .on('error', (err) => {
            console.error('[FFMPEG ERROR]:', err);
            reject(err);
          })
          .run();
      });

      console.log(`[VIDEO WORKER] ☁️ Uploading HLS segments to Cloudflare R2...`);
      await uploadFolderToR2(outputDir, `courses/${courseId}/${videoId}`);

      console.log(`[VIDEO WORKER] ✅ Updating Database...`);
      await prisma.courseVideo.update({
        where: { id: videoId },
        data: { videoUrlR2: `courses/${courseId}/${videoId}/master.m3u8` }
      });

      console.log(`[VIDEO WORKER] 🎉 Success! Video ${videoId} is fully live.\n`);

    } catch (error) {
      console.error(`[VIDEO WORKER] ❌ Failure during pipeline:`, error);
      throw error;
    } finally {
      // ALWAYS clean up the server's hard drive!
      if (fs.existsSync(rawFilePath)) fs.unlinkSync(rawFilePath);
      if (fs.existsSync(outputDir)) fs.rmSync(outputDir, { recursive: true, force: true });
    }
  },
  { connection: redisConnection }
);

// 🚨 ADDED: If the worker fails, it will now explicitly tell you WHY instead of failing silently.
videoWorker.on('failed', (job, err) => {
  console.error(`🚨 Job ${job?.id} failed with error:`, err.message);
});