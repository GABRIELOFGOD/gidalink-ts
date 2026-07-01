'use client';
import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

export default function PhotoGallery({ photos = [] }: { photos?: string[] }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLB]   = useState(false);

  if (!photos.length) {
    return <div className="h-80 bg-primary-light rounded-2xl flex items-center justify-center"><span className="text-6xl">🏠</span></div>;
  }

  const prev = () => setActive(a => (a === 0 ? photos.length - 1 : a - 1));
  const next = () => setActive(a => (a === photos.length - 1 ? 0 : a + 1));

  return (
    <>
      <div className="space-y-3">
        <div className="relative h-80 md:h-96 rounded-2xl overflow-hidden bg-gray-100 group cursor-pointer" onClick={() => setLB(true)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photos[active]} alt="Listing" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
            <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity w-10 h-10 drop-shadow-lg" />
          </div>
          {photos.length > 1 && (
            <>
              <button onClick={e => { e.stopPropagation(); prev(); }} className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur rounded-full shadow hover:bg-white transition-colors"><ChevronLeft className="w-5 h-5" /></button>
              <button onClick={e => { e.stopPropagation(); next(); }} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur rounded-full shadow hover:bg-white transition-colors"><ChevronRight className="w-5 h-5" /></button>
            </>
          )}
          <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/50 text-white text-xs font-medium rounded-full">{active + 1} / {photos.length}</div>
        </div>

        {photos.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {photos.map((p, i) => (
              <button key={i} onClick={() => setActive(i)} className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${i === active ? 'border-primary shadow-md' : 'border-transparent hover:border-gray-300'}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={() => setLB(false)}>
          <button onClick={() => setLB(false)} className="absolute top-4 right-4 p-2 text-white hover:bg-white/20 rounded-full transition-colors"><X className="w-6 h-6" /></button>
          <button onClick={e => { e.stopPropagation(); prev(); }} className="absolute left-4 p-3 text-white hover:bg-white/20 rounded-full transition-colors"><ChevronLeft className="w-7 h-7" /></button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photos[active]} alt="Listing" className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl" onClick={e => e.stopPropagation()} />
          <button onClick={e => { e.stopPropagation(); next(); }} className="absolute right-4 p-3 text-white hover:bg-white/20 rounded-full transition-colors"><ChevronRight className="w-7 h-7" /></button>
          <div className="absolute bottom-4 text-white text-sm font-medium">{active + 1} / {photos.length}</div>
        </div>
      )}
    </>
  );
}
