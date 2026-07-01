'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useAuth } from '@/lib/AuthContext';
import { Input, Select, Textarea } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import AnonymityToggle from '@/components/ui/AnonymityToggle';
import { Upload, X, MapPinned, Loader2 } from 'lucide-react';
import {
  APARTMENT_TYPES, NIGERIAN_STATES, WATER_SUPPLY_OPTIONS, POWER_SUPPLY_OPTIONS,
  SECURITY_OPTIONS, CONDITION_RATINGS, FURNISHING_OPTIONS, AVAILABILITY_OPTIONS,
  LISTING_TYPES, ROOM_TYPES, GENDER_POLICIES, STUDENT_AMENITIES, UNIVERSITIES,
  UNIVERSITY_COORDINATES,
} from '@/lib/utils';
import type { IListing } from '@/types';
import toast from 'react-hot-toast';

const MapView = dynamic(() => import('@/components/listings/MapView'), { ssr: false });

interface FormState {
  title: string;
  listingType: string;
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
  annualRent: string;
  drainageCondition: string;
  waterSupply: string[];
  powerSupply: string[];
  buildingCondition: string;
  securityType: string[];
  furnishingStatus: string;
  availabilityStatus: string;
  additionalNotes: string;
  photos: string[];
  agencyFee: string;
  isAnonymous: boolean;
}

const emptyForm: FormState = {
  title: '', listingType: 'hostel', apartmentType: '', nearbyUniversity: '', distanceFromCampus: '',
  roomType: '', genderPolicy: '', studentAmenities: [], streetAddress: '', area: '', lga: '', state: '',
  coordinates: null, annualRent: '', drainageCondition: '', waterSupply: [], powerSupply: [],
  buildingCondition: '', securityType: [], furnishingStatus: '', availabilityStatus: 'Available',
  additionalNotes: '', photos: [], agencyFee: '', isAnonymous: false,
};

interface Props {
  initialData?: Partial<IListing> | null;
  listingId?: string | null;
}

export default function ListingForm({ initialData = null, listingId = null }: Props) {
  const router = useRouter();
  const { user } = useAuth();

  const [form, setForm] = useState<FormState>(() => {
    if (!initialData) return emptyForm;
    return {
      ...emptyForm,
      ...initialData,
      annualRent: initialData.annualRent ? String(initialData.annualRent) : '',
      studentAmenities: initialData.studentAmenities ?? [],
      waterSupply: initialData.waterSupply ?? [],
      powerSupply: initialData.powerSupply ?? [],
      securityType: initialData.securityType ?? [],
      photos: initialData.photos ?? [],
      coordinates: initialData.coordinates ?? null,
    } as FormState;
  });
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [uploading, setUploading]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [locating, setLocating]     = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof FormState>(key: K, val: FormState[K]) => setForm(f => ({ ...f, [key]: val }));
  const toggleArr = (key: 'waterSupply' | 'powerSupply' | 'securityType' | 'studentAmenities', val: string) =>
    setForm(f => ({ ...f, [key]: f[key].includes(val) ? f[key].filter(v => v !== val) : [...f[key], val] }));

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (form.photos.length + photoFiles.length + files.length > 10) return toast.error('Maximum 10 photos allowed');
    setPhotoFiles(prev => [...prev, ...files]);
  };

  const uploadPhotos = async (): Promise<string[]> => {
    if (photoFiles.length === 0) return form.photos;
    setUploading(true);
    try {
      const formData = new FormData();
      photoFiles.forEach(f => formData.append('files', f));
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return [...form.photos, ...data.files.map((f: { url: string }) => f.url)];
    } finally { setUploading(false); }
  };

  const removeExistingPhoto = (url: string) => setForm(f => ({ ...f, photos: f.photos.filter(p => p !== url) }));
  const removeNewPhoto = (i: number) => setPhotoFiles(prev => prev.filter((_, idx) => idx !== i));

  // University select → auto-fill map center
  const handleUniversitySelect = (uni: string) => {
    set('nearbyUniversity', uni);
  };

  const detectLocation = () => {
    if (!navigator.geolocation) return toast.error('Geolocation not supported by your browser');
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      pos => { set('coordinates', { lat: pos.coords.latitude, lng: pos.coords.longitude }); setLocating(false); toast.success('Location captured'); },
      () => { setLocating(false); toast.error('Could not detect location. You can still post without it, or click the map below.'); }
    );
  };

  const mapCenter: [number, number] | undefined =
    form.coordinates ? [form.coordinates.lat, form.coordinates.lng]
    : form.nearbyUniversity && UNIVERSITY_COORDINATES[form.nearbyUniversity] ? UNIVERSITY_COORDINATES[form.nearbyUniversity]
    : undefined;

  const validate = (): string | null => {
    const required: (keyof FormState)[] = ['title','apartmentType','streetAddress','area','lga','state','annualRent','drainageCondition','buildingCondition','furnishingStatus'];
    for (const f of required) if (!form[f]) return `Please fill in: ${f}`;
    if (form.photos.length + photoFiles.length === 0) return 'At least one photo is required';
    return null;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) return toast.error(err);

    setSubmitting(true);
    try {
      const allPhotos = await uploadPhotos();
      const payload = { ...form, photos: allPhotos, annualRent: Number(form.annualRent) };

      const url = listingId ? `/api/listings/${listingId}` : '/api/listings';
      const method = listingId ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success(listingId ? 'Listing updated!' : 'Listing posted successfully!');
      router.push('/dashboard/listings');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6 max-w-3xl">
      <Section title="Posting Identity">
        <AnonymityToggle isAnonymous={form.isAnonymous} onChange={v => set('isAnonymous', v)} context="listing" />
        {!user && <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">You&apos;re posting without an account. We&apos;ll only be able to identify this listing by your device. Consider creating a free account to manage your listings later.</p>}
      </Section>

      <Section title="Basic Information">
        <Input label="Listing Title" placeholder="e.g. Cozy Self-Contain Near UNILORIN Main Gate" required value={form.title} onChange={e => set('title', e.target.value)} />
        <div className="grid grid-cols-2 gap-4">
          <Select label="Listing Type" value={form.listingType} onChange={e => set('listingType', e.target.value)}>
            {LISTING_TYPES.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
          </Select>
          <Select label="Apartment Type" required value={form.apartmentType} onChange={e => set('apartmentType', e.target.value)}>
            <option value="">Select type</option>
            {APARTMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </Select>
        </div>
        <Input label="Annual Rent (₦)" type="number" placeholder="e.g. 150000" required value={form.annualRent} onChange={e => set('annualRent', e.target.value)} />
      </Section>

      <Section title="Student-Specific Details">
        <Select label="Nearby University" value={form.nearbyUniversity} onChange={e => handleUniversitySelect(e.target.value)}>
          <option value="">Not specific to a university</option>
          {UNIVERSITIES.map(u => <option key={u} value={u}>{u}</option>)}
        </Select>
        {form.nearbyUniversity && <p className="text-xs text-primary -mt-2">📍 Map below will center on this university — pin the exact location by clicking it.</p>}

        <div className="grid grid-cols-2 gap-4">
          <Input label="Distance from Campus" placeholder="e.g. 5 mins walk, 10 mins drive" value={form.distanceFromCampus} onChange={e => set('distanceFromCampus', e.target.value)} />
          <Select label="Room Type" value={form.roomType} onChange={e => set('roomType', e.target.value)}>
            <option value="">Select</option>
            {ROOM_TYPES.map(r => <option key={r} value={r}>{r}</option>)}
          </Select>
        </div>

        <Select label="Gender Policy" value={form.genderPolicy} onChange={e => set('genderPolicy', e.target.value)}>
          <option value="">Not specified</option>
          {GENDER_POLICIES.map(g => <option key={g} value={g}>{g}</option>)}
        </Select>

        <MultiCheckGroup label="Student Amenities" options={[...STUDENT_AMENITIES]} selected={form.studentAmenities} onToggle={v => toggleArr('studentAmenities', v)} />
      </Section>

      <Section title="Location">
        <Input label="Street Address" placeholder="e.g. 12 Unity Road" required value={form.streetAddress} onChange={e => set('streetAddress', e.target.value)} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Area / Neighbourhood" placeholder="e.g. Tanke, Sabo" required value={form.area} onChange={e => set('area', e.target.value)} />
          <Input label="Local Government Area" placeholder="e.g. Ilorin South" required value={form.lga} onChange={e => set('lga', e.target.value)} />
        </div>
        <Select label="State" required value={form.state} onChange={e => set('state', e.target.value)}>
          <option value="">Select state</option>
          {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
        </Select>

        <button type="button" onClick={detectLocation} disabled={locating} className="flex items-center gap-2 text-sm font-semibold text-primary hover:underline disabled:opacity-50">
          {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPinned className="w-4 h-4" />}
          {form.coordinates ? 'Location captured ✓ (click to recapture)' : 'Auto-detect my location (optional)'}
        </button>

        <div className="pt-2">
          <p className="text-xs text-gray-500 mb-2">{form.nearbyUniversity ? 'Map centered on your selected university — click anywhere to drop your exact pin.' : 'Select a university above, or click the map to drop a pin manually.'}</p>
          <MapView
            center={mapCenter}
            zoom={form.nearbyUniversity ? 14 : 13}
            height="320px"
            onLocationPick={(lat, lng) => set('coordinates', { lat, lng })}
          />
        </div>
      </Section>

      <Section title="Apartment Conditions">
        <div className="grid grid-cols-2 gap-4">
          <Select label="Drainage Condition" required value={form.drainageCondition} onChange={e => set('drainageCondition', e.target.value)}>
            <option value="">Select</option>
            {CONDITION_RATINGS.map(o => <option key={o} value={o}>{o}</option>)}
          </Select>
          <Select label="Building Condition" required value={form.buildingCondition} onChange={e => set('buildingCondition', e.target.value)}>
            <option value="">Select</option>
            {CONDITION_RATINGS.map(o => <option key={o} value={o}>{o}</option>)}
          </Select>
        </div>

        <MultiCheckGroup label="Water Supply" options={[...WATER_SUPPLY_OPTIONS]} selected={form.waterSupply} onToggle={v => toggleArr('waterSupply', v)} />
        <MultiCheckGroup label="Power Supply" options={[...POWER_SUPPLY_OPTIONS]} selected={form.powerSupply} onToggle={v => toggleArr('powerSupply', v)} />
        <MultiCheckGroup label="Security / Compound Type" options={[...SECURITY_OPTIONS]} selected={form.securityType} onToggle={v => toggleArr('securityType', v)} />

        <div className="grid grid-cols-2 gap-4">
          <Select label="Furnishing Status" required value={form.furnishingStatus} onChange={e => set('furnishingStatus', e.target.value)}>
            <option value="">Select</option>
            {FURNISHING_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </Select>
          <Select label="Availability Status" value={form.availabilityStatus} onChange={e => set('availabilityStatus', e.target.value)}>
            {AVAILABILITY_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </Select>
        </div>

        <Textarea label="Additional Notes" rows={4} placeholder="Anything else prospective students should know..." value={form.additionalNotes} onChange={e => set('additionalNotes', e.target.value)} />

        {user?.role === 'agent' && (
          <Input label="Agency Fee (optional, disclosed)" placeholder="e.g. ₦20,000 or 10% of annual rent" value={form.agencyFee} onChange={e => set('agencyFee', e.target.value)} />
        )}
      </Section>

      <Section title="Photos (1–10 required)">
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {form.photos.map((url, i) => (
            <div key={`existing-${i}`} className="relative aspect-square rounded-xl overflow-hidden group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button type="button" onClick={() => removeExistingPhoto(url)} className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
            </div>
          ))}
          {photoFiles.map((file, i) => (
            <div key={`new-${i}`} className="relative aspect-square rounded-xl overflow-hidden group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
              <button type="button" onClick={() => removeNewPhoto(i)} className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
            </div>
          ))}
          {form.photos.length + photoFiles.length < 10 && (
            <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-primary hover:text-primary transition-colors">
              <Upload className="w-5 h-5" /><span className="text-xs font-medium">Add Photo</span>
            </button>
          )}
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileSelect} className="hidden" />
      </Section>

      <Button type="submit" loading={submitting || uploading} className="w-full" size="lg">
        {uploading ? 'Uploading photos...' : listingId ? 'Update Listing' : 'Post Listing'}
      </Button>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-card space-y-4">
      <h2 className="text-base font-bold text-gray-900">{title}</h2>
      {children}
    </div>
  );
}

function MultiCheckGroup({ label, options, selected, onToggle }: { label: string; options: string[]; selected: string[]; onToggle: (v: string) => void }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700 mb-2 block">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button key={opt} type="button" onClick={() => onToggle(opt)} className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all ${selected.includes(opt) ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
