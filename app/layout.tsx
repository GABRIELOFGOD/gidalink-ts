import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/AuthContext';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: { default: 'GidaLink – Your Campus. Your Home.', template: '%s | GidaLink' },
  description: "Nigeria's #1 student housing platform. Find honest hostel and apartment listings near your campus. No agent, no stress.",
  keywords: ['student hostel', 'student apartment', 'Nigeria', 'campus housing', 'UNILORIN', 'university accommodation'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Leaflet CSS — loaded here for reliable SSR-safe map rendering */}
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossOrigin="" />
      </head>
      <body>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: { fontFamily: 'Inter, system-ui, sans-serif', fontSize: '14px', borderRadius: '12px' },
              success: { iconTheme: { primary: '#4F46E5', secondary: '#fff' } },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
