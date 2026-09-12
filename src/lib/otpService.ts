import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmailOtp(toEmail: string, otpCode: string, purpose: string) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('[OTP WARNING] SMTP credentials missing in .env. Falling back to console.');
    return false;
  }

  const mailOptions = {
    from: process.env.SMTP_FROM || `"Humane Touch Trust" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: `Your Humane Touch Verification Code: ${otpCode}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #0f172a; margin: 0; font-size: 20px;">Humane Touch Trust</h2>
          <p style="color: #d97706; margin: 4px 0 0 0; font-size: 12px; font-weight: bold;">Udaan Scholarship Program</p>
        </div>
        <p style="color: #334155; font-size: 14px;">Hello,</p>
        <p style="color: #334155; font-size: 14px;">Your one-time verification code for <strong>${purpose}</strong> is:</p>
        <div style="text-align: center; margin: 24px 0;">
          <span style="font-size: 32px; font-weight: 900; letter-spacing: 6px; color: #0f172a; background-color: #fef3c7; padding: 12px 24px; border-radius: 12px; border: 1px solid #fde68a; display: inline-block;">
            ${otpCode}
          </span>
        </div>
        <p style="color: #64748b; font-size: 12px; text-align: center;">This code is valid for <strong>10 minutes</strong>. Do not share this OTP with anyone.</p>
        <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
        <p style="color: #94a3b8; font-size: 11px; text-align: center;">© 2026 Humane Touch Trust • Bengaluru, Karnataka</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL DISPATCH] Live OTP sent to ${toEmail} | ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('[EMAIL ERROR] SMTP error:', error);
    return false;
  }
}

export async function sendMobileOtp(phone: string, otpCode: string) {
  const cleanPhone = phone.replace(/\D/g, '').slice(-10);

  if (process.env.FAST2SMS_API_KEY) {
    try {
      const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          authorization: process.env.FAST2SMS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          route: 'otp',
          variables_values: otpCode,
          numbers: cleanPhone,
        }),
      });

      const data = await response.json();
      if (data.return) {
        console.log(`[SMS DISPATCH] Fast2SMS OTP delivered to +91 ${cleanPhone}`);
        return true;
      }
    } catch (err) {
      console.error('[SMS ERROR] Fast2SMS dispatch failed:', err);
    }
  }

  console.log(`\n======================================================`);
  console.log(`🔑 [CONSOLE OTP] Destination: +91 ${cleanPhone}`);
  console.log(`👉 Code: ${otpCode} (Valid 10 mins)`);
  console.log(`======================================================\n`);
  return false;
}