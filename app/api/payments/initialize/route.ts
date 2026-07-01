import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import Payment from '@/models/Payment';
import User from '@/models/User';
import Listing from '@/models/Listing';
import { requireAuth } from '@/lib/auth';
import { initializeTransaction, generateReference } from '@/lib/paystack';
import { apiSuccess, apiError } from '@/lib/utils';

export async function POST(request: NextRequest) {
  const { error, user } = await requireAuth(request);
  if (error) return error;
  try {
    await connectDB();
    const { listingId, recipientId, amount, description } = await request.json();
    if (!recipientId || !amount || !listingId) return apiError('Listing, recipient, and amount are required');

    const recipient = await User.findById(recipientId);
    if (!recipient) return apiError('Recipient not found', 404);
    const listing = await Listing.findById(listingId);
    if (!listing) return apiError('Listing not found', 404);

    const platformFee = Math.round(amount * 0.10);
    const netAmount    = amount - platformFee;
    const reference     = generateReference('RENT');

    const { data } = await initializeTransaction({
      email: user.email, amount, reference,
      callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/payments?payment=success&ref=${reference}`,
      metadata: { listingId, recipientId, type: 'rent' },
    });

    await Payment.create({
      payer: user.id, recipient: recipientId, listing: listingId, amount, platformFee, netAmount,
      type: 'rent', status: 'pending', paystackReference: reference,
      description: description || `Rent payment for "${listing.title}"`,
    });

    return apiSuccess({ authorizationUrl: data.authorization_url, reference });
  } catch (e) {
    console.error(e);
    return apiError('Server error', 500);
  }
}
