"use client";

import { IListing } from "@/types";
import { ArrowRight, ChevronRight } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import CompactListingCard from "../listings/CompactListingCard";
import { LandingPageSkeleton, CardSkeleton } from "../listings/CardSkeletons";
import Navbar from "./Navbar";
import Footer from "./Footer";

interface UniversityGroup {
  name: string;
  count: number;
  listings: IListing[];
}

interface GroupedListingsResponse {
  universities: UniversityGroup[];
  unlistedProperties: IListing[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

const AirBNBLandingPage = () => {
  const router = useRouter();
  const [data, setData] = useState<GroupedListingsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const scrollContainers = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    fetch('/api/listings/grouped')
      .then(r => r.json())
      .then((res) => {
        if (res.success) setData(res);
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  const scroll = (universityName: string, direction: 'left' | 'right') => {
    const container = scrollContainers.current[universityName];
    if (container) {
      const scrollAmount = 320;
      container.scrollBy({ left: direction === 'right' ? scrollAmount : -scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div>
      <Navbar />
      <div className="flex flex-col gap-10 my-10">
        {loading ? (
          <LandingPageSkeleton />
        ) : !data || (data.universities.length === 0 && data.unlistedProperties.length === 0) ? (
          <div className="max-w-7xl mx-auto w-full">
            <div className="text-center py-32 text-gray-400">
              <p className="text-4xl mb-4">🏠</p>
              <p className="font-medium">No listings yet. Be the first to post!</p>
            </div>
          </div>
        ) : (
          <>
            {/* Universities Sections */}
            {data?.universities.map((university) => (
              <section key={university.name} className=" px-4">
                <div className="max-w-7xl mx-auto">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-black text-gray-900">{university.name}</h2>
                      {/* <p className="text-sm text-gray-500 mt-1">{university.count} properties available</p> */}
                    </div>
                  </div>

                  {/* Horizontal Scrollable Container */}
                  <div className="relative">
                    <div
                      ref={(el) => {
                        if (el) scrollContainers.current[university.name] = el;
                      }}
                      className="flex gap-4 overflow-x-auto pb-4 scroll-smooth"
                      style={{ scrollBehavior: 'smooth', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                      {/* Listing Cards */}
                      {university.listings.map((listing, index) => {
                        const isMostRated = index === 0 && listing.averageRating > 0;
                        return (
                          <div key={listing._id} className="flex-shrink-0 w-56">
                            <CompactListingCard listing={listing} isMostRated={isMostRated} />
                          </div>
                        );
                      })}

                      {/* See More Card */}
                      <div
                        className="flex-shrink-0 w-56 h-auto bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow flex items-center justify-center min-h-48"
                        onClick={() => router.push(`/listings?nearbyUniversity=${encodeURIComponent(university.name)}`)}
                      >
                        <div className="text-center">
                          <p className="text-sm font-semibold text-gray-600 mb-2">See more</p>
                          <p className="text-3xl font-black text-indigo-600 mb-2">+</p>
                          <p className="text-xs text-gray-500">in {university.name}</p>
                        </div>
                      </div>
                    </div>

                    {/* Scroll Buttons */}
                    <button
                      onClick={() => scroll(university.name, 'left')}
                      className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-shadow z-10"
                    >
                      <ChevronRight className="w-5 h-5 rotate-180" />
                    </button>
                    <button
                      onClick={() => scroll(university.name, 'right')}
                      className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-shadow z-10"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </section>
            ))}

            {/* Unlisted Properties Section */}
            {data?.unlistedProperties && data.unlistedProperties.length > 0 && (
              <section className="py-12 px-4">
                <div className="max-w-7xl mx-auto">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-black text-gray-900">Other Properties</h2>
                      <p className="text-sm text-gray-500 mt-1">Properties without a specific university</p>
                    </div>
                    <button
                      onClick={() => router.push('/listings')}
                      className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
                    >
                      View all <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {data.unlistedProperties.map((listing, index) => {
                      const isMostRated = index === 0 && listing.averageRating > 0;
                      return (
                        <CompactListingCard key={listing._id} listing={listing} isMostRated={isMostRated} />
                      );
                    })}
                  </div>
                </div>
              </section>
            )}
          </>
        )}
      </div>

      <Footer />

      <style>{`
        .scroll-smooth::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default AirBNBLandingPage;