'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { Input, Select, Textarea } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import AnonymityToggle from '@/components/ui/AnonymityToggle';
import { Toggle } from '@/components/ui/index';
import { Upload, X } from 'lucide-react';
import {
  NIGERIAN_STATES, UNIVERSITIES, STUDENT_LEVELS, ROOM_TYPES, GENDER_POLICIES,
  STUDENT_AMENITIES, WATER_SUPPLY_OPTIONS, POWER_SUPPLY_OPTIONS, SECURITY_OPTIONS,
  CONDITION_RATINGS,
} from '@/lib/utils';
import { getDeviceId } from '@/lib/deviceId';
import toast from 'react-hot-toast';

interface FormState {
  isAnonymous: boolean;
  university: string;
  course: string;
  level: string;
  gender: string;
  budget: string;
  preferredArea: string;
  state: string;
  description: string;
  contactInfo: string;
  hasListingDetails: boolean;
  partialListing: {
    roomType: string;
    address: string;
    rent: string;
    nearbyUniversity: string;
    genderPolicy: string;
    waterSupply: string[];
    powerSupply: string[];
    securityType: string[];
    drainageCondition: string;
    buildingCondition: string;
    amenities: string[];
    photos: string[];
  };
}

const emptyForm: FormState = {
  isAnonymous: false, university: '', course: '', level: '', gender: 'Any', budget: '',
  preferredArea: '', state: '', description: '', contactInfo: '', hasListingDetails: false,
  partialListing: {
    roomType: '', address: '', rent: '', nearbyUniversity: '', genderPolicy: '',
    waterSupply: [], powerSupply: [], securityType: [], drainageCondition: '', buildingCondition: '',
    amenities: [], photos: [],
  },
};

export default function RoommateForm() {
  const router = useRouter();
  const { user } = useAuth();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading]   = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof FormState>(key: K, val: FormState[K]) => setForm(f => ({ ...f, [key]: val }));
  const setPL = <K extends keyof FormState['partialListing']>(key: K, val: FormState['partialListing'][K]) =>
    setForm(f => ({ ...f, partialListing: { ...f.partialListing, [key]: val } }));
  const togglePLArr = (key: 'waterSupply' | 'powerSupply' | 'securityType' | 'amenities', val: string) =>
    setForm(f => ({ ...f, partialListing: { ...f.partialListing, [key]: f.partialListing[key].includes(val) ? f.partialListing[key].filter(v => v !== val) : [...f.partialListing[key], val] } }));

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (photoFiles.length + files.length > 6) return toast.error('Maximum 6 photos allowed');
    setPhotoFiles(prev => [...prev, ...files]);
  };

  const uploadPhotos = async (): Promise<string[]> => {
    if (photoFiles.length === 0) return [];
    setUploading(true);
    try {
      const formData = new FormData();
      photoFiles.forEach(f => formData.append('files', f));
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data.files.map((f: { url: string }) => f.url);
    } finally { setUploading(false); }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.university) return toast.error('Please select your university');
    if (!form.budget || Number(form.budget) <= 0) return toast.error('Please enter a valid budget');
    if (!form.preferredArea || !form.state) return toast.error('Please fill in your preferred area and state');
    if (form.description.trim().length < 20) return toast.error('Description must be at least 20 characters');

    setSubmitting(true);
    try {
      const photos = await uploadPhotos();
      const payload = {
        ...form,
        budget: Number(form.budget),
        deviceId: getDeviceId(),
        partialListing: form.hasListingDetails
          ? { ...form.partialListing, rent: form.partialListing.rent ? Number(form.partialListing.rent) : undefined, photos }
          : undefined,
      };

      const res = await fetch('/api/roommates', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success('Roommate post created!');
      router.push('/roommates');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6 max-w-3xl">
      <Section title="Posting Identity">
        <AnonymityToggle isAnonymous={form.isAnonymous} onChange={v => set('isAnonymous', v)} context="roommate" />
        {!user && <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">You&apos;re posting without an account. Be sure to add a way for interested students to reach you in the Contact Info field below.</p>}
      </Section>

      <Section title="About You">
        <Select label="University" required value={form.university} onChange={e => set('university', e.target.value)}>
          <option value="">Select university</option>
          {UNIVERSITIES.map(u => <option key={u} value={u}>{u}</option>)}
        </Select>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Course of Study" placeholder="e.g. Computer Science" value={form.course} onChange={e => set('course', e.target.value)} />
          <Select label="Level" value={form.level} onChange={e => set('level', e.target.value)}>
            <option value="">Select</option>
            {STUDENT_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
          </Select>
        </div>
        <Select label="Your Gender" required value={form.gender} onChange={e => set('gender', e.target.value)}>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Any">Prefer not to say</option>
        </Select>
      </Section>

      <Section title="What You're Looking For">
        <Input label="Annual Budget (₦)" type="number" placeholder="e.g. 80000" required value={form.budget} onChange={e => set('budget', e.target.value)} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Preferred Area" placeholder="e.g. Tanke, Sabo" required value={form.preferredArea} onChange={e => set('preferredArea', e.target.value)} />
          <Select label="State" required value={form.state} onChange={e => set('state', e.target.value)}>
            <option value="">Select state</option>
            {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </Select>
        </div>
        <Textarea label="Tell potential roommates about yourself" rows={4} placeholder="e.g. I'm a quiet 200L student, clean, mostly in class during the day, looking to split a 2-bedroom near campus..." required value={form.description} onChange={e => set('description', e.target.value)} />
        <Input label="Contact Info (optional)" placeholder="WhatsApp number or email — shown publicly" value={form.contactInfo} onChange={e => set('contactInfo', e.target.value)} />
      </Section>

      <Section title="Do You Already Have a Place?">
        <Toggle checked={form.hasListingDetails} onChange={v => set('hasListingDetails', v)} label="I already have an apartment and need someone to share it with me" sublabel="Toggle on to add the apartment details below" />

        {form.hasListingDetails && (
          <div className="space-y-4 pt-2 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-4">
              <Select label="Room Type" value={form.partialListing.roomType} onChange={e => setPL('roomType', e.target.value)}>
                <option value="">Select</option>
                {ROOM_TYPES.map(r => <option key={r} value={r}>{r}</option>)}
              </Select>
              <Input label="Rent Share (₦/yr)" type="number" placeholder="Your portion" value={form.partialListing.rent} onChange={e => setPL('rent', e.target.value)} />
            </div>
            <Input label="Apartment Address" placeholder="e.g. 12 Unity Road, Tanke" value={form.partialListing.address} onChange={e => setPL('address', e.target.value)} />
            <Select label="Nearby University" value={form.partialListing.nearbyUniversity} onChange={e => setPL('nearbyUniversity', e.target.value)}>
              <option value="">Select</option>
              {UNIVERSITIES.map(u => <option key={u} value={u}>{u}</option>)}
            </Select>
            <Select label="Gender Policy" value={form.partialListing.genderPolicy} onChange={e => setPL('genderPolicy', e.target.value)}>
              <option value="">Not specified</option>
              {GENDER_POLICIES.map(g => <option key={g} value={g}>{g}</option>)}
            </Select>

            <div className="grid grid-cols-2 gap-4">
              <Select label="Drainage Condition" value={form.partialListing.drainageCondition} onChange={e => setPL('drainageCondition', e.target.value)}>
                <option value="">Select</option>
                {CONDITION_RATINGS.map(o => <option key={o} value={o}>{o}</option>)}
              </Select>
              <Select label="Building Condition" value={form.partialListing.buildingCondition} onChange={e => setPL('buildingCondition', e.target.value)}>
                <option value="">Select</option>
                {CONDITION_RATINGS.map(o => <option key={o} value={o}>{o}</option>)}
              </Select>
            </div>

            <MultiCheckGroup label="Water Supply" options={[...WATER_SUPPLY_OPTIONS]} selected={form.partialListing.waterSupply} onToggle={v => togglePLArr('waterSupply', v)} />
            <MultiCheckGroup label="Power Supply" options={[...POWER_SUPPLY_OPTIONS]} selected={form.partialListing.powerSupply} onToggle={v => togglePLArr('powerSupply', v)} />
            <MultiCheckGroup label="Security" options={[...SECURITY_OPTIONS]} selected={form.partialListing.securityType} onToggle={v => togglePLArr('securityType', v)} />
            <MultiCheckGroup label="Amenities" options={[...STUDENT_AMENITIES]} selected={form.partialListing.amenities} onToggle={v => togglePLArr('amenities', v)} />

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Photos (optional, up to 6)</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {photoFiles.map((file, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setPhotoFiles(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
                  </div>
                ))}
                {photoFiles.length < 6 && (
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-primary hover:text-primary transition-colors">
                    <Upload className="w-5 h-5" /><span className="text-xs font-medium">Add Photo</span>
                  </button>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileSelect} className="hidden" />
            </div>
          </div>
        )}
      </Section>

      <Button type="submit" loading={submitting || uploading} className="w-full" size="lg" variant="accent">
        {uploading ? 'Uploading photos...' : 'Post Roommate Request'}
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
          <button key={opt} type="button" onClick={() => onToggle(opt)} className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all ${selected.includes(opt) ? 'bg-accent text-white border-accent' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
