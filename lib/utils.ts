// ─────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────
export const NIGERIAN_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT','Gombe','Imo',
  'Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa',
  'Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba',
  'Yobe','Zamfara',
] as const;

export const LISTING_TYPES = [
  { value: 'hostel',      label: 'Student Hostel',    icon: '🏠' },
  { value: 'apartment',   label: 'Apartment',          icon: '🏢' },
  { value: 'shared_room', label: 'Shared Room',        icon: '🛏️' },
  { value: 'self_contain', label: 'Self Contain',      icon: '🔑' },
] as const;

export const APARTMENT_TYPES = [
  'Self-Contain','Bedsitter','Mini Flat','1-Bedroom Flat','2-Bedroom Flat',
  '3-Bedroom Flat','4-Bedroom Flat & Above','Face-Me-I-Face-You',
  'Boys Quarters','Duplex','Bungalow','Studio Apartment','Serviced Apartment',
  'Short-Let',
] as const;

export const ROOM_TYPES = ['Single Room','Double Room','Triple Room','Self-Contain','Flat'] as const;

export const GENDER_POLICIES = ['Males Only','Females Only','Mixed'] as const;

export const STUDENT_AMENITIES = [
  'WiFi','Study Room','Kitchen','Laundry','24h Generator',
  'Borehole Water','CCTV','Security Guard','Car Park','Gym',
] as const;

export const WATER_SUPPLY_OPTIONS = [
  'None','Irregular Tap','Regular Tap','Borehole','Tap + Borehole',
] as const;

export const POWER_SUPPLY_OPTIONS = [
  'None','Irregular NEPA','Regular NEPA','Solar','Generator','NEPA + Solar',
] as const;

export const SECURITY_OPTIONS = [
  'Open Compound','Gated','Security Guard Post','Walled + Gate',
] as const;

export const CONDITION_RATINGS = ['Poor','Fair','Good','Excellent'] as const;
export const FURNISHING_OPTIONS = ['Unfurnished','Semi-Furnished','Fully Furnished'] as const;
export const AVAILABILITY_OPTIONS = ['Available','Taken','Available Soon'] as const;

export const UNIVERSITIES = [
  'University of Ilorin (UNILORIN)',
  'Kwara State University (KWASU)',
  'Al-Hikmah University',
  'Landmark University',
  'University of Lagos (UNILAG)',
  'University of Ibadan (UI)',
  'Obafemi Awolowo University (OAU)',
  'University of Benin (UNIBEN)',
  'Ahmadu Bello University (ABU)',
  'University of Nigeria Nsukka (UNN)',
  'University of Port Harcourt (UNIPORT)',
  'Federal University of Technology Akure (FUTA)',
  'Covenant University',
  'Babcock University',
  'Redeemer\'s University',
  'Other',
] as const;

export const STUDENT_LEVELS = ['100L','200L','300L','400L','500L','600L','Postgraduate','Other'] as const;

/** Pre-defined university lat/lng — map flies here when student picks their school */
export const UNIVERSITY_COORDINATES: Record<string, [number, number]> = {
  'University of Ilorin (UNILORIN)':                [8.4799,  4.5418],
  'Kwara State University (KWASU)':                 [8.3791,  4.8667],
  'Al-Hikmah University':                           [8.4964,  4.5527],
  'Landmark University':                            [8.1345,  5.0460],
  'University of Lagos (UNILAG)':                   [6.5189,  3.3980],
  'University of Ibadan (UI)':                      [7.4449,  3.8967],
  'Obafemi Awolowo University (OAU)':               [7.5201,  4.5236],
  'University of Benin (UNIBEN)':                   [6.3750,  5.6140],
  'Ahmadu Bello University (ABU)':                  [11.1660, 7.6370],
  'University of Nigeria Nsukka (UNN)':             [6.8764,  7.3986],
  'University of Port Harcourt (UNIPORT)':          [4.9000,  6.9600],
  'Federal University of Technology Akure (FUTA)':  [7.2975,  5.1342],
  'Covenant University':                            [6.6705,  3.1695],
  'Babcock University':                             [6.8918,  3.7236],
  "Redeemer's University":                          [6.8389,  3.5813],
};

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency', currency: 'NGN', minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(date));
}

export function timeAgo(date: string | Date): string {
  const secs = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  for (const [label, s] of [['year',31536000],['month',2592000],['day',86400],['hour',3600],['minute',60]] as [string,number][]) {
    const n = Math.floor(secs / s);
    if (n >= 1) return `${n} ${label}${n > 1 ? 's' : ''} ago`;
  }
  return 'just now';
}

export function paginate(page: number, limit: number): { skip: number; limit: number } {
  return { skip: (Math.max(1, page) - 1) * limit, limit };
}

export function apiSuccess(data: Record<string, unknown>, status = 200): Response {
  return Response.json({ success: true, ...data }, { status });
}

export function apiError(message: string, status = 400): Response {
  return Response.json({ success: false, message }, { status });
}

export function maskPhone(phone: string): string {
  return phone.slice(0, 4) + '****' + phone.slice(-3);
}

/** Returns a shallow copy of obj with the given keys removed. Used to strip
 *  sensitive fields (deviceId, raw userId) from API responses before sending
 *  them to the client. */
export function omitFields<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const copy = { ...obj } as Record<string, unknown>;
  for (const key of keys) delete copy[key as string];
  return copy as Omit<T, K>;
}

/** Deterministic colour from a seed string — used for anonymous avatars */
export function seedToColour(seed: string): string {
  const colours = ['#6366F1','#8B5CF6','#EC4899','#F97316','#14B8A6','#3B82F6','#A855F7','#F43F5E'];
  let hash = 0;
  for (const ch of seed) hash = (hash << 5) - hash + ch.charCodeAt(0);
  return colours[Math.abs(hash) % colours.length];
}

/** Build DiceBear avatar URL for anonymous users */
export function anonymousAvatarUrl(seed: string): string {
  return `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
}
