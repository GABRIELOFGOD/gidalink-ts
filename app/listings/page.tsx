'use client';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ListingCard from '@/components/listings/ListingCard';
import ListingFilters, { type ListingFiltersState } from '@/components/listings/ListingFilters';
import { Spinner } from '@/components/ui/index';
import { Search, Map as MapIcon, List, ChevronLeft, ChevronRight } from 'lucide-react';
import { UNIVERSITY_COORDINATES } from '@/lib/utils';
import type { IListing, PaginationMeta } from '@/types';

const MapView = dynamic(() => import('@/components/listings/MapView'), { ssr: false });

function ListingsContent() {
  const searchParams = useSearchParams();
  const [listings, setListings] = useState<IListing[]>([]);
  const [pagination, setPag]    = useState<PaginationMeta>({ page: 1, limit: 12, pages: 1, total: 0 });
  const [loading, setLoading]   = useState(true);
  const [view, setView]         = useState<'list' | 'map'>('list');
  const [search, setSearch]     = useState(searchParams.get('search') ?? '');
  const [sort, setSort]         = useState('premium');
  const [filters, setFilters]   = useState<ListingFiltersState>({ nearbyUniversity: searchParams.get('nearbyUniversity') ?? '' });
  const [page, setPage]         = useState(1);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '12');
      params.set('sort', sort);
      if (search) params.set('search', search);
      Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });

      const res = await fetch(`/api/listings?${params}`);
      const data = await res.json();
      if (data.success) { setListings(data.listings); setPag(data.pagination); }
    } catch {} finally { setLoading(false); }
  }, [page, sort, search, filters]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); fetchListings(); };

  const mapCenter = filters.nearbyUniversity && UNIVERSITY_COORDINATES[filters.nearbyUniversity]
    ? UNIVERSITY_COORDINATES[filters.nearbyUniversity] : undefined;

  return (
    <div className="min-h-screen bg-brand-bg">
      <Navbar />

      <div className="bg-white border-b border-gray-100 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by area, street, university..." className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
            </div>
            <button type="submit" className="px-5 py-3 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-colors">Search</button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-8">
          <ListingFilters filters={filters} onChange={f => { setFilters(f); setPage(1); }} onReset={() => { setFilters({}); setPage(1); }} />

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <p className="text-sm text-gray-500">{loading ? 'Searching…' : <><span className="font-semibold text-gray-900">{pagination.total}</span> listings found</>}</p>
              <div className="flex items-center gap-3">
                <select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white">
                  <option value="premium">Featured First</option>
                  <option value="newest">Newest</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
                <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                  <button onClick={() => setView('list')} className={`px-3 py-2 transition-colors ${view === 'list' ? 'bg-primary text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}><List className="w-4 h-4" /></button>
                  <button onClick={() => setView('map')} className={`px-3 py-2 transition-colors ${view === 'map' ? 'bg-primary text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}><MapIcon className="w-4 h-4" /></button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-24"><Spinner size="lg" /></div>
            ) : listings.length === 0 ? (
              <div className="text-center py-24 text-gray-400"><p className="text-5xl mb-4">🔍</p><p className="font-semibold text-gray-600">No listings match your search</p><p className="text-sm mt-1">Try adjusting your filters or search terms</p></div>
            ) : view === 'map' ? (
              <MapView listings={listings} center={mapCenter} zoom={mapCenter ? 14 : 13} height="600px" />
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {listings.map(l => <ListingCard key={l._id} listing={l} />)}
                </div>
                {pagination.pages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-2 rounded-lg border border-gray-200 text-gray-500 disabled:opacity-40 hover:bg-gray-50 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                    <span className="text-sm text-gray-600 px-3">Page {page} of {pagination.pages}</span>
                    <button disabled={page === pagination.pages} onClick={() => setPage(p => p + 1)} className="p-2 rounded-lg border border-gray-200 text-gray-500 disabled:opacity-40 hover:bg-gray-50 transition-colors"><ChevronRight className="w-4 h-4" /></button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function ListingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-brand-bg flex items-center justify-center"><Spinner size="lg" /></div>}>
      <ListingsContent />
    </Suspense>
  );
}
