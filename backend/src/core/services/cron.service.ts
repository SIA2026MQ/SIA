// Email queue and automated daily emails have been removed to preserve architecture limits.

export const startCronJobs = async () => {
  try {
    console.log('⏰ Cron Jobs module initialized (Email scheduling disabled for efficiency).');

    // If you need lightweight scheduled tasks in the future (like cleaning up old DB records), 
    // you can use the 'node-cron' package here instead of heavy Redis queues.

  } catch (error) {
    console.error('Failed to schedule cron jobs:', error);
  }
};