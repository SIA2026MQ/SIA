import nodemailer from 'nodemailer';

// Assuming you have a transporter set up like this:
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER, // e.g., your admin email
    pass: process.env.SMTP_PASS, // e.g., your app password
  },
  tls: {
    rejectUnauthorized: false 
  }
});

// 🚨 UPDATED: The function to send the group discount code SEQUENTIALLY
export const sendGroupCouponEmail = async (emails: string[], code: string, discountPercent: number, groupLeaderName: string) => {
  let successCount = 0;
  
  console.log(`Attempting to send ${emails.length} group emails sequentially...`);

  // 🚨 FIX: We use a for...of loop instead of Promise.all.
  // This sends them one by one, preventing Gmail from closing the socket!
  for (const recipientEmail of emails) {
    try {
      const mailOptions = {
        from: `"Shifting Into Awareness" <${process.env.SMTP_USER}>`,
        to: recipientEmail, 
        replyTo: process.env.SMTP_USER, // Adds legitimacy to bypass spam
        subject: `🎉 Your ${discountPercent}% Group Discount Code is Here!`,
        
        // The Plain Text Fallback (Required to bypass spam filters)
        text: `Welcome to the Satsang!\n\nHello! ${groupLeaderName} recently applied for a group discount for your circle. We are thrilled to welcome you all.\n\nYour Exclusive ${discountPercent}% OFF Code: ${code}\n\nSecurity Notice: To prevent fraud, this code is strictly locked to your email address. When you check out, please make sure you sign up using this exact email address: ${recipientEmail}.\n\nJoin the Satsang Now: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/satsungs`,
        
        // The Beautiful HTML Design
        html: `
          <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 16px;">
            <h2 style="color: #600694; text-align: center;">Welcome to the Satsang!</h2>
            <p style="color: #374151; font-size: 16px;">
              Hello! <strong>${groupLeaderName}</strong> recently applied for a group discount for your circle. 
              We are thrilled to welcome you all.
            </p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 12px; text-align: center; margin: 24px 0;">
              <p style="font-size: 14px; color: #6b7280; margin-bottom: 8px; text-transform: uppercase; font-weight: bold;">
                Your Exclusive ${discountPercent}% OFF Code:
              </p>
              <h1 style="color: #600694; font-size: 32px; letter-spacing: 2px; margin: 0;">${code}</h1>
            </div>

            <p style="color: #4b5563; font-size: 14px; background-color: #fef3c7; padding: 12px; border-radius: 8px; border-left: 4px solid #f59e0b;">
              <strong>Security Notice:</strong> To prevent fraud, this code is strictly locked to your email address. 
              When you check out, please make sure you sign up using this exact email address: <strong>${recipientEmail}</strong>.
            </p>

            <div style="text-align: center; margin-top: 32px;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/satsungs" 
                 style="background-color: #600694; color: white; padding: 14px 28px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block;">
                Join the Satsang Now
              </a>
            </div>
          </div>
        `,
      };

      // Await the transporter INSIDE the loop so it waits for completion before moving on
      await transporter.sendMail(mailOptions);
      console.log(`✅ Email sent successfully to: ${recipientEmail}`);
      successCount++;

    } catch (error) {
      // If one friend's email fails, we catch it here so it doesn't crash the whole loop
      console.error(`❌ Failed to send email to ${recipientEmail}:`, error);
    }
  }

  console.log(`Finished email blast. Successfully sent ${successCount} out of ${emails.length}`);
  
  // Return true if at least one email sent successfully
  return successCount > 0;
};