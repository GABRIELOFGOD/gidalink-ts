'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Home, GraduationCap, Building2, Briefcase } from 'lucide-react';
import { UNIVERSITIES } from '@/lib/utils';
import toast from 'react-hot-toast';

const roles = [
  { value: 'student',      label: 'Student',      desc: 'Looking for a hostel or apartment', icon: GraduationCap },
  { value: 'hostel_owner', label: 'Hostel Owner', desc: 'I own a property to list',          icon: Building2 },
  { value: 'agent',        label: 'Agent',        desc: 'I facilitate rentals for owners',    icon: Briefcase },
];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'student', university: '' });
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success('Account created! Check your email for the verification code.');
      router.push(`/verify-otp?email=${encodeURIComponent(form.email)}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center"><Home className="w-5 h-5 text-white" /></div>
          <span className="text-2xl font-bold text-gray-900">Gida<span className="text-primary">Link</span></span>
        </Link>

        <div className="bg-white rounded-3xl shadow-card border border-gray-100 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h1>
          <p className="text-sm text-gray-500 mb-6">Join GidaLink and skip the agent fees.</p>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">I am a...</label>
              <div className="grid grid-cols-3 gap-2">
                {roles.map(r => (
                  <button key={r.value} type="button" onClick={() => setForm(f => ({ ...f, role: r.value }))} className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${form.role === r.value ? 'border-primary bg-primary-light' : 'border-gray-200 hover:border-gray-300'}`}>
                    <r.icon className={`w-5 h-5 ${form.role === r.value ? 'text-primary' : 'text-gray-400'}`} />
                    <span className={`text-xs font-semibold ${form.role === r.value ? 'text-primary-dark' : 'text-gray-600'}`}>{r.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <Input label="Full Name" placeholder="e.g. Aisha Bello" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <Input label="Email Address" type="email" placeholder="you@example.com" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            <Input label="Phone Number" type="tel" placeholder="080xxxxxxxx" required value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />

            {form.role === 'student' && (
              <Select label="University (optional)" value={form.university} onChange={e => setForm(f => ({ ...f, university: e.target.value }))}>
                <option value="">Select your university</option>
                {UNIVERSITIES.map(u => <option key={u} value={u}>{u}</option>)}
              </Select>
            )}

            <Input label="Password" type="password" placeholder="At least 6 characters" required minLength={6} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />

            <Button type="submit" loading={loading} className="w-full mt-2">Create Account</Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">Already have an account? <Link href="/login" className="text-primary font-semibold hover:underline">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}
