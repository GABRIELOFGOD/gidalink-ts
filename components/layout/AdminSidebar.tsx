'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { Avatar } from '@/components/ui/index';
import { LayoutDashboard, Users, Home, CreditCard, Flag, LogOut, ShieldAlert, UserSquare2 } from 'lucide-react';

const navItems = [
  { href: '/admin',           icon: LayoutDashboard, label: 'Overview' },
  { href: '/admin/users',     icon: Users,           label: 'Users' },
  { href: '/admin/listings',  icon: Home,            label: 'Listings' },
  { href: '/admin/roommates', icon: UserSquare2,     label: 'Roommate Posts' },
  { href: '/admin/flags',     icon: Flag,            label: 'Flagged Content' },
  { href: '/admin/payments',  icon: CreditCard,      label: 'Transactions' },
];

export default function AdminSidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-gray-900 text-gray-300 flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-red-500 rounded-lg flex items-center justify-center"><ShieldAlert className="w-3.5 h-3.5 text-white" /></div>
          <span className="font-bold text-white">GidaLink <span className="text-red-400">Admin</span></span>
        </Link>
      </div>

      {user && (
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-800">
            <Avatar src={user.profilePhoto} name={user.name} size="sm" />
            <div className="min-w-0"><p className="text-sm font-semibold text-white truncate">{user.name}</p><p className="text-xs text-red-400">Administrator</p></div>
          </div>
        </div>
      )}

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/admin' && pathname.startsWith(href));
          return (
            <Link key={href} href={href} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${active ? 'bg-red-500/10 text-red-400' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
              <Icon className="w-4 h-4" /> {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"><Home className="w-4 h-4" /> Back to App</Link>
        <button onClick={logout} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-400 hover:bg-gray-800 transition-colors w-full text-left"><LogOut className="w-4 h-4" /> Sign Out</button>
      </div>
    </aside>
  );
}
