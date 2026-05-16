import { emailQueue } from './queue.service';

// We wrap this in a function so we can call it when the server starts
export const startCronJobs = async () => {
  try {
    // Schedule the daily expiry check
    await emailQueue.add(
      'expiry-reminder',
      { task: 'DAILY_CHECK' },
      {
        // This is standard Cron Syntax. '0 8 * * *' means:
        // Run at exactly 08:00 AM every single day.
        repeat: { pattern: '0 8 * * *' },

        // Setting a strict jobId prevents BullMQ from duplicating the cron job 
        // if your server restarts multiple times.
        jobId: 'daily-subscription-cron',
      }
    );

    console.log('⏰ Automated Cron Jobs scheduled successfully.');
  } catch (error) {
    console.error('Failed to schedule cron jobs:', error);
  }
};