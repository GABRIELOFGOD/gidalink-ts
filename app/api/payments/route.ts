import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import Payment from '@/models/Payment';
import { requireAuth } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/utils';

export async function GET(request: NextRequest) {
  const { error, user } = await requireAuth(request);
  if (error) return error;
  try {
    await connectDB();
    const payments = await Payment.find({ $or: [{ payer: user.id }, { recipient: user.id }] })
      .populate('payer', 'name email')
      .populate('recipient', 'name email')
      .populate('listing', 'title')
      .sort({ createdAt: -1 })
      .limit(50);
    return apiSuccess({ payments });
  } catch {
    return apiError('Server error', 500);
  }
}
