'use client';
import { useState } from 'react';
import { Heart } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { Modal } from '@/components/ui/index';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface BookmarkButtonProps {
  listingId: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function BookmarkButton({ listingId, size = 'md' }: BookmarkButtonProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);

  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-7 h-7',
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      setShowLoginModal(true);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/listings/${listingId}/bookmark`, {
        method: isBookmarked ? 'DELETE' : 'POST',
      });
      if (res.ok) {
        setIsBookmarked(!isBookmarked);
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleBookmark}
        disabled={loading}
        className="flex items-center justify-center transition-all duration-200 hover:scale-110 disabled:opacity-50"
      >
        <Heart
          className={`${sizeClasses[size]} ${isBookmarked
              ? 'fill-red-500 text-red-500'
              : 'text-gray-400 hover:text-red-500'
            } transition-colors`}
        />
      </button>

      <Modal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)}>
        <div className="text-center">
          <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Save Your Favorites</h3>
          <p className="text-sm text-gray-500 mb-6">Sign in to bookmark properties and access them later.</p>

          <div className="space-y-3">
            <button
              onClick={() => {
                setShowLoginModal(false);
                router.push('/login');
              }}
              className="w-full bg-primary text-white font-semibold py-3 rounded-xl hover:bg-primary-dark transition-colors"
            >
              Sign In
            </button>

            <button
              onClick={() => {
                setShowLoginModal(false);
                router.push('/register');
              }}
              className="w-full border border-gray-200 text-gray-900 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Create Account
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-3">Trouble signing in?</p>
            <Link
              href="/forgot-password"
              className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
              onClick={() => setShowLoginModal(false)}
            >
              Reset Your Password
            </Link>
          </div>
        </div>
      </Modal>
    </>
  );
}
