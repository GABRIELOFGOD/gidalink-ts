'use client';

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm animate-pulse">
      <div className="h-32 bg-gray-200" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-3/4" />
        <div className="h-2.5 bg-gray-100 rounded w-1/2" />
        <div className="flex gap-1">
          <div className="h-2 bg-gray-100 rounded w-6" />
          <div className="h-2 bg-gray-100 rounded w-6" />
        </div>
        <div className="flex justify-between items-end pt-2 border-t border-gray-100">
          <div className="space-y-1">
            <div className="h-3 bg-gray-200 rounded w-16" />
            <div className="h-2 bg-gray-100 rounded w-12" />
          </div>
          <div className="h-6 w-6 bg-gray-200 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function UniversitySectionSkeleton() {
  return (
    <section className="py-12 px-4 animate-pulse">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 space-y-2">
          <div className="h-6 bg-gray-200 rounded w-48" />
          <div className="h-3 bg-gray-100 rounded w-64" />
        </div>

        <div className="flex gap-6 overflow-hidden">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-80">
              <CardSkeleton />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LandingPageSkeleton() {
  return (
    <div className="pb-16">
      <div className="pb-8">
        <div className="h-12 bg-gray-200 rounded-xl w-full animate-pulse" />
      </div>

      {[...Array(3)].map((_, i) => (
        <UniversitySectionSkeleton key={i} />
      ))}
    </div>
  );
}
