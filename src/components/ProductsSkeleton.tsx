"use client";

export function ProductsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="border border-gray-200 bg-white rounded-xl p-4 shadow-sm animate-pulse">
            <div className="h-6 bg-gray-100 rounded w-3/4"></div>
            <div className="h-4 bg-gray-100 rounded w-1/2 mt-3"></div>
            <div className="h-6 bg-gray-100 rounded w-1/3 mt-3"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
