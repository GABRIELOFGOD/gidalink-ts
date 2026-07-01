import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { signJWT } from '@/lib/jwt';
import { apiSuccess, apiError } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, password, secretCode } = await request.json();

    if (secretCode !== process.env.ADMIN_SECRET_CODE) return apiError('Invalid secret code', 403);
    if (!name || !email || !phone || !password) return apiError('All fields are required');

    await connectDB();
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return apiError('Email already registered');

    const user = await User.create({ name, email: email.toLowerCase(), phone, password, role: 'admin', isVerified: true, isActive: true });
    const token = await signJWT({ id: user.id as string, email: user.email, role: 'admin', name: user.name });

    const res = apiSuccess({ message: 'Admin account created', user: { _id: user.id, name: user.name, role: 'admin' } }, 201);
    res.headers.set('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 3600}; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);
    return res;
  } catch (e) {
    console.error(e);
    return apiError('Server error', 500);
  }
}
