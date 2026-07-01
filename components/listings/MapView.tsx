'use client';
import { useEffect, useRef, useCallback } from 'react';
import type { Map as LMap, Marker } from 'leaflet';
import type { IListing } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface MapViewProps {
  listings?: IListing[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  className?: string;
  /** If true, clicking the map captures those coordinates */
  onLocationPick?: (lat: number, lng: number) => void;
}

export default function MapView({
  listings = [],
  center,
  zoom = 14,
  height = '420px',
  className = '',
  onLocationPick,
}: MapViewProps) {
  const containerRef  = useRef<HTMLDivElement>(null);
  const mapRef        = useRef<LMap | null>(null);
  const markersRef    = useRef<Marker[]>([]);
  const pickMarkerRef = useRef<Marker | null>(null);

  // ── Draw listing markers ──────────────────────────────────────
  const drawMarkers = useCallback(
    (L: typeof import('leaflet'), map: LMap, data: IListing[]) => {
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];

      data.forEach(listing => {
        if (!listing.coordinates?.lat || !listing.coordinates?.lng) return;

        const icon = L.divIcon({
          className: '',
          html: `<div style="
            background:${listing.isPremium ? '#F97316' : '#4F46E5'};
            color:#fff;font-size:11px;font-weight:700;
            padding:4px 8px;border-radius:20px;
            white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,.25);
            border:2px solid #fff;cursor:pointer;
          ">₦${Math.round(listing.annualRent / 1000)}k</div>`,
          iconAnchor: [20, 10],
        });

        const marker = L.marker(
          [listing.coordinates.lat, listing.coordinates.lng],
          { icon }
        ).addTo(map);

        marker.bindPopup(`
          <div style="min-width:180px;font-family:Inter,sans-serif">
            ${listing.photos?.[0] ? `<img src="${listing.photos[0]}" style="width:100%;height:90px;object-fit:cover;border-radius:6px;margin-bottom:8px" />` : ''}
            <p style="font-weight:700;font-size:13px;margin:0 0 2px;color:#111">${listing.title}</p>
            <p style="font-size:11px;color:#6B7280;margin:0 0 4px">${listing.area}, ${listing.lga}</p>
            <p style="font-weight:800;font-size:14px;color:#4F46E5;margin:0 0 6px">${formatCurrency(listing.annualRent)}<span style="font-size:10px;font-weight:400;color:#9CA3AF">/yr</span></p>
            <a href="/listings/${listing._id}" style="display:block;background:#4F46E5;color:#fff;text-align:center;padding:5px;border-radius:6px;font-size:12px;font-weight:600;text-decoration:none">View Listing</a>
          </div>
        `, { maxWidth: 220 });

        markersRef.current.push(marker);
      });
    },
    []
  );

  // ── Initialise map once ───────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let mounted = true;

    import('leaflet').then(L => {
      if (!mounted || !containerRef.current || mapRef.current) return;

      // Fix default icon paths (broken in webpack/Next.js)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.default.Icon.Default.prototype as any)._getIconUrl;
      L.default.Icon.Default.mergeOptions({
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const initialCenter: [number, number] = center ?? [8.4799, 4.5418]; // Default: Ilorin
      const map = L.default.map(containerRef.current, {
        center:            initialCenter,
        zoom:              center ? zoom : 13,
        zoomControl:       true,
        scrollWheelZoom:   false,
        attributionControl: true,
      });

      L.default.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Location-pick mode
      if (onLocationPick) {
        map.on('click', (e: L.LeafletMouseEvent) => {
          const { lat, lng } = e.latlng;
          if (pickMarkerRef.current) pickMarkerRef.current.remove();
          pickMarkerRef.current = L.default.marker([lat, lng]).addTo(map);
          onLocationPick(lat, lng);
        });

        // Show crosshair cursor
        (map.getContainer() as HTMLElement).style.cursor = 'crosshair';
      }

      mapRef.current = map;
      drawMarkers(L.default, map, listings);
    });

    return () => {
      mounted = false;
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Fly to new centre when university is selected ─────────────
  useEffect(() => {
    if (!mapRef.current || !center) return;
    mapRef.current.flyTo(center, zoom, { animate: true, duration: 1.2 });
  }, [center, zoom]);

  // ── Redraw markers when listings change ───────────────────────
  useEffect(() => {
    if (!mapRef.current) return;
    import('leaflet').then(L => {
      if (!mapRef.current) return;
      drawMarkers(L.default, mapRef.current, listings);
    });
  }, [listings, drawMarkers]);

  return (
    <div className={`relative ${className}`} style={{ height }}>
      <div ref={containerRef} className="w-full h-full rounded-2xl overflow-hidden border border-gray-200" />
      {onLocationPick && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 bg-white/90 backdrop-blur text-xs font-semibold text-gray-700 px-3 py-1.5 rounded-full shadow pointer-events-none">
          Click the map to pin your location
        </div>
      )}
    </div>
  );
}
