'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import AdminSidebar from '@/components/layout/AdminSidebar';
import { Spinner } from '@/components/ui/index';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => { if (!loading && (!user || user.role !== 'admin')) router.push('/login'); }, [loading, user, router]);

  if (loading || !user || user.role !== 'admin') return <div className="min-h-screen flex items-center justify-center bg-gray-100"><Spinner size="lg" /></div>;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <main className="flex-1 min-w-0 p-6 lg:p-8">{children}</main>
    </div>
  );
}
