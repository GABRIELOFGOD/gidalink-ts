import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { requireAdmin } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/utils';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin(request);
  if (error) return error;
  try {
    await connectDB();
    const { id } = await params;
    const { isSuspended, suspensionReason, isActive, role } = await request.json();
    const user = await User.findById(id);
    if (!user) return apiError('User not found', 404);

    if (isSuspended !== undefined) { user.isSuspended = isSuspended; user.suspensionReason = suspensionReason || ''; }
    if (isActive !== undefined) user.isActive = isActive;
    if (role) user.role = role;
    await user.save();

    return apiSuccess({ message: 'User updated', user: user.toPublic() });
  } catch {
    return apiError('Server error', 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin(request);
  if (error) return error;
  try {
    await connectDB();
    const { id } = await params;
    await User.findByIdAndUpdate(id, { isActive: false });
    return apiSuccess({ message: 'User deactivated' });
  } catch {
    return apiError('Server error', 500);
  }
}
