'use client';
import { useState } from 'react';
import { Avatar, StarRating } from '@/components/ui/index';
import AnonymousAvatar from '@/components/ui/AnonymousAvatar';
import AnonymityToggle from '@/components/ui/AnonymityToggle';
import Button from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { timeAgo } from '@/lib/utils';
import { getDeviceId } from '@/lib/deviceId';
import type { IReview, IReviewRatings } from '@/types';
import toast from 'react-hot-toast';

// ─────────────────────────── ReviewCard ───────────────────────────────
export function ReviewCard({ review }: { review: IReview }) {
  const { isAnonymous, displayName, displayPhoto, overallRating, ratings, writtenReview, landlordResponse, moveInDate, moveOutDate, createdAt, _id } = review;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-card">
      <div className="flex items-start gap-3 mb-3">
        {isAnonymous ? <AnonymousAvatar seed={_id} size="md" /> : <Avatar src={displayPhoto} name={displayName ?? 'Student'} size="md" />}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-gray-900">{isAnonymous ? 'Anonymous' : displayName ?? 'Student'}</p>
            <StarRating value={overallRating} readonly size="sm" />
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            {moveInDate && `Tenant ${moveInDate}${moveOutDate ? ' – ' + moveOutDate : ''} · `}{timeAgo(createdAt)}
          </p>
        </div>
      </div>

      <p className="text-sm text-gray-700 leading-relaxed mb-3">{writtenReview}</p>

      {ratings && (
        <div className="grid grid-cols-2 gap-2 bg-gray-50 rounded-xl p-3 mb-3">
          {Object.entries({
            'Landlord': ratings.landlordResponsiveness, 'Water': ratings.waterSupply, 'Power': ratings.powerSupply,
            'Building': ratings.buildingCondition, 'Security': ratings.security, 'Value': ratings.valueForMoney,
          } as Record<string, number>).map(([label, val]) => val && (
            <div key={label} className="flex items-center justify-between text-xs">
              <span className="text-gray-500">{label}</span>
              <StarRating value={val} readonly size="sm" />
            </div>
          ))}
        </div>
      )}

      {landlordResponse && (
        <div className="bg-primary-light border-l-4 border-primary rounded-r-xl p-3 mt-3">
          <p className="text-xs font-bold text-primary-dark mb-1">Response from Owner</p>
          <p className="text-xs text-gray-700">{landlordResponse}</p>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────── ReviewForm ───────────────────────────────
interface ReviewFormState {
  overallRating: number;
  writtenReview: string;
  moveInDate: string;
  moveOutDate: string;
  isAnonymous: boolean;
  ratings: IReviewRatings;
}

const initialRatings: IReviewRatings = { landlordResponsiveness: 3, waterSupply: 3, powerSupply: 3, buildingCondition: 3, security: 3, valueForMoney: 3 };

export function ReviewForm({ listingId, onSuccess }: { listingId: string; onSuccess: (r: IReview) => void }) {
  const [form, setForm] = useState<ReviewFormState>({ overallRating: 0, writtenReview: '', moveInDate: '', moveOutDate: '', isAnonymous: false, ratings: { ...initialRatings } });
  const [loading, setLoading] = useState(false);

  const setRating = (key: keyof IReviewRatings, val: number) => setForm(f => ({ ...f, ratings: { ...f.ratings, [key]: val } }));

  const submit = async () => {
    if (!form.overallRating) return toast.error('Please select an overall rating');
    if (form.writtenReview.trim().length < 30) return toast.error('Review must be at least 30 characters');
    setLoading(true);
    try {
      const res = await fetch(`/api/listings/${listingId}/reviews`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, deviceId: getDeviceId() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success('Review posted successfully!');
      onSuccess(data.review);
      setForm({ overallRating: 0, writtenReview: '', moveInDate: '', moveOutDate: '', isAnonymous: false, ratings: { ...initialRatings } });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-card space-y-5">
      <h3 className="text-base font-bold text-gray-900">Write a Review</h3>

      <AnonymityToggle isAnonymous={form.isAnonymous} onChange={v => setForm(f => ({ ...f, isAnonymous: v }))} context="review" />

      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">Overall Rating</label>
        <StarRating value={form.overallRating} onChange={v => setForm(f => ({ ...f, overallRating: v }))} size="lg" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {([['landlordResponsiveness','Landlord'],['waterSupply','Water Supply'],['powerSupply','Power Supply'],['buildingCondition','Building'],['security','Security'],['valueForMoney','Value for Money']] as [keyof IReviewRatings, string][]).map(([key, label]) => (
          <div key={key}>
            <label className="text-xs text-gray-500 block mb-1">{label}</label>
            <StarRating value={form.ratings[key]} onChange={v => setRating(key, v)} size="sm" />
          </div>
        ))}
      </div>

      <Textarea label="Your Review" placeholder="Share your honest experience (minimum 30 characters)..." rows={4} value={form.writtenReview} onChange={e => setForm(f => ({ ...f, writtenReview: e.target.value }))} />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">Move-in Date</label>
          <input type="month" value={form.moveInDate} onChange={e => setForm(f => ({ ...f, moveInDate: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">Move-out Date</label>
          <input type="month" value={form.moveOutDate} onChange={e => setForm(f => ({ ...f, moveOutDate: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary" />
        </div>
      </div>

      <Button onClick={submit} loading={loading} className="w-full">Submit Review</Button>
      <p className="text-xs text-gray-400 text-center">You don&apos;t need an account to leave a review.</p>
    </div>
  );
}
