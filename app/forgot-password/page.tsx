'use client';
import { useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Home, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSent(true);
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
          {sent ? (
            <div className="text-center">
              <CheckCircle2 className="w-14 h-14 text-primary mx-auto mb-4" />
              <h1 className="text-xl font-bold text-gray-900 mb-2">Check your email</h1>
              <p className="text-sm text-gray-500">If an account exists for <span className="font-semibold">{email}</span>, you&apos;ll receive a password reset link shortly.</p>
              <Link href="/login" className="text-primary font-semibold hover:underline text-sm mt-6 block">Back to Sign In</Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Forgot Password?</h1>
              <p className="text-sm text-gray-500 mb-6">Enter your email and we&apos;ll send you a reset link.</p>
              <form onSubmit={submit} className="space-y-4">
                <Input label="Email Address" type="email" placeholder="you@example.com" required value={email} onChange={e => setEmail(e.target.value)} />
                <Button type="submit" loading={loading} className="w-full">Send Reset Link</Button>
              </form>
              <p className="text-center text-sm text-gray-500 mt-6">Remember your password? <Link href="/login" className="text-primary font-semibold hover:underline">Sign in</Link></p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
