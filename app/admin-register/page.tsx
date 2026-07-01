'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminRegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', secretCode: '' });
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/admin-secret-x9k2m7', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      login(data.user);
      toast.success('Admin account created');
      router.push('/admin');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8">
          <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4"><ShieldAlert className="w-7 h-7 text-red-600" /></div>
          <h1 className="text-xl font-bold text-gray-900 mb-1 text-center">Admin Registration</h1>
          <p className="text-sm text-gray-500 mb-6 text-center">Restricted access. This endpoint will be removed before public launch.</p>

          <form onSubmit={submit} className="space-y-4">
            <Input label="Full Name" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <Input label="Email Address" type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            <Input label="Phone Number" type="tel" required value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            <Input label="Password" type="password" required minLength={6} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
            <Input label="Admin Secret Code" type="password" required value={form.secretCode} onChange={e => setForm(f => ({ ...f, secretCode: e.target.value }))} />
            <Button type="submit" loading={loading} variant="danger" className="w-full">Create Admin Account</Button>
          </form>

          <Link href="/" className="text-center text-xs text-gray-400 hover:underline mt-6 block">← Back to GidaLink</Link>
        </div>
      </div>
    </div>
  );
}
