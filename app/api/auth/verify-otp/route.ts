import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { signJWT } from '@/lib/jwt';
import { apiSuccess, apiError } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { email, otp } = await request.json();
    if (!email || !otp) return apiError('Email and OTP are required');

    const user = await User.findOne({ email: email.toLowerCase() }).select('+otp +otpExpiry');
    if (!user) return apiError('User not found', 404);
    if (user.isVerified) return apiError('Account already verified');
    if (!user.otp || user.otp !== otp) return apiError('Invalid OTP');
    if (!user.otpExpiry || new Date() > user.otpExpiry) return apiError('OTP has expired. Request a new one.');

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    const token = await signJWT({ id: user.id as string, email: user.email, role: user.role, name: user.name });

    const res = apiSuccess({ message: 'Email verified successfully', user: { _id: user.id, name: user.name, email: user.email, role: user.role } });
    res.headers.set('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 3600}; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);
    return res;
  } catch (e) {
    console.error(e);
    return apiError('Server error', 500);
  }
}
