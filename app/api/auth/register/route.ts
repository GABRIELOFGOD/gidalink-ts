import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { sendOTPEmail } from '@/lib/email';
import { generateOTP, apiSuccess, apiError } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { name, email, phone, password, role, university } = await request.json();

    if (!name || !email || !phone || !password) return apiError('All fields are required');
    if (password.length < 6) return apiError('Password must be at least 6 characters');

    const allowedRoles = ['student', 'hostel_owner', 'agent'];
    if (role && !allowedRoles.includes(role)) return apiError('Invalid role');

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return apiError('Email already registered');

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    const user = await User.create({
      name: name.trim(), email: email.toLowerCase().trim(), phone: phone.trim(), password,
      role: role || 'student', university: university || '', otp, otpExpiry, isVerified: false,
    });

    await sendOTPEmail(email, name, otp).catch(console.error);

    return apiSuccess({ message: 'Registration successful. Check your email for the OTP.', email: user.email }, 201);
  } catch (e) {
    console.error(e);
    return apiError('Server error', 500);
  }
}
