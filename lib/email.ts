import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const brand = `
  <div style="text-align:center;margin-bottom:24px;">
    <h1 style="color:#4F46E5;font-size:26px;font-weight:800;margin:0;font-family:Inter,sans-serif;">GidaLink</h1>
    <p style="color:#6B7280;font-size:12px;margin:4px 0 0;font-family:Inter,sans-serif;">Your Campus. Your Home.</p>
  </div>
`;

const wrap = (body: string) => `
  <div style="font-family:Inter,system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#fff;border:1px solid #E5E7EB;border-radius:16px;">
    ${brand}${body}
    <p style="color:#9CA3AF;font-size:12px;margin-top:24px;text-align:center;">GidaLink · Your Campus. Your Home.</p>
  </div>
`;

export async function sendOTPEmail(email: string, name: string, otp: string): Promise<void> {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM ?? 'GidaLink <no-reply@gidalink.com>',
    to: email,
    subject: 'Verify your GidaLink account',
    html: wrap(`
      <h2 style="color:#111827;font-size:20px;font-weight:700;">Hey ${name}, verify your email</h2>
      <p style="color:#6B7280;font-size:15px;line-height:1.6;">Enter the code below to activate your account. It expires in <strong>10 minutes</strong>.</p>
      <div style="text-align:center;margin:28px 0;">
        <span style="display:inline-block;background:#EEF2FF;color:#3730A3;font-size:38px;font-weight:800;letter-spacing:14px;padding:16px 28px;border-radius:12px;border:2px dashed #4F46E5;">${otp}</span>
      </div>
      <p style="color:#9CA3AF;font-size:13px;">Didn't create an account? You can ignore this email.</p>
    `),
  });
}

export async function sendPasswordResetEmail(email: string, name: string, resetUrl: string): Promise<void> {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM ?? 'GidaLink <no-reply@gidalink.com>',
    to: email,
    subject: 'Reset your GidaLink password',
    html: wrap(`
      <h2 style="color:#111827;font-size:20px;font-weight:700;">Reset your password, ${name}</h2>
      <p style="color:#6B7280;font-size:15px;line-height:1.6;">Click below to set a new password. The link expires in <strong>1 hour</strong>.</p>
      <div style="text-align:center;margin:28px 0;">
        <a href="${resetUrl}" style="display:inline-block;background:#4F46E5;color:#fff;font-size:16px;font-weight:700;padding:14px 32px;border-radius:10px;text-decoration:none;">Reset Password</a>
      </div>
      <p style="color:#9CA3AF;font-size:13px;">Didn't request this? Ignore and your password stays unchanged.</p>
    `),
  });
}

export async function sendPaymentEmail(email: string, name: string, subject: string, message: string): Promise<void> {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM ?? 'GidaLink <no-reply@gidalink.com>',
    to: email,
    subject,
    html: wrap(`
      <p style="color:#111827;font-size:15px;line-height:1.6;">Hi ${name},</p>
      <p style="color:#111827;font-size:15px;line-height:1.6;">${message}</p>
      <div style="text-align:center;margin-top:24px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/payments" style="display:inline-block;background:#4F46E5;color:#fff;font-size:15px;font-weight:700;padding:12px 28px;border-radius:10px;text-decoration:none;">View Payments</a>
      </div>
    `),
  });
}
