'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { Avatar, Badge } from '@/components/ui/index';
import { Home, Menu, X, Bell, ChevronDown, LogOut, User, LayoutDashboard, Shield, Plus, Users } from 'lucide-react';

const roleBadge: Record<string, { label: string; variant: 'blue' | 'green' | 'orange' | 'red' }> = {
  student:      { label: 'Student',      variant: 'blue' },
  hostel_owner: { label: 'Hostel Owner', variant: 'green' },
  agent:        { label: 'Agent',        variant: 'orange' },
  admin:        { label: 'Admin',        variant: 'red' },
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [open, setOpen]     = useState(false);
  const [dropdown, setDD]   = useState(false);
  const [unread, setUnread] = useState(0);
  const ddRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const fetchUnread = async () => {
      try {
        const res = await fetch('/api/notifications');
        if (res.ok) { const d = await res.json(); setUnread(d.unreadCount ?? 0); }
      } catch {}
    };
    fetchUnread();
    const iv = setInterval(fetchUnread, 15000);
    return () => clearInterval(iv);
  }, [user]);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ddRef.current && !ddRef.current.contains(e.target as Node)) setDD(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <Home className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Gida<span className="text-primary">Link</span></span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <Link href="/listings" className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${pathname === '/listings' ? 'bg-primary-light text-primary' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}>
              Browse Hostels
            </Link>
            <Link href="/roommates" className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${pathname.startsWith('/roommates') ? 'bg-accent-light text-accent-dark' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}>
              Find Roommate
            </Link>
            <Link href="/dashboard/listings/new">
              <button className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-dark transition-colors ml-1">
                <Plus className="w-4 h-4" /> Post Listing
              </button>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link href="/dashboard/notifications" className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                  <Bell className="w-5 h-5" />
                  {unread > 0 && <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{unread > 9 ? '9+' : unread}</span>}
                </Link>

                <div className="relative" ref={ddRef}>
                  <button onClick={() => setDD(!dropdown)} className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-gray-100 transition-colors">
                    <Avatar src={user.profilePhoto} name={user.name} size="sm" />
                    <span className="text-sm font-medium text-gray-800 max-w-[120px] truncate">{user.name}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${dropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {dropdown && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        <Badge variant={roleBadge[user.role]?.variant ?? 'gray'} className="mt-1">{roleBadge[user.role]?.label ?? user.role}</Badge>
                      </div>
                      <Link href="/dashboard" onClick={() => setDD(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"><LayoutDashboard className="w-4 h-4 text-gray-400" /> Dashboard</Link>
                      <Link href="/dashboard/roommates" onClick={() => setDD(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"><Users className="w-4 h-4 text-gray-400" /> My Roommate Posts</Link>
                      <Link href="/dashboard/profile" onClick={() => setDD(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"><User className="w-4 h-4 text-gray-400" /> My Profile</Link>
                      {user.role === 'admin' && <Link href="/admin" onClick={() => setDD(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"><Shield className="w-4 h-4" /> Admin Panel</Link>}
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button onClick={() => { setDD(false); logout(); }} className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full text-left"><LogOut className="w-4 h-4" /> Sign Out</button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">Sign In</Link>
                <Link href="/register" className="px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors">Get Started</Link>
              </div>
            )}
          </div>

          <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-1">
          <Link href="/listings" onClick={() => setOpen(false)} className="block px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100">Browse Hostels</Link>
          <Link href="/roommates" onClick={() => setOpen(false)} className="block px-4 py-3 rounded-xl text-sm font-medium text-accent-dark hover:bg-accent-light">Find Roommate</Link>
          <Link href="/dashboard/listings/new" onClick={() => setOpen(false)} className="block px-4 py-3 rounded-xl text-sm font-semibold text-primary hover:bg-primary-light">+ Post Listing</Link>
          {user ? (
            <>
              <Link href="/dashboard" onClick={() => setOpen(false)} className="block px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100">Dashboard</Link>
              <Link href="/dashboard/notifications" onClick={() => setOpen(false)} className="block px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100">Notifications {unread > 0 && <span className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{unread}</span>}</Link>
              {user.role === 'admin' && <Link href="/admin" onClick={() => setOpen(false)} className="block px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50">Admin Panel</Link>}
              <button onClick={() => { setOpen(false); logout(); }} className="block w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50">Sign Out</button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setOpen(false)} className="block px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100">Sign In</Link>
              <Link href="/register" onClick={() => setOpen(false)} className="block px-4 py-3 rounded-xl text-sm font-semibold text-primary hover:bg-primary-light">Get Started Free</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
