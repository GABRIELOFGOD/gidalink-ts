'use client';
import { useState } from 'react';
import Button from '@/components/ui/Button';
import { SlidersHorizontal, X } from 'lucide-react';
import {
  APARTMENT_TYPES, WATER_SUPPLY_OPTIONS, POWER_SUPPLY_OPTIONS, CONDITION_RATINGS,
  FURNISHING_OPTIONS, AVAILABILITY_OPTIONS, NIGERIAN_STATES, UNIVERSITIES, LISTING_TYPES,
} from '@/lib/utils';

export interface ListingFiltersState {
  minRent?: string;
  maxRent?: string;
  listingType?: string;
  apartmentType?: string;
  nearbyUniversity?: string;
  state?: string;
  availability?: string;
  waterSupply?: string;
  powerSupply?: string;
  condition?: string;
  furnishing?: string;
}

interface Props {
  filters: ListingFiltersState;
  onChange: (f: ListingFiltersState) => void;
  onReset: () => void;
}

function FilterContent({ filters, set, onReset }: { filters: ListingFiltersState; set: (k: keyof ListingFiltersState, v: string) => void; onReset: () => void }) {
  return (
    <div className="space-y-5">
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nearby University</label>
        <select value={filters.nearbyUniversity ?? ''} onChange={e => set('nearbyUniversity', e.target.value)} className="mt-2 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white">
          <option value="">Any University</option>
          {UNIVERSITIES.map(u => <option key={u} value={u}>{u}</option>)}
        </select>
      </div>

      <div>
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Listing Type</label>
        <select value={filters.listingType ?? ''} onChange={e => set('listingType', e.target.value)} className="mt-2 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white">
          <option value="">All Types</option>
          {LISTING_TYPES.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
        </select>
      </div>

      <div>
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Price Range (₦/yr)</label>
        <div className="flex gap-2 mt-2">
          <input type="number" placeholder="Min" value={filters.minRent ?? ''} onChange={e => set('minRent', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
          <input type="number" placeholder="Max" value={filters.maxRent ?? ''} onChange={e => set('maxRent', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Apartment Type</label>
        <select value={filters.apartmentType ?? ''} onChange={e => set('apartmentType', e.target.value)} className="mt-2 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white">
          <option value="">All Types</option>
          {APARTMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div>
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">State</label>
        <select value={filters.state ?? ''} onChange={e => set('state', e.target.value)} className="mt-2 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white">
          <option value="">All States</option>
          {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div>
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Availability</label>
        <select value={filters.availability ?? ''} onChange={e => set('availability', e.target.value)} className="mt-2 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white">
          <option value="">Any</option>
          {AVAILABILITY_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>

      <div>
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Water Supply</label>
        <select value={filters.waterSupply ?? ''} onChange={e => set('waterSupply', e.target.value)} className="mt-2 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white">
          <option value="">Any</option>
          {WATER_SUPPLY_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>

      <div>
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Power Supply</label>
        <select value={filters.powerSupply ?? ''} onChange={e => set('powerSupply', e.target.value)} className="mt-2 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white">
          <option value="">Any</option>
          {POWER_SUPPLY_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>

      <div>
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Building Condition</label>
        <select value={filters.condition ?? ''} onChange={e => set('condition', e.target.value)} className="mt-2 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white">
          <option value="">Any</option>
          {CONDITION_RATINGS.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>

      <div>
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Furnishing</label>
        <select value={filters.furnishing ?? ''} onChange={e => set('furnishing', e.target.value)} className="mt-2 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white">
          <option value="">Any</option>
          {FURNISHING_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>

      <Button variant="secondary" size="sm" onClick={onReset} className="w-full"><X className="w-4 h-4" /> Clear Filters</Button>
    </div>
  );
}

export default function ListingFilters({ filters, onChange, onReset }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const set = (key: keyof ListingFiltersState, val: string) => onChange({ ...filters, [key]: val });

  return (
    <>
      <div className="lg:hidden mb-4">
        <Button variant="outline" size="sm" onClick={() => setMobileOpen(!mobileOpen)}><SlidersHorizontal className="w-4 h-4" /> {mobileOpen ? 'Hide' : 'Show'} Filters</Button>
      </div>

      <aside className="hidden lg:block w-64 flex-shrink-0">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-card sticky top-20">
          <h3 className="text-sm font-bold text-gray-900 mb-5">Filter Listings</h3>
          <FilterContent filters={filters} set={set} onReset={onReset} />
        </div>
      </aside>

      {mobileOpen && (
        <div className="lg:hidden bg-white rounded-2xl border border-gray-100 p-5 shadow-card mb-4">
          <FilterContent filters={filters} set={set} onReset={onReset} />
        </div>
      )}
    </>
  );
}
