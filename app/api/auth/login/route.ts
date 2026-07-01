import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { signJWT } from '@/lib/jwt';
import { apiSuccess, apiError } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { email, password } = await request.json();
    if (!email || !password) return apiError('Email and password are required');

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) return apiError('Invalid credentials', 401);
    if (!user.isVerified) return apiError('Please verify your email first', 403);
    if (user.isSuspended) return apiError('Your account has been suspended', 403);
    if (!user.isActive) return apiError('Account is inactive', 403);

    const match = await user.comparePassword(password);
    if (!match) return apiError('Invalid credentials', 401);

    const token = await signJWT({ id: user.id as string, email: user.email, role: user.role, name: user.name });

    const res = apiSuccess({
      message: 'Login successful',
      user: { _id: user.id, name: user.name, email: user.email, role: user.role, profilePhoto: user.profilePhoto },
    });
    res.headers.set('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 3600}; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);
    return res;
  } catch (e) {
    console.error(e);
    return apiError('Server error', 500);
  }
}
