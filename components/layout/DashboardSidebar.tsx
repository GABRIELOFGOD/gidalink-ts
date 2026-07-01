'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { Avatar, Badge } from '@/components/ui/index';
import { LayoutDashboard, Home, MessageSquare, CreditCard, Bell, User, LogOut, Plus, Users } from 'lucide-react';

const navItems = [
  { href: '/dashboard',               icon: LayoutDashboard, label: 'Overview' },
  { href: '/dashboard/listings',      icon: Home,            label: 'My Listings' },
  { href: '/dashboard/roommates',     icon: Users,           label: 'Roommate Posts' },
  { href: '/dashboard/messages',      icon: MessageSquare,   label: 'Messages' },
  { href: '/dashboard/payments',      icon: CreditCard,      label: 'Payments' },
  { href: '/dashboard/notifications', icon: Bell,            label: 'Notifications' },
  { href: '/dashboard/profile',       icon: User,            label: 'Profile' },
];

const roleBadge: Record<string, { label: string; variant: 'blue' | 'green' | 'orange' | 'red' }> = {
  student:      { label: 'Student',      variant: 'blue' },
  hostel_owner: { label: 'Hostel Owner', variant: 'green' },
  agent:        { label: 'Agent',        variant: 'orange' },
  admin:        { label: 'Admin',        variant: 'red' },
};

export default function DashboardSidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-100 flex flex-col">
      <div className="p-6 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center"><Home className="w-3.5 h-3.5 text-white" /></div>
          <span className="font-bold text-gray-900">Gida<span className="text-primary">Link</span></span>
        </Link>
      </div>

      {user && (
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-brand-bg">
            <Avatar src={user.profilePhoto} name={user.name} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
              <Badge variant={roleBadge[user.role]?.variant ?? 'gray'} className="mt-0.5">{roleBadge[user.role]?.label ?? user.role}</Badge>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 border-b border-gray-100 space-y-2">
        <Link href="/dashboard/listings/new" className="flex items-center justify-center gap-2 w-full py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-colors">
          <Plus className="w-4 h-4" /> Post a Listing
        </Link>
        <Link href="/roommates/new" className="flex items-center justify-center gap-2 w-full py-2.5 bg-accent-light text-accent-dark text-sm font-semibold rounded-xl hover:bg-accent/10 transition-colors">
          <Users className="w-4 h-4" /> Find Roommate
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link key={href} href={href} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${active ? 'bg-primary-light text-primary-dark font-semibold' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}>
              <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-primary' : 'text-gray-400'}`} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100 space-y-1">
        <Link href="/listings" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-100 transition-colors"><Home className="w-4 h-4 text-gray-400" /> Back to Listings</Link>
        <button onClick={logout} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"><LogOut className="w-4 h-4" /> Sign Out</button>
      </div>
    </aside>
  );
}
