import { Worker, Job } from 'bullmq';
import { redisConnection } from '../services/queue.service';
import { sendEmail } from '../services/mail.service';
import { prisma } from '../services/db.service';

export const emailWorker = new Worker(
  'email-queue',
  async (job: Job) => {
    console.log(`[WORKER] Processing Job ID: ${job.id} | Type: ${job.name}`);

    // -------------------------------------------------------------------------
    // 1. MASS NOTIFICATION (Triggered by Admin)
    // -------------------------------------------------------------------------
    if (job.name === 'mass-notification') {
      const { type, courseId, title } = job.data;

      if (type === 'NEW_COURSE') {
        const users = await prisma.user.findMany({ select: { email: true, name: true } });

        for (const user of users) {
          const subject = `New Course Available: ${title}`;
          const html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Hello ${user.name},</h2>
              <p>We have just published a new course on <strong>Shifting Into Awareness</strong>!</p>
              <h3 style="color: #4A90E2;">${title}</h3>
              <p>Log in to your account today to start exploring this new content.</p>
            </div>
          `;
          await sendEmail(user.email, subject, html);
        }
        console.log(`[WORKER] Successfully sent mass emails for course: ${title}`);
      }
    }

    // -------------------------------------------------------------------------
    // 2. SUBSCRIPTION EXPIRY NOTIFICATION (Triggered by Time/Cron)
    // -------------------------------------------------------------------------
    if (job.name === 'expiry-reminder') {
      console.log('[WORKER] Running daily subscription expiry check...');

      // Calculate the date exactly 3 days from right now
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

      // Find all active subscriptions expiring in exactly 3 days
      const expiringSubscriptions = await prisma.userSubscription.findMany({
        where: {
          isActive: true,
          // We look for dates between the start of that day and the end of that day
          expiryDate: {
            gte: new Date(threeDaysFromNow.setHours(0, 0, 0, 0)),
            lte: new Date(threeDaysFromNow.setHours(23, 59, 59, 999)),
          },
        },
        include: { user: true, plan: true }, // Pull the user's email and plan details
      });

      for (const sub of expiringSubscriptions) {
        const subject = `Action Required: Your Daily Sessions Plan Expires in 3 Days`;
        const html = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Hi ${sub.user.name},</h2>
            <p>Your <strong>${sub.plan.name}</strong> subscription for our Daily Live Sessions is expiring in exactly 3 days.</p>
            <p>To ensure you don't lose access to the zoom links, please log in and renew your plan.</p>
            <br/>
            <p>Warmly,</p>
            <p><strong>The Shifting Into Awareness Team</strong></p>
          </div>
        `;
        await sendEmail(sub.user.email, subject, html);
      }

      console.log(`[WORKER] Sent expiry reminders to ${expiringSubscriptions.length} users.`);
    }

    // -------------------------------------------------------------------------
    // 3. WEBINAR PURCHASE CONFIRMATION (Triggered by Payment Success)
    // -------------------------------------------------------------------------
    if (job.name === 'webinar-purchase') {
      const { userId, webinarId } = job.data;

      const user = await prisma.user.findUnique({ where: { id: userId } });
      const webinar = await prisma.webinar.findUnique({ where: { id: webinarId } });

      if (user && webinar) {
        const subject = `Your Zoom Link: ${webinar.title}`;
        const html = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Hi ${user.name},</h2>
            <p>Thank you for registering for <strong>${webinar.title}</strong>!</p>
            <p><strong>Date & Time:</strong> ${new Date(webinar.scheduledFor).toLocaleString()}</p>
            <p>Here is your exclusive, private access link for the live session:</p>
            <div style="padding: 15px; background: #f4f4f4; border-radius: 5px; margin: 20px 0;">
              <a href="${webinar.zoomLink}" style="color: #4A90E2; font-weight: bold;">Click Here to Join the Webinar</a>
            </div>
            <p>See you there!</p>
            <p><strong>The Shifting Into Awareness Team</strong></p>
          </div>
        `;
        await sendEmail(user.email, subject, html);
        console.log(`[WORKER] Sent Webinar Zoom Link to ${user.email}`);
      }
    }
  },
  { connection: redisConnection }
);

emailWorker.on('completed', (job) => {
  console.log(`[WORKER] Job ${job.id} has completed!`);
});

emailWorker.on('failed', (job, err) => {
  console.error(`[WORKER] Job ${job?.id} has failed with error: ${err.message}`);
});