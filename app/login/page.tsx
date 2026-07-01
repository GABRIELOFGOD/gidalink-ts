'use client';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Home } from 'lucide-react';
import toast from 'react-hot-toast';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      login(data.user);
      toast.success('Welcome back!');
      const redirect = searchParams.get('redirect');
      router.push(redirect ?? (data.user.role === 'admin' ? '/admin' : '/dashboard'));
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
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h1>
          <p className="text-sm text-gray-500 mb-6">Sign in to continue to GidaLink.</p>

          <form onSubmit={submit} className="space-y-4">
            <Input label="Email Address" type="email" placeholder="you@example.com" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            <div>
              <Input label="Password" type="password" placeholder="••••••••" required value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
              <Link href="/forgot-password" className="text-xs text-primary font-semibold hover:underline mt-1.5 block text-right">Forgot password?</Link>
            </div>
            <Button type="submit" loading={loading} className="w-full mt-2">Sign In</Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">Don&apos;t have an account? <Link href="/register" className="text-primary font-semibold hover:underline">Create one</Link></p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-brand-bg" />}>
      <LoginContent />
    </Suspense>
  );
}
