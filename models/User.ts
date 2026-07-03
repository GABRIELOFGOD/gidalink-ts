import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import type { UserRole } from '@/types';

export interface IUserDoc extends Document {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  profilePhoto: string;
  bio: string;
  university: string;
  showPhone: boolean;
  isVerified: boolean;
  isActive: boolean;
  isSuspended: boolean;
  suspensionReason: string;
  bookmarkedListings: string[];
  otp?: string;
  otpExpiry?: Date;
  resetToken?: string;
  resetTokenExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
  toPublic(): Record<string, unknown>;
}

const UserSchema = new Schema<IUserDoc>(
  {
    name:             { type: String, required: true, trim: true },
    email:            { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone:            { type: String, required: true, trim: true },
    password:         { type: String, required: true, select: false },
    role:             { type: String, enum: ['student','hostel_owner','agent','admin'], default: 'student' },
    profilePhoto:     { type: String, default: '' },
    bio:              { type: String, default: '', maxlength: 300 },
    university:       { type: String, default: '' },
    showPhone:        { type: Boolean, default: false },
    isVerified:       { type: Boolean, default: false },
    isActive:         { type: Boolean, default: true },
    isSuspended:      { type: Boolean, default: false },
    suspensionReason: { type: String, default: '' },
    bookmarkedListings: { type: [String], default: [] },
    otp:              { type: String, select: false },
    otpExpiry:        { type: Date,   select: false },
    resetToken:       { type: String, select: false },
    resetTokenExpiry: { type: Date,   select: false },
  },
  { timestamps: true }
);

UserSchema.pre<IUserDoc>('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

UserSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password as string);
};

UserSchema.methods.toPublic = function (): Record<string, unknown> {
  const obj = this.toObject();
  delete obj.password;
  delete obj.otp;
  delete obj.otpExpiry;
  delete obj.resetToken;
  delete obj.resetTokenExpiry;
  return obj;
};

const User: Model<IUserDoc> =
  (mongoose.models.User as Model<IUserDoc>) ?? mongoose.model<IUserDoc>('User', UserSchema);

export default User;
