import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import Payment from '@/models/Payment';
import Listing from '@/models/Listing';
import { verifyWebhookSignature } from '@/lib/paystack';
import { createNotification } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-paystack-signature') ?? '';
    const rawBody = await request.text();

    if (!verifyWebhookSignature(rawBody, signature)) return apiError('Invalid signature', 400);

    const body = JSON.parse(rawBody);
    if (body.event !== 'charge.success') return apiSuccess({ received: true });

    await connectDB();
    const reference = body.data.reference;
    const payment = await Payment.findOne({ paystackReference: reference });
    if (!payment || payment.status === 'success') return apiSuccess({ received: true });

    payment.status = 'success';
    payment.paystackData = body.data;
    await payment.save();

    if (payment.type === 'boost' && payment.listing) {
      const boostExpiry = new Date();
      boostExpiry.setDate(boostExpiry.getDate() + payment.boostDuration);
      await Listing.findByIdAndUpdate(payment.listing, { isPremium: true, premiumExpiry: boostExpiry });
    }

    await createNotification(payment.recipient.toString(), {
      type: 'payment', title: 'Payment Confirmed',
      message: `Payment of ₦${payment.netAmount.toLocaleString()} has been confirmed.`,
      link: '/dashboard/payments',
    });

    return apiSuccess({ received: true });
  } catch (e) {
    console.error(e);
    return apiError('Server error', 500);
  }
}
