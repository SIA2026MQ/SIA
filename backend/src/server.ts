import app from './app';
import './core/services/db.service';
import './core/services/queue.service';
//import { emailWorker } from './core/workers/email.worker';
// import { videoWorker } from './core/workers/video.worker'; // <-- CRITICAL: Wake up the video worker!
import { startCronJobs } from './core/services/cron.service';

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, async () => {
  console.log(`🚀 Server running in modular monolith mode on http://localhost:${PORT}`);
  await startCronJobs();
});

// -----------------------------------------------------------------------------
// GRACEFUL SHUTDOWN: Protects background jobs during server restarts/crashes
// -----------------------------------------------------------------------------
const gracefulShutdown = async (signal: string) => {
  console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);

  // 1. Stop accepting new API requests
  server.close(() => {
    console.log('HTTP server closed.');
  });

  // 2. Tell BullMQ workers to finish their current job, but don't take new ones
  
};

// Catch termination signals from Docker / Hosting Providers (e.g., Render, AWS, Heroku)
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));