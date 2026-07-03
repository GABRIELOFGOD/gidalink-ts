'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ListingCard from '@/components/listings/ListingCard';
import RoommateCard from '@/components/roommates/RoommateCard';
import { Spinner } from '@/components/ui/index';
import { Search, ShieldCheck, MessageCircle, CreditCard, ArrowRight, GraduationCap, Users, EyeOff } from 'lucide-react';
import { UNIVERSITIES } from '@/lib/utils';
import type { IListing, IRoommateRequest } from '@/types';
import AirBNBLandingPage from '@/components/layout/AirBNBLandingPage';

function LandingPage() {
  const [search, setSearch]         = useState('');
  const [university, setUniversity] = useState('');
  const [listings, setListings]     = useState<IListing[]>([]);
  const [roommates, setRoommates]   = useState<IRoommateRequest[]>([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/listings?limit=6&sort=premium').then(r => r.json()),
      fetch('/api/roommates?limit=3').then(r => r.json()),
    ]).then(([lData, rData]) => {
      if (lData.success) setListings(lData.listings ?? []);
      if (rData.success) setRoommates(rData.requests ?? []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (university) params.set('nearbyUniversity', university);
    window.location.href = `/listings?${params.toString()}`;
  };

  const steps = [
    { icon: Search,        title: 'Search Your Campus', desc: 'Pick your university and instantly see hostels and apartments nearby, with honest student-reported conditions — drainage, water, power, the works.' },
    { icon: MessageCircle, title: 'Connect Directly',   desc: "Message the owner or agent directly. Stay anonymous if you'd rather not share your identity yet — your call, always." },
    { icon: CreditCard,    title: 'Move In Stress-Free', desc: 'Pay rent securely through GidaLink, skip the inflated agent fees, and settle into a home you actually trust.' },
  ];

  return (
    <div className="min-h-screen bg-brand-bg">
      <Navbar />

      {/* ───────── Hero ───────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          {/* PLACEHOLDER IMAGE 1: Nigerian students walking on/near a campus or hostel area.
              Search terms: "Nigerian university students campus walking", "African students outdoors hostel"
              Save as /public/images/hero-bg.jpg and this will render automatically. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1600&q=80" alt="Students on campus" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-linear-to-br from-primary-dark/95 via-primary/90 to-primary-mid/80" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-20 md:py-28 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 backdrop-blur rounded-full text-white/90 text-sm font-medium mb-6">
            <GraduationCap className="w-4 h-4" /> Built for students, starting in Ilorin
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-5 leading-tight">
            Your Campus.<br /><span className="text-accent">Your Home.</span>
          </h1>
          <p className="text-lg md:text-xl text-white/85 mb-10 max-w-2xl mx-auto leading-relaxed">
            Find honest hostel and apartment listings near your school — posted by real students, reviewed by real students. No agent fees, no stories.
          </p>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto bg-white p-2 rounded-2xl shadow-xl">
            <select value={university} onChange={e => setUniversity(e.target.value)} className="flex-1 px-4 py-3 rounded-xl text-gray-800 text-sm font-medium bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/30">
              <option value="">Choose your university</option>
              {UNIVERSITIES.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Area, street name..." className="w-full pl-9 pr-4 py-3 rounded-xl text-gray-800 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <button type="submit" className="px-6 py-3 bg-accent hover:bg-accent-dark text-white font-bold rounded-xl shadow transition-colors whitespace-nowrap">Search</button>
          </form>

          <div className="flex items-center justify-center gap-2 mt-5 text-white/70 text-xs">
            <EyeOff className="w-3.5 h-3.5" /> Post and review anonymously — your identity, your choice
          </div>
        </div>
      </section>

      {/* ───────── Stats ───────── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-3 gap-6 text-center">
          {[['Listings', '300+'], ['Students', '800+'], ['Campuses', '1 (Growing)']].map(([label, val]) => (
            <div key={label}><p className="text-2xl md:text-3xl font-black text-primary">{val}</p><p className="text-sm text-gray-500 mt-1">{label}</p></div>
          ))}
        </div>
      </section>

      {/* ───────── How it works ───────── */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-10 items-center mb-12">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-3">Searching for housing shouldn&apos;t feel like a hustle</h2>
            <p className="text-gray-500 leading-relaxed">Every year, thousands of Nigerian students get overcharged, misled, or scammed by housing agents who profit from information they should be sharing for free. GidaLink puts that power back where it belongs — with students.</p>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-xl">
            {/* PLACEHOLDER IMAGE 2: A student on phone/laptop searching for housing.
                Search terms: "African student laptop searching online", "student using phone apartment search"
                Save as /public/images/how-it-works.jpg */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80" alt="Student searching for housing" className="w-full h-72 object-cover" />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map(({ icon: Icon, title, desc }, i) => (
            <div key={i} className="relative bg-white rounded-2xl p-6 border border-gray-100 shadow-card hover:shadow-card-hover transition-shadow group">
              <div className="w-12 h-12 bg-primary-light rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary transition-colors">
                <Icon className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
              </div>
              <span className="absolute top-4 right-4 text-3xl font-black text-gray-100">{i + 1}</span>
              <h3 className="text-base font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───────── Trust section ───────── */}
      <section className="py-12 bg-primary-light">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            [ShieldCheck, 'Honest Listings', 'Every listing includes real student-reported conditions — drainage, water, power, security, building state.'],
            [EyeOff, 'Anonymous by Choice', 'Post listings and reviews anonymously if you prefer privacy. Switch your identity visibility anytime.'],
            [CreditCard, 'Secure Payments', 'Pay rent through Paystack-powered checkout. Every transaction is tracked with a receipt for both sides.'],
          ].map(([Icon, title, desc], i) => {
            const IconComp = Icon as React.ElementType;
            return (
              <div key={i} className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shrink-0"><IconComp className="w-5 h-5 text-white" /></div>
                <div><h3 className="font-bold text-gray-900 text-sm mb-1">{title as string}</h3><p className="text-xs text-gray-600 leading-relaxed">{desc as string}</p></div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ───────── Featured listings ───────── */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-gray-900">Latest Listings</h2>
            <p className="text-sm text-gray-500 mt-1">Honest hostels and apartments from real students and owners</p>
          </div>
          <Link href="/listings" className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark transition-colors">View all <ArrowRight className="w-4 h-4" /></Link>
        </div>

        {loading ? <div className="flex justify-center py-16"><Spinner size="lg" /></div> : listings.length === 0 ? (
          <div className="text-center py-16 text-gray-400"><p className="text-4xl mb-4">🏠</p><p className="font-medium">No listings yet. Be the first to post!</p></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map(l => <ListingCard key={l._id} listing={l} />)}
          </div>
        )}
      </section>

      {/* ───────── Roommate section ───────── */}
      <section className="py-16 px-4 bg-accent-light/40">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-10 items-center mb-10">
            <div className="rounded-2xl overflow-hidden shadow-xl order-2 md:order-1">
              {/* PLACEHOLDER IMAGE 3: Two or three students hanging out in a shared apartment.
                  Search terms: "African students roommates apartment together", "Nigerian students sharing flat"
                  Save as /public/images/roommates.jpg */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&q=80" alt="Students sharing an apartment" className="w-full h-72 object-cover" />
            </div>
            <div className="order-1 md:order-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent text-white text-xs font-bold rounded-full mb-3"><Users className="w-3.5 h-3.5" /> Roommate Board</div>
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-3">Splitting rent makes everything easier</h2>
              <p className="text-gray-500 leading-relaxed mb-5">Post what you&apos;re looking for — your budget, your area, your vibe — and find a student to share the cost of housing with. Already have a place? Mention it and invite someone in.</p>
              <Link href="/roommates" className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white text-sm font-bold rounded-xl hover:bg-accent-dark transition-colors">Browse Roommate Posts <ArrowRight className="w-4 h-4" /></Link>
            </div>
          </div>

          {roommates.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {roommates.map(r => <RoommateCard key={r._id} request={r} />)}
            </div>
          )}
        </div>
      </section>

      {/* ───────── Testimonial-style CTA ───────── */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-10 items-center bg-white rounded-3xl shadow-card overflow-hidden border border-gray-100">
          <div className="p-10">
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-3">Found a place you love?</h2>
            <p className="text-gray-500 mb-7 leading-relaxed">Help the next student avoid the guesswork. Tell them what it&apos;s really like — the good, the bad, all of it.</p>
            <Link href="/listings" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors shadow-md">Leave a Review <ArrowRight className="w-4 h-4" /></Link>
          </div>
          <div className="h-64 md:h-full">
            {/* PLACEHOLDER IMAGE 4: Smiling Nigerian student holding keys or pointing at a building.
                Search terms: "happy African student new apartment keys", "Nigerian student smiling new home"
                Save as /public/images/testimonial.jpg */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80" alt="Happy student" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}


export default function HomePage() {
  // return <LandingPage />;
  return <AirBNBLandingPage />;
}