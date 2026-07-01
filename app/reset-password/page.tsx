'use client';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Home } from 'lucide-react';
import toast from 'react-hot-toast';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? '';
  const token = searchParams.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [loading, setLoading]   = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) return toast.error('Passwords do not match');
    if (password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, token, password }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success('Password reset successfully!');
      router.push('/login');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (!email || !token) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-card border border-gray-100 p-8 text-center max-w-md">
          <p className="text-gray-700 font-medium">Invalid or missing reset link.</p>
          <Link href="/forgot-password" className="text-primary font-semibold hover:underline text-sm mt-4 block">Request a new link</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center"><Home className="w-5 h-5 text-white" /></div>
          <span className="text-2xl font-bold text-gray-900">Gida<span className="text-primary">Link</span></span>
        </Link>

        <div className="bg-white rounded-3xl shadow-card border border-gray-100 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Reset Password</h1>
          <p className="text-sm text-gray-500 mb-6">Choose a new password for your account.</p>
          <form onSubmit={submit} className="space-y-4">
            <Input label="New Password" type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} />
            <Input label="Confirm Password" type="password" required minLength={6} value={confirm} onChange={e => setConfirm(e.target.value)} />
            <Button type="submit" loading={loading} className="w-full">Reset Password</Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-brand-bg" />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
