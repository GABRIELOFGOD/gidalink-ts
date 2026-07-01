// ─────────────────────────────────────────────────────────────────
// Shared TypeScript types for GidaLink
// ─────────────────────────────────────────────────────────────────

export type UserRole = 'student' | 'hostel_owner' | 'agent' | 'admin';
export type ListingType = 'hostel' | 'apartment' | 'shared_room' | 'self_contain';
export type Condition = 'Poor' | 'Fair' | 'Good' | 'Excellent';
export type FurnishingStatus = 'Unfurnished' | 'Semi-Furnished' | 'Fully Furnished';
export type AvailabilityStatus = 'Available' | 'Taken' | 'Available Soon';
export type GenderPolicy = 'Males Only' | 'Females Only' | 'Mixed';
export type RoommateGender = 'Male' | 'Female' | 'Any';
export type PaymentType = 'rent' | 'boost';
export type PaymentStatus = 'pending' | 'success' | 'failed' | 'refunded';

// ── User ─────────────────────────────────────────────────────────
export interface IUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  profilePhoto?: string;
  bio?: string;
  university?: string;
  showPhone: boolean;
  isVerified: boolean;
  isActive: boolean;
  isSuspended: boolean;
  suspensionReason?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Listing ───────────────────────────────────────────────────────
export interface IListing {
  _id: string;
  title: string;
  listingType: ListingType;
  apartmentType: string;
  nearbyUniversity?: string;
  distanceFromCampus?: string;
  roomType?: string;
  genderPolicy?: GenderPolicy;
  studentAmenities?: string[];
  streetAddress: string;
  area: string;
  lga: string;
  state: string;
  coordinates?: { lat: number; lng: number };
  annualRent: number;
  monthlyRent?: number;
  drainageCondition: Condition;
  waterSupply: string[];
  powerSupply: string[];
  buildingCondition: Condition;
  securityType: string[];
  furnishingStatus: FurnishingStatus;
  availabilityStatus: AvailabilityStatus;
  additionalNotes?: string;
  photos: string[];
  creator?: IUser | null;    // null when anonymous
  realCreatorId?: string;    // admin-only field
  isAnonymous: boolean;
  agencyFee?: string;
  isPremium: boolean;
  premiumExpiry?: string;
  views: number;
  flagCount: number;
  isFlagged: boolean;
  averageRating: number;
  reviewCount: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Review ────────────────────────────────────────────────────────
export interface IReviewRatings {
  landlordResponsiveness: number;
  waterSupply: number;
  powerSupply: number;
  buildingCondition: number;
  security: number;
  valueForMoney: number;
}

export interface IReview {
  _id: string;
  listing: string;
  userId?: string;
  deviceId: string;
  isAnonymous: boolean;
  displayName?: string;     // populated for non-anonymous
  displayPhoto?: string;
  overallRating: number;
  ratings: IReviewRatings;
  writtenReview: string;
  moveInDate?: string;
  moveOutDate?: string;
  landlordResponse?: string;
  isDeleted: boolean;
  createdAt: string;
}

// ── Roommate Request ──────────────────────────────────────────────
export interface IRoommatePartialListing {
  roomType?: string;
  address?: string;
  rent?: number;
  nearbyUniversity?: string;
  amenities?: string[];
  photos?: string[];
  waterSupply?: string[];
  powerSupply?: string[];
  genderPolicy?: GenderPolicy;
  drainageCondition?: string;
  buildingCondition?: string;
  securityType?: string[];
}

export interface IRoommateRequest {
  _id: string;
  userId?: string;
  deviceId: string;
  isAnonymous: boolean;
  displayName?: string;
  university: string;
  course?: string;
  level?: string;
  gender: RoommateGender;
  budget: number;
  preferredArea: string;
  state: string;
  description: string;
  contactInfo?: string;
  hasListingDetails: boolean;
  listingRef?: string;
  partialListing?: IRoommatePartialListing;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
}

// ── Conversation / Message ────────────────────────────────────────
export interface IConversation {
  _id: string;
  participants: IUser[];
  listing?: Pick<IListing, '_id' | 'title' | 'photos' | 'annualRent'>;
  lastMessage?: string;
  lastMessageAt: string;
  createdAt: string;
}

export interface IMessage {
  _id: string;
  conversation: string;
  sender: Pick<IUser, '_id' | 'name' | 'profilePhoto' | 'role'>;
  content: string;
  isRead: boolean;
  createdAt: string;
}

// ── Payment ───────────────────────────────────────────────────────
export interface IPayment {
  _id: string;
  payer: Pick<IUser, '_id' | 'name' | 'email'>;
  recipient: Pick<IUser, '_id' | 'name' | 'email'>;
  listing?: Pick<IListing, '_id' | 'title'>;
  amount: number;
  platformFee: number;
  netAmount: number;
  type: PaymentType;
  status: PaymentStatus;
  paystackReference: string;
  boostDuration?: number;
  description?: string;
  createdAt: string;
}

// ── Notification ──────────────────────────────────────────────────
export interface INotification {
  _id: string;
  user: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

// ── API helpers ───────────────────────────────────────────────────
export interface ApiSuccess<T = unknown> {
  success: true;
  message?: string;
  data?: T;
  [key: string]: unknown;
}

export interface ApiError {
  success: false;
  message: string;
}

export type ApiResult<T = unknown> = ApiSuccess<T> | ApiError;

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}
