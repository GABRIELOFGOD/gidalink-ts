import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IListingDoc extends Document {
  title: string;
  listingType: 'hostel' | 'apartment' | 'shared_room' | 'self_contain';
  apartmentType: string;
  nearbyUniversity: string;
  distanceFromCampus: string;
  roomType: string;
  genderPolicy: string;
  studentAmenities: string[];
  streetAddress: string;
  area: string;
  lga: string;
  state: string;
  coordinates: { lat: number; lng: number } | null;
  annualRent: number;
  drainageCondition: string;
  waterSupply: string[];
  powerSupply: string[];
  buildingCondition: string;
  securityType: string[];
  furnishingStatus: string;
  availabilityStatus: string;
  additionalNotes: string;
  photos: string[];
  creator: mongoose.Types.ObjectId;  // always the real ID
  isAnonymous: boolean;
  agencyFee: string;
  isPremium: boolean;
  premiumExpiry: Date | null;
  views: number;
  flagCount: number;
  flags: Array<{ user: mongoose.Types.ObjectId; reason: string; createdAt: Date }>;
  isFlagged: boolean;
  averageRating: number;
  reviewCount: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ListingSchema = new Schema<IListingDoc>(
  {
    title:              { type: String, required: true, trim: true },
    listingType:        { type: String, enum: ['hostel','apartment','shared_room','self_contain'], default: 'hostel' },
    apartmentType:      { type: String, required: true },
    nearbyUniversity:   { type: String, default: '' },
    distanceFromCampus: { type: String, default: '' },
    roomType:           { type: String, default: '' },
    genderPolicy:       { type: String, default: '' },
    studentAmenities:   [{ type: String }],
    streetAddress:      { type: String, required: true, trim: true },
    area:               { type: String, required: true, trim: true },
    lga:                { type: String, required: true, trim: true },
    state:              { type: String, required: true, trim: true },
    coordinates:        { type: { lat: Number, lng: Number }, default: null },
    annualRent:         { type: Number, required: true, min: 0 },
    drainageCondition:  { type: String, enum: ['Poor','Fair','Good','Excellent'], required: true },
    waterSupply:        [{ type: String }],
    powerSupply:        [{ type: String }],
    buildingCondition:  { type: String, enum: ['Poor','Fair','Good','Excellent'], required: true },
    securityType:       [{ type: String }],
    furnishingStatus:   { type: String, enum: ['Unfurnished','Semi-Furnished','Fully Furnished'], required: true },
    availabilityStatus: { type: String, enum: ['Available','Taken','Available Soon'], default: 'Available' },
    additionalNotes:    { type: String, default: '', maxlength: 1500 },
    photos:             [{ type: String }],
    creator:            { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isAnonymous:        { type: Boolean, default: false },
    agencyFee:          { type: String, default: '' },
    isPremium:          { type: Boolean, default: false },
    premiumExpiry:      { type: Date, default: null },
    views:              { type: Number, default: 0 },
    flagCount:          { type: Number, default: 0 },
    flags: [{
      user:      { type: Schema.Types.ObjectId, ref: 'User' },
      reason:    { type: String, default: '' },
      createdAt: { type: Date, default: Date.now },
    }],
    isFlagged:     { type: Boolean, default: false },
    averageRating: { type: Number, default: 0 },
    reviewCount:   { type: Number, default: 0 },
    isDeleted:     { type: Boolean, default: false },
  },
  { timestamps: true }
);

ListingSchema.index({ state: 1, lga: 1 });
ListingSchema.index({ nearbyUniversity: 1 });
ListingSchema.index({ isPremium: -1, createdAt: -1 });
ListingSchema.index({ creator: 1 });
ListingSchema.index({ listingType: 1 });

const Listing: Model<IListingDoc> =
  (mongoose.models.Listing as Model<IListingDoc>) ?? mongoose.model<IListingDoc>('Listing', ListingSchema);

export default Listing;
