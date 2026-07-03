'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { Avatar, Badge } from '@/components/ui/index';
import { Home, Menu, X, Bell, ChevronDown, LogOut, User, LayoutDashboard, Shield, Plus, Users } from 'lucide-react';
import Search from './Search';

const roleBadge: Record<string, { label: string; variant: 'blue' | 'green' | 'orange' | 'red' }> = {
  student: { label: 'Student', variant: 'blue' },
  hostel_owner: { label: 'Hostel Owner', variant: 'green' },
  agent: { label: 'Agent', variant: 'orange' },
  admin: { label: 'Admin', variant: 'red' },
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [dropdown, setDD] = useState(false);
  const [unread, setUnread] = useState(0);
  const [showSearch, setShowSearch] = useState(true);
  const [scrollY, setScrollY] = useState(0);
  const ddRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const fetchUnread = async () => {
      try {
        const res = await fetch('/api/notifications');
        if (res.ok) { const d = await res.json(); setUnread(d.unreadCount ?? 0); }
      } catch { }
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

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setShowSearch(currentScrollY < 50);
      setScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main navbar row */}
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 transform group-hover:scale-105">
              <Home className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-black text-gray-900 tracking-tight">Gida<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-dark">Link</span></span>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            <Link href="/listings" className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${pathname === '/listings' ? 'bg-primary-light text-primary shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}>
              Browse Hostels
            </Link>
            <Link href="/roommates" className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${pathname.startsWith('/roommates') ? 'bg-accent/10 text-accent-dark shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}>
              Find Roommate
            </Link>
            <Link href="/dashboard/listings/new">
              <button className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-primary to-primary-dark text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105 ml-2">
                <Plus className="w-4 h-4" /> Post Listing
              </button>
            </Link>
          </div>

          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <>
                <Link href="/dashboard/notifications" className="relative p-2.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:text-gray-700">
                  <Bell className="w-5 h-5" />
                  {unread > 0 && <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">{unread > 9 ? '9+' : unread}</span>}
                </Link>

                <div className="relative" ref={ddRef}>
                  <button onClick={() => setDD(!dropdown)} className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-gray-100 transition-all duration-200">
                    <Avatar src={user.profilePhoto} name={user.name} size="sm" />
                    <span className="text-sm font-semibold text-gray-800 max-w-[120px] truncate">{user.name}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${dropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {dropdown && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        <Badge variant={roleBadge[user.role]?.variant ?? 'gray'} className="mt-1 text-xs">{roleBadge[user.role]?.label ?? user.role}</Badge>
                      </div>
                      <Link href="/dashboard" onClick={() => setDD(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"><LayoutDashboard className="w-4 h-4 text-gray-400" /> Dashboard</Link>
                      <Link href="/dashboard/roommates" onClick={() => setDD(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"><Users className="w-4 h-4 text-gray-400" /> My Roommate Posts</Link>
                      <Link href="/dashboard/profile" onClick={() => setDD(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"><User className="w-4 h-4 text-gray-400" /> My Profile</Link>
                      {user.role === 'admin' && <Link href="/admin" onClick={() => setDD(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"><Shield className="w-4 h-4" /> Admin Panel</Link>}
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button onClick={() => { setDD(false); logout(); }} className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-colors"><LogOut className="w-4 h-4" /> Sign Out</button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200">Sign In</Link>
                <Link href="/register" className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-primary to-primary-dark hover:shadow-lg rounded-lg transition-all duration-200 transform hover:scale-105">Get Started</Link>
              </div>
            )}
          </div>

          <button onClick={() => setOpen(!open)} className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Search bar - hidden on scroll */}
        {showSearch && (
          <div className="pb-4 animate-in fade-in slide-in-from-top duration-300">
            <Search />
          </div>
        )}
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-1 animate-in fade-in slide-in-from-top duration-200">
          <Link href="/listings" onClick={() => setOpen(false)} className="block px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors">Browse Hostels</Link>
          <Link href="/roommates" onClick={() => setOpen(false)} className="block px-4 py-3 rounded-xl text-sm font-semibold text-accent-dark hover:bg-accent/10 transition-colors">Find Roommate</Link>
          <Link href="/dashboard/listings/new" onClick={() => setOpen(false)} className="block px-4 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary to-primary-dark hover:shadow-lg transition-all">+ Post Listing</Link>
          {user ? (
            <>
              <Link href="/dashboard" onClick={() => setOpen(false)} className="block px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors">Dashboard</Link>
              <Link href="/dashboard/notifications" onClick={() => setOpen(false)} className="block px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors">Notifications {unread > 0 && <span className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{unread}</span>}</Link>
              {user.role === 'admin' && <Link href="/admin" onClick={() => setOpen(false)} className="block px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors">Admin Panel</Link>}
              <button onClick={() => { setOpen(false); logout(); }} className="block w-full text-left px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors">Sign Out</button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setOpen(false)} className="block px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors">Sign In</Link>
              <Link href="/register" onClick={() => setOpen(false)} className="block px-4 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary to-primary-dark hover:shadow-lg transition-all">Get Started Free</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
