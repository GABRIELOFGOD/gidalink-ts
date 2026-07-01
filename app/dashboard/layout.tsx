'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import { Spinner } from '@/components/ui/index';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => { if (!loading && !user) router.push('/login'); }, [loading, user, router]);

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center bg-brand-bg"><Spinner size="lg" /></div>;

  return (
    <div className="flex min-h-screen bg-brand-bg">
      <DashboardSidebar />
      <main className="flex-1 min-w-0 p-6 lg:p-8">{children}</main>
    </div>
  );
}
