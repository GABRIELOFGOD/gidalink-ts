import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import Payment from '@/models/Payment';
import Listing from '@/models/Listing';
import { requireAuth, createNotification } from '@/lib/auth';
import { verifyTransaction } from '@/lib/paystack';
import { sendPaymentEmail } from '@/lib/email';
import { apiSuccess, apiError } from '@/lib/utils';

export async function GET(request: NextRequest, { params }: { params: Promise<{ reference: string }> }) {
  const { error } = await requireAuth(request);
  if (error) return error;
  try {
    await connectDB();
    const { reference } = await params;
    const payment = await Payment.findOne({ paystackReference: reference })
      .populate<{ payer: { _id: string; name: string; email: string } }>('payer', 'name email')
      .populate<{ recipient: { _id: string; name: string; email: string } }>('recipient', 'name email')
      .populate('listing', 'title');
    if (!payment) return apiError('Payment not found', 404);

    if (payment.status === 'success') return apiSuccess({ payment, message: 'Payment already verified' });

    const { data } = await verifyTransaction(reference);
    if (!data || data.status !== 'success') return apiError('Payment not successful');

    payment.status = 'success';
    payment.paystackData = data;
    await payment.save();

    if (payment.type === 'boost' && payment.listing) {
      const boostExpiry = new Date();
      boostExpiry.setDate(boostExpiry.getDate() + payment.boostDuration);
      await Listing.findByIdAndUpdate(payment.listing, { isPremium: true, premiumExpiry: boostExpiry });
    }

    await createNotification(payment.recipient._id.toString(), {
      type: 'payment', title: 'Payment Received',
      message: `You received ₦${payment.netAmount.toLocaleString()} for "${(payment.listing as unknown as { title?: string })?.title ?? 'a listing'}"`,
      link: '/dashboard/payments',
    });

    await sendPaymentEmail(
      payment.recipient.email, payment.recipient.name, 'Payment Received - GidaLink',
      `You received a rent payment of ₦${payment.netAmount.toLocaleString()} (after 10% platform fee) for "${(payment.listing as unknown as { title?: string })?.title ?? 'a listing'}".`
    ).catch(console.error);

    return apiSuccess({ payment, message: 'Payment verified successfully' });
  } catch (e) {
    console.error(e);
    return apiError('Server error', 500);
  }
}
