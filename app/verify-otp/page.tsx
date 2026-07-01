'use client';
import { useState, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import Button from '@/components/ui/Button';
import { Home, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

function VerifyOTPContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const email = searchParams.get('email') ?? '';
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading]   = useState(false);
  const [resending, setResending] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp]; next[i] = val.slice(-1); setOtp(next);
    if (val && i < 5) inputs.current[i + 1]?.focus();
  };
  const handleKeyDown = (i: number, e: React.KeyboardEvent) => { if (e.key === 'Backspace' && !otp[i] && i > 0) inputs.current[i - 1]?.focus(); };
  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d+$/.test(text)) setOtp(text.padEnd(6, '').split('').slice(0, 6));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) return toast.error('Enter the full 6-digit code');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, otp: code }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      login(data.user);
      toast.success('Email verified! Welcome to GidaLink.');
      router.push('/dashboard');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setResending(true);
    try {
      const res = await fetch('/api/auth/resend-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success('A new code has been sent to your email');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center"><Home className="w-5 h-5 text-white" /></div>
          <span className="text-2xl font-bold text-gray-900">Gida<span className="text-primary">Link</span></span>
        </Link>

        <div className="bg-white rounded-3xl shadow-card border border-gray-100 p-8 text-center">
          <div className="w-14 h-14 bg-primary-light rounded-2xl flex items-center justify-center mx-auto mb-4"><Mail className="w-7 h-7 text-primary" /></div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Verify your email</h1>
          <p className="text-sm text-gray-500 mb-6">We sent a 6-digit code to <span className="font-semibold text-gray-700">{email}</span></p>

          <form onSubmit={submit}>
            <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
              {otp.map((digit, i) => (
                <input key={i} ref={el => { inputs.current[i] = el; }} value={digit} onChange={e => handleChange(i, e.target.value)} onKeyDown={e => handleKeyDown(i, e)} maxLength={1} inputMode="numeric" className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
              ))}
            </div>
            <Button type="submit" loading={loading} className="w-full">Verify Account</Button>
          </form>

          <button onClick={resend} disabled={resending} className="text-sm text-primary font-semibold hover:underline mt-5 disabled:opacity-50">{resending ? 'Sending...' : "Didn't get a code? Resend"}</button>
        </div>
      </div>
    </div>
  );
}

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-brand-bg" />}>
      <VerifyOTPContent />
    </Suspense>
  );
}
