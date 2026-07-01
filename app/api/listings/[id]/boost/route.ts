import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import Listing from '@/models/Listing';
import Payment from '@/models/Payment';
import { requireAuth } from '@/lib/auth';
import { initializeTransaction, generateReference } from '@/lib/paystack';
import { apiSuccess, apiError } from '@/lib/utils';

const BOOST_PRICES: Record<number, number> = { 7: 2500, 14: 4500, 30: 9000 };

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, user } = await requireAuth(request);
  if (error) return error;
  try {
    await connectDB();
    const { id } = await params;
    const { days } = await request.json();
    if (![7, 14, 30].includes(Number(days))) return apiError('Invalid boost duration');

    const listing = await Listing.findOne({ _id: id, isDeleted: false });
    if (!listing) return apiError('Listing not found', 404);
    if (listing.creator.toString() !== user.id) return apiError('Forbidden', 403);

    const amount = BOOST_PRICES[Number(days)];
    const reference = generateReference('BOOST');

    const { data } = await initializeTransaction({
      email: user.email, amount, reference,
      callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/listings?boost=success`,
      metadata: { listingId: id, days, type: 'boost' },
    });

    await Payment.create({
      payer: user.id, recipient: user.id, listing: id, amount, platformFee: amount, netAmount: 0,
      type: 'boost', status: 'pending', paystackReference: reference, boostDuration: days,
      description: `${days}-day Featured Boost for "${listing.title}"`,
    });

    return apiSuccess({ authorizationUrl: data.authorization_url, reference });
  } catch (e) {
    console.error(e);
    return apiError('Server error', 500);
  }
}
