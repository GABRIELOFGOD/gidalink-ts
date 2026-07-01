'use client';
import { useState, useRef } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Input, Textarea, Select } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Avatar, Badge, Toggle } from '@/components/ui/index';
import { Camera } from 'lucide-react';
import { UNIVERSITIES } from '@/lib/utils';
import toast from 'react-hot-toast';

const roleBadge: Record<string, { label: string; variant: 'blue' | 'green' | 'orange' | 'red' }> = {
  student: { label: 'Student', variant: 'blue' }, hostel_owner: { label: 'Hostel Owner', variant: 'green' },
  agent: { label: 'Agent', variant: 'orange' }, admin: { label: 'Admin', variant: 'red' },
};

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name ?? '', phone: user?.phone ?? '', bio: user?.bio ?? '', university: user?.university ?? '', showPhone: user?.showPhone ?? false });
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('files', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      const url = data.files[0].url;

      const updateRes = await fetch('/api/users/me', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ profilePhoto: url }) });
      const updateData = await updateRes.json();
      setUser(updateData.user);
      toast.success('Profile photo updated');
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed'); } finally { setUploadingPhoto(false); }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/users/me', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setUser(data.user);
      toast.success('Profile updated successfully');
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed'); } finally { setSaving(false); }
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-card mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar src={user.profilePhoto} name={user.name} size="xl" />
            <button onClick={() => fileInputRef.current?.click()} disabled={uploadingPhoto} className="absolute -bottom-1 -right-1 p-1.5 bg-primary text-white rounded-full shadow hover:bg-primary-dark transition-colors disabled:opacity-50"><Camera className="w-3.5 h-3.5" /></button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
          </div>
          <div><p className="font-bold text-gray-900">{user.name}</p><p className="text-sm text-gray-400">{user.email}</p><Badge variant={roleBadge[user.role]?.variant ?? 'gray'} className="mt-1.5">{roleBadge[user.role]?.label ?? user.role}</Badge></div>
        </div>
      </div>

      <form onSubmit={submit} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-card space-y-4">
        <Input label="Full Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        <Input label="Phone Number" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
        {user.role === 'student' && (
          <Select label="University" value={form.university} onChange={e => setForm(f => ({ ...f, university: e.target.value }))}>
            <option value="">Select your university</option>
            {UNIVERSITIES.map(u => <option key={u} value={u}>{u}</option>)}
          </Select>
        )}
        <Textarea label="Bio" rows={3} placeholder="Tell others a bit about yourself..." maxLength={300} value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} />

        <div className="p-4 bg-gray-50 rounded-xl">
          <Toggle checked={form.showPhone} onChange={v => setForm(f => ({ ...f, showPhone: v }))} label="Show phone number on listings" sublabel="Prospective students can call you directly" />
        </div>

        <Button type="submit" loading={saving} className="w-full">Save Changes</Button>
      </form>
    </div>
  );
}
