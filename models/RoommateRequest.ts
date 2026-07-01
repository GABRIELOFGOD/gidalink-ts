import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IPartialListing {
  roomType?: string;
  address?: string;
  rent?: number;
  nearbyUniversity?: string;
  waterSupply?: string[];
  powerSupply?: string[];
  genderPolicy?: string;
  amenities?: string[];
  photos?: string[];
  drainageCondition?: string;
  buildingCondition?: string;
  securityType?: string[];
}

export interface IRoommateDoc extends Document {
  userId?: mongoose.Types.ObjectId;
  deviceId: string;
  isAnonymous: boolean;
  displayName?: string;
  university: string;
  course?: string;
  level?: string;
  gender: 'Male' | 'Female' | 'Any';
  budget: number;
  preferredArea: string;
  state: string;
  description: string;
  contactInfo?: string;
  hasListingDetails: boolean;
  listingRef?: mongoose.Types.ObjectId;
  partialListing?: IPartialListing;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PartialListingSchema = new Schema<IPartialListing>(
  {
    roomType:          String,
    address:           String,
    rent:              Number,
    nearbyUniversity:  String,
    waterSupply:       [String],
    powerSupply:       [String],
    genderPolicy:      String,
    amenities:         [String],
    photos:            [String],
    drainageCondition: String,
    buildingCondition: String,
    securityType:      [String],
  },
  { _id: false }
);

const RoommateSchema = new Schema<IRoommateDoc>(
  {
    userId:      { type: Schema.Types.ObjectId, ref: 'User', default: null },
    deviceId:    { type: String, required: true },
    isAnonymous: { type: Boolean, default: false },
    displayName: { type: String, default: '' },
    university:  { type: String, required: true },
    course:      { type: String, default: '' },
    level:       { type: String, default: '' },
    gender:      { type: String, enum: ['Male','Female','Any'], required: true },
    budget:      { type: Number, required: true, min: 0 },
    preferredArea: { type: String, required: true, trim: true },
    state:         { type: String, required: true },
    description:   { type: String, required: true, minlength: 20, maxlength: 1000 },
    contactInfo:   { type: String, default: '' },
    hasListingDetails: { type: Boolean, default: false },
    listingRef:    { type: Schema.Types.ObjectId, ref: 'Listing', default: null },
    partialListing: { type: PartialListingSchema, default: null },
    isActive:  { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

RoommateSchema.index({ university: 1, createdAt: -1 });
RoommateSchema.index({ state: 1 });

const RoommateRequest: Model<IRoommateDoc> =
  (mongoose.models.RoommateRequest as Model<IRoommateDoc>) ??
  mongoose.model<IRoommateDoc>('RoommateRequest', RoommateSchema);

export default RoommateRequest;
