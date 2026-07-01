'use client';
import { anonymousAvatarUrl } from '@/lib/utils';
import { EyeOff } from 'lucide-react';

interface AnonymousAvatarProps {
  seed: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap: Record<string, string> = { sm: 'w-8 h-8', md: 'w-10 h-10', lg: 'w-14 h-14', xl: 'w-20 h-20' };

export default function AnonymousAvatar({ seed, size = 'md', className = '' }: AnonymousAvatarProps) {
  return (
    <div className={`relative rounded-full overflow-hidden bg-gray-100 flex-shrink-0 ${sizeMap[size]} ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={anonymousAvatarUrl(seed)} alt="Anonymous" className="w-full h-full object-cover" />
      <div className="absolute bottom-0 right-0 bg-gray-700 rounded-full p-0.5 border border-white">
        <EyeOff className="w-2 h-2 text-white" />
      </div>
    </div>
  );
}
