import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { sendPasswordResetEmail } from '@/lib/email';
import { apiSuccess, apiError } from '@/lib/utils';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { email } = await request.json();
    if (!email) return apiError('Email is required');

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return apiSuccess({ message: 'If that email exists, a reset link was sent.' });

    const token = crypto.randomBytes(32).toString('hex');
    user.resetToken = token;
    user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}&email=${email}`;
    await sendPasswordResetEmail(email, user.name, resetUrl).catch(console.error);

    return apiSuccess({ message: 'If that email exists, a reset link was sent.' });
  } catch (e) {
    console.error(e);
    return apiError('Server error', 500);
  }
}
