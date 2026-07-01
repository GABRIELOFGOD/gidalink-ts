import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { apiSuccess, apiError } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { email, token, password } = await request.json();
    if (!email || !token || !password) return apiError('All fields required');
    if (password.length < 6) return apiError('Password must be at least 6 characters');

    const user = await User.findOne({ email: email.toLowerCase() }).select('+resetToken +resetTokenExpiry');
    if (!user || user.resetToken !== token) return apiError('Invalid or expired reset link');
    if (!user.resetTokenExpiry || new Date() > user.resetTokenExpiry) return apiError('Reset link has expired');

    user.password = password;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    return apiSuccess({ message: 'Password reset successfully. Please log in.' });
  } catch (e) {
    console.error(e);
    return apiError('Server error', 500);
  }
}
