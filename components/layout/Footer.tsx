import Link from 'next/link';
import { Home, Mail, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center">
                <Home className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Gida<span className="text-primary">Link</span></span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs">
              Nigeria&apos;s student-powered housing platform. Find honest hostel and apartment listings near your campus, post anonymously if you prefer, and skip the agent fees.
            </p>
            <p className="text-xs mt-4 text-gray-600">Currently live in Ilorin, Kwara State.</p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 text-sm">Platform</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/listings" className="hover:text-primary transition-colors">Browse Hostels</Link></li>
              <li><Link href="/roommates" className="hover:text-primary transition-colors">Find a Roommate</Link></li>
              <li><Link href="/dashboard/listings/new" className="hover:text-primary transition-colors">Post a Listing</Link></li>
              <li><Link href="/register" className="hover:text-primary transition-colors">Create Account</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 text-sm">Contact</h3>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-primary" /> hello@gidalink.com</li>
              <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-primary" /> +234 000 000 0000</li>
            </ul>
            <p className="text-xs mt-4 text-gray-600">Ilorin, Kwara State, Nigeria</p>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs">© {new Date().getFullYear()} GidaLink. All rights reserved.</p>
          <p className="text-xs italic text-primary">Your Campus. Your Home.</p>
        </div>
      </div>
    </footer>
  );
}
