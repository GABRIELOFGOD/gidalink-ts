import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IReviewDoc extends Document {
  listing: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;   // null when not logged in
  deviceId: string;                   // always present — used for dedup
  isAnonymous: boolean;
  displayName?: string;               // only populated when NOT anonymous
  displayPhoto?: string;
  overallRating: number;
  ratings: {
    landlordResponsiveness: number;
    waterSupply: number;
    powerSupply: number;
    buildingCondition: number;
    security: number;
    valueForMoney: number;
  };
  writtenReview: string;
  moveInDate?: string;
  moveOutDate?: string;
  landlordResponse?: string;
  flags: Array<{ deviceId: string; createdAt: Date }>;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReviewDoc>(
  {
    listing:       { type: Schema.Types.ObjectId, ref: 'Listing', required: true },
    userId:        { type: Schema.Types.ObjectId, ref: 'User', default: null },
    deviceId:      { type: String, required: true },
    isAnonymous:   { type: Boolean, default: false },
    displayName:   { type: String, default: '' },
    displayPhoto:  { type: String, default: '' },
    overallRating: { type: Number, required: true, min: 1, max: 5 },
    ratings: {
      landlordResponsiveness: { type: Number, min: 1, max: 5, default: 3 },
      waterSupply:            { type: Number, min: 1, max: 5, default: 3 },
      powerSupply:            { type: Number, min: 1, max: 5, default: 3 },
      buildingCondition:      { type: Number, min: 1, max: 5, default: 3 },
      security:               { type: Number, min: 1, max: 5, default: 3 },
      valueForMoney:          { type: Number, min: 1, max: 5, default: 3 },
    },
    writtenReview: { type: String, required: true, minlength: 30, maxlength: 2000 },
    moveInDate:    { type: String, default: '' },
    moveOutDate:   { type: String, default: '' },
    landlordResponse: { type: String, default: '' },
    flags: [{
      deviceId:  { type: String },
      createdAt: { type: Date, default: Date.now },
    }],
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// One review per device per listing (prevents spam even without login)
ReviewSchema.index({ listing: 1, deviceId: 1 }, { unique: true });
ReviewSchema.index({ listing: 1, createdAt: -1 });

const Review: Model<IReviewDoc> =
  (mongoose.models.Review as Model<IReviewDoc>) ?? mongoose.model<IReviewDoc>('Review', ReviewSchema);

export default Review;
