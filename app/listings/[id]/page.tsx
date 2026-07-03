'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PhotoGallery from '@/components/listings/PhotoGallery';
import { ReviewCard, ReviewForm } from '@/components/reviews/ReviewCard';
import NearbyListings from '@/components/listings/NearbyListings';
import BookmarkButton from '@/components/listings/BookmarkButton';
import { Badge, Avatar, Spinner, Modal } from '@/components/ui/index';
import AnonymousAvatar from '@/components/ui/AnonymousAvatar';
import Button from '@/components/ui/Button';
import { useAuth } from '@/lib/AuthContext';
import { formatCurrency, formatDate, timeAgo } from '@/lib/utils';
import {
  MapPin, Droplets, Zap, Shield, Sofa, Calendar, Star, Crown, MessageCircle, Phone,
  Flag, Eye, CreditCard, Send, GraduationCap, EyeOff,
} from 'lucide-react';
import type { IListing, IReview } from '@/types';
import toast from 'react-hot-toast';

const MapView = dynamic(() => import('@/components/listings/MapView'), { ssr: false });

const conditionColors: Record<string, 'red' | 'yellow' | 'green'> = { Poor: 'red', Fair: 'yellow', Good: 'green', Excellent: 'green' };
const statusColors: Record<string, 'green' | 'red' | 'yellow'> = { Available: 'green', Taken: 'red', 'Available Soon': 'yellow' };
const roleColors: Record<string, 'blue' | 'green' | 'orange'> = { student: 'blue', hostel_owner: 'green', agent: 'orange' };

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [listing, setListing] = useState<IListing | null>(null);
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [reviewsPerPage] = useState(5);
  const [displayedReviewsCount, setDisplayedReviewsCount] = useState(5);
  const [loading, setLoading] = useState(true);
  const [showPhone, setShowPhone] = useState(false);
  const [flagModal, setFlagModal] = useState(false);
  const [flagReason, setFlagReason] = useState('');
  const [messaging, setMessaging] = useState(false);
  const [boostModal, setBoostModal] = useState(false);
  const [payModal, setPayModal] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [paying, setPaying] = useState(false);
  const [boosting, setBoosting] = useState(false);
  const [togglingAnon, setTogglingAnon] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [lRes, rRes] = await Promise.all([fetch(`/api/listings/${id}`), fetch(`/api/listings/${id}/reviews`)]);
      const lData = await lRes.json();
      const rData = await rRes.json();
      if (lRes.ok) setListing(lData.listing);
      if (rRes.ok) setReviews(rData.reviews ?? []);
    } catch { } finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <div className="min-h-screen bg-brand-bg flex items-center justify-center"><Spinner size="lg" /></div>;
  if (!listing) return (
    <div className="min-h-screen bg-brand-bg">
      <Navbar />
      <div className="text-center py-24 text-gray-400"><p className="text-5xl mb-4">🏠</p><p className="font-semibold text-gray-600">Listing not found</p><Link href="/listings" className="text-primary font-semibold hover:underline text-sm mt-4 block">← Back to Listings</Link></div>
      <Footer />
    </div>
  );

  const isOwner = !!(user && listing.creator?._id === user._id);
  const userReviewed = reviews.some(r => !r.isAnonymous && r.displayName === user?.name); // soft check; true gate is device-based server-side

  const handleMessage = async () => {
    if (!user) return router.push(`/login?redirect=/listings/${id}`);
    if (!listing.creator) return toast.error('This listing is anonymous — messaging is unavailable.');
    setMessaging(true);
    try {
      const res = await fetch('/api/conversations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ recipientId: listing.creator._id, listingId: listing._id }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      router.push(`/dashboard/messages/${data.conversation._id}`);
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed'); } finally { setMessaging(false); }
  };

  const handleFlag = async () => {
    try {
      const res = await fetch(`/api/listings/${id}/flag`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason: flagReason }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success('Listing reported. Thank you.');
      setFlagModal(false);
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed'); }
  };

  const handleBoost = async (days: number) => {
    setBoosting(true);
    try {
      const res = await fetch(`/api/listings/${id}/boost`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ days }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      window.location.href = data.authorizationUrl;
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed'); } finally { setBoosting(false); }
  };

  const handlePay = async () => {
    if (!payAmount || Number(payAmount) <= 0) return toast.error('Enter a valid amount');
    if (!listing.creator) return toast.error('Cannot pay an anonymous listing directly — message them first.');
    setPaying(true);
    try {
      const res = await fetch('/api/payments/initialize', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ listingId: listing._id, recipientId: listing.creator._id, amount: Number(payAmount) }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      window.location.href = data.authorizationUrl;
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed'); } finally { setPaying(false); }
  };

  const toggleAnonymity = async () => {
    setTogglingAnon(true);
    try {
      const res = await fetch(`/api/listings/${id}/anonymity`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isAnonymous: !listing.isAnonymous }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success(data.message);
      fetchData();
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed'); } finally { setTogglingAnon(false); }
  };

  return (
    <div className="min-h-screen bg-brand-bg">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="text-sm text-gray-400 mb-4"><Link href="/listings" className="hover:text-primary">Listings</Link> / <span className="text-gray-600">{listing.area}</span></div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <PhotoGallery photos={listing.photos} />

            <div>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Badge variant="indigo">{listing.apartmentType}</Badge>
                    <Badge variant={statusColors[listing.availabilityStatus]}>{listing.availabilityStatus}</Badge>
                    {listing.isPremium && <span className="flex items-center gap-1 px-2.5 py-0.5 bg-accent text-white text-xs font-bold rounded-full"><Crown className="w-3 h-3" /> Featured</span>}
                    {listing.isAnonymous && <Badge variant="gray"><EyeOff className="w-3 h-3" /> Anonymous</Badge>}
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900">{listing.title}</h1>
                  <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-2"><MapPin className="w-4 h-4 text-primary" />{listing.streetAddress}, {listing.area}, {listing.lga}, {listing.state}</div>
                  {listing.nearbyUniversity && <div className="flex items-center gap-1.5 text-sm text-primary mt-1 font-medium"><GraduationCap className="w-4 h-4" />{listing.nearbyUniversity}{listing.distanceFromCampus && ` · ${listing.distanceFromCampus}`}</div>}
                </div>
                <div className="flex items-center gap-2">
                  <BookmarkButton listingId={listing._id} size="lg" />
                  {!isOwner && <button onClick={() => setFlagModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Flag className="w-3.5 h-3.5" /> Report</button>}
                </div>
              </div>

              <div className="flex items-center gap-4 mt-4 text-xs text-gray-400 flex-wrap">
                <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {listing.views} views</span>
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Listed {timeAgo(listing.createdAt)}</span>
                {listing.averageRating > 0 && <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" /> {listing.averageRating.toFixed(1)} ({listing.reviewCount} reviews)</span>}
                {listing.roomType && <Badge variant="indigo">{listing.roomType}</Badge>}
                {listing.genderPolicy && <Badge variant="orange">{listing.genderPolicy}</Badge>}
              </div>

              {listing.studentAmenities && listing.studentAmenities.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {listing.studentAmenities.map(a => <span key={a} className="text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">{a}</span>)}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-card">
              <h2 className="text-base font-bold text-gray-900 mb-4">Apartment Conditions</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <ConditionItem icon={Droplets} label="Drainage" value={listing.drainageCondition} color={conditionColors[listing.drainageCondition]} />
                <ConditionItem icon={Droplets} label="Water Supply" value={listing.waterSupply?.join(', ') || 'N/A'} />
                <ConditionItem icon={Zap} label="Power Supply" value={listing.powerSupply?.join(', ') || 'N/A'} />
                <ConditionItem icon={Shield} label="Building" value={listing.buildingCondition} color={conditionColors[listing.buildingCondition]} />
                <ConditionItem icon={Shield} label="Security" value={listing.securityType?.join(', ') || 'N/A'} />
                <ConditionItem icon={Sofa} label="Furnishing" value={listing.furnishingStatus} />
              </div>
            </div>

            {listing.additionalNotes && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-card">
                <h2 className="text-base font-bold text-gray-900 mb-2">Additional Notes</h2>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{listing.additionalNotes}</p>
              </div>
            )}

            {listing.coordinates?.lat && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-card">
                <h2 className="text-base font-bold text-gray-900 mb-4">Location</h2>
                <MapView listings={[listing]} center={[listing.coordinates.lat, listing.coordinates.lng]} zoom={15} height="320px" />
              </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-card">
              <NearbyListings listingId={listing._id} />
            </div>

            <div>
              <div className="flex items-center justify-between mb-4"><h2 className="text-base font-bold text-gray-900">Reviews ({reviews.length})</h2></div>
              {!isOwner && !userReviewed && <div className="mb-4"><ReviewForm listingId={listing._id} onSuccess={r => { setReviews(prev => [r, ...prev]); fetchData(); }} /></div>}
              {reviews.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-2xl border border-gray-100"><p className="text-gray-400 text-sm">No reviews yet. Be the first to share your experience.</p></div>
              ) : (
                <>
                  <div className="space-y-4">{reviews.slice(0, displayedReviewsCount).map(r => <ReviewCard key={r._id} review={r} />)}</div>
                  {displayedReviewsCount < reviews.length && (
                    <button onClick={() => setDisplayedReviewsCount(prev => prev + reviewsPerPage)} className="w-full mt-4 py-3 text-sm font-semibold text-primary hover:bg-primary-light rounded-lg transition-colors border border-primary-light">
                      Load More Reviews ({displayedReviewsCount} of {reviews.length})
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-card sticky top-20">
              <p className="text-3xl font-black text-gray-900">{formatCurrency(listing.annualRent)}</p>
              <p className="text-sm text-gray-400 mb-5">per year · {formatCurrency(listing.monthlyRent ?? Math.round(listing.annualRent / 12))}/month</p>

              {listing.agencyFee && <p className="text-xs text-orange-600 bg-orange-50 px-3 py-2 rounded-lg mb-4">Agency Fee: {listing.agencyFee}</p>}

              {!isOwner && (
                <div className="space-y-2">
                  <Button onClick={handleMessage} loading={messaging} className="w-full" disabled={!listing.creator}><MessageCircle className="w-4 h-4" /> {listing.creator ? `Message ${listing.creator.role === 'agent' ? 'Agent' : 'Owner'}` : 'Anonymous Listing'}</Button>
                  {listing.creator?.phone && <Button variant="outline" className="w-full" onClick={() => setShowPhone(true)}><Phone className="w-4 h-4" /> {showPhone ? listing.creator.phone : 'Show Phone Number'}</Button>}
                  {user && listing.creator && <Button variant="secondary" className="w-full" onClick={() => { setPayAmount(String(listing.annualRent)); setPayModal(true); }}><CreditCard className="w-4 h-4" /> Pay Rent</Button>}
                </div>
              )}

              {isOwner && (
                <div className="space-y-2">
                  <Link href={`/dashboard/listings/${listing._id}/edit`}><Button variant="outline" className="w-full">Edit Listing</Button></Link>
                  <Button variant="secondary" className="w-full" onClick={() => setBoostModal(true)}><Crown className="w-4 h-4 text-accent" /> Boost This Listing</Button>
                  <Button variant={listing.isAnonymous ? 'primary' : 'ghost'} className="w-full" onClick={toggleAnonymity} loading={togglingAnon}>
                    <EyeOff className="w-4 h-4" /> {listing.isAnonymous ? 'Reveal My Identity' : 'Make Anonymous'}
                  </Button>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-card">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Listed By</h3>
              {listing.isAnonymous || !listing.creator ? (
                <div className="flex items-center gap-3">
                  <AnonymousAvatar seed={listing._id} size="lg" />
                  <div><p className="font-semibold text-gray-900 text-sm">Anonymous</p><p className="text-xs text-gray-400">Identity hidden for privacy</p></div>
                </div>
              ) : (
                <Link href={`/dashboard`} className="flex items-center gap-3">
                  <Avatar src={listing.creator.profilePhoto} name={listing.creator.name} size="lg" />
                  <div><p className="font-semibold text-gray-900 text-sm">{listing.creator.name}</p><Badge variant={roleColors[listing.creator.role] ?? 'gray'} className="capitalize mt-1">{listing.creator.role.replace('_', ' ')}</Badge></div>
                </Link>
              )}
              {!listing.isAnonymous && listing.creator?.bio && <p className="text-xs text-gray-500 mt-3 leading-relaxed">{listing.creator.bio}</p>}
              {!listing.isAnonymous && listing.creator && <p className="text-xs text-gray-400 mt-3">Member since {formatDate(listing.creator.createdAt)}</p>}
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={flagModal} onClose={() => setFlagModal(false)} title="Report Listing">
        <p className="text-sm text-gray-500 mb-4">Tell us why you&apos;re reporting this listing.</p>
        <textarea value={flagReason} onChange={e => setFlagReason(e.target.value)} rows={3} placeholder="e.g. Inaccurate information, fake listing, scam..." className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary mb-4" />
        <Button onClick={handleFlag} variant="danger" className="w-full">Submit Report</Button>
      </Modal>

      <Modal isOpen={boostModal} onClose={() => setBoostModal(false)} title="Boost This Listing">
        <p className="text-sm text-gray-500 mb-5">Get your listing seen first. Choose a boost duration:</p>
        <div className="space-y-3">
          {[[7, 2500], [14, 4500], [30, 9000]].map(([days, price]) => (
            <button key={days} onClick={() => handleBoost(days)} disabled={boosting} className="w-full flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-primary hover:bg-primary-light transition-all disabled:opacity-50">
              <div className="text-left"><p className="font-bold text-gray-900">{days} Days</p><p className="text-xs text-gray-400">Top of search results</p></div>
              <p className="font-bold text-primary">{formatCurrency(price)}</p>
            </button>
          ))}
        </div>
      </Modal>

      <Modal isOpen={payModal} onClose={() => setPayModal(false)} title="Pay Rent">
        <p className="text-sm text-gray-500 mb-4">You&apos;re paying {listing.creator?.name} for &quot;{listing.title}&quot;. A 10% platform fee applies.</p>
        <label className="text-sm font-medium text-gray-700 mb-1.5 block">Amount (₦)</label>
        <input type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary mb-2" />
        {Number(payAmount) > 0 && (
          <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-500 mb-4 space-y-1">
            <div className="flex justify-between"><span>Platform fee (10%)</span><span>{formatCurrency(Math.round(Number(payAmount) * 0.1))}</span></div>
            <div className="flex justify-between font-semibold text-gray-700"><span>Owner receives</span><span>{formatCurrency(Math.round(Number(payAmount) * 0.9))}</span></div>
          </div>
        )}
        <Button onClick={handlePay} loading={paying} className="w-full"><Send className="w-4 h-4" /> Proceed to Payment</Button>
      </Modal>

      <Footer />
    </div>
  );
}

function ConditionItem({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string; color?: 'red' | 'yellow' | 'green' }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="w-9 h-9 bg-primary-light rounded-lg flex items-center justify-center flex-shrink-0"><Icon className="w-4 h-4 text-primary" /></div>
      <div><p className="text-xs text-gray-400">{label}</p>{color ? <Badge variant={color} className="mt-0.5">{value}</Badge> : <p className="text-sm font-semibold text-gray-800">{value}</p>}</div>
    </div>
  );
}
