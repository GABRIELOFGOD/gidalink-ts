import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { sendOTPEmail } from '@/lib/email';
import { generateOTP, apiSuccess, apiError } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { email } = await request.json();
    if (!email) return apiError('Email is required');

    const user = await User.findOne({ email: email.toLowerCase() }).select('+otp +otpExpiry');
    if (!user) return apiError('User not found', 404);
    if (user.isVerified) return apiError('Account already verified');

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendOTPEmail(email, user.name, otp).catch(console.error);
    return apiSuccess({ message: 'OTP resent to your email' });
  } catch (e) {
    console.error(e);
    return apiError('Server error', 500);
  }
}
