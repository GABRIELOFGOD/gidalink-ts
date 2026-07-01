import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { Conversation } from '@/models/Conversation';
import Listing from '@/models/Listing';
import { requireAuth, createNotification } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/utils';

export async function GET(request: NextRequest) {
  const { error, user } = await requireAuth(request);
  if (error) return error;
  try {
    await connectDB();
    const conversations = await Conversation.find({ participants: user.id })
      .populate('participants', 'name profilePhoto role')
      .populate('listing', 'title photos annualRent')
      .sort({ lastMessageAt: -1 });
    return apiSuccess({ conversations });
  } catch {
    return apiError('Server error', 500);
  }
}

export async function POST(request: NextRequest) {
  const { error, user } = await requireAuth(request);
  if (error) return error;
  try {
    await connectDB();
    const { recipientId, listingId } = await request.json();
    if (!recipientId) return apiError('Recipient is required');

    let conversation = await Conversation.findOne({
      participants: { $all: [user.id, recipientId] },
      ...(listingId ? { listing: listingId } : {}),
    });

    if (!conversation) {
      conversation = await Conversation.create({ participants: [user.id, recipientId], listing: listingId || null });

      if (listingId) {
        const listing = await Listing.findById(listingId);
        if (listing) {
          await createNotification(recipientId, {
            type: 'message', title: 'New Inquiry',
            message: `Someone is interested in your listing "${listing.title}"`,
            link: `/dashboard/messages/${conversation._id}`,
          });
        }
      }
    }

    await conversation.populate('participants', 'name profilePhoto role');
    await conversation.populate('listing', 'title photos annualRent');
    return apiSuccess({ conversation }, 201);
  } catch (e) {
    console.error(e);
    return apiError('Server error', 500);
  }
}
