"use client";

export function ProductsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="bg-[#111214] border border-[#1f2126] rounded-2xl p-5 shadow-lg animate-pulse">
        <div className="h-8 bg-[#1f2126] rounded w-32"></div>
        <div className="h-4 bg-[#1f2126] rounded w-48 mt-2"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="border border-[#1f2126] bg-[#0c0d0f] rounded-xl p-4 animate-pulse">
            <div className="h-6 bg-[#1f2126] rounded w-3/4"></div>
            <div className="h-4 bg-[#1f2126] rounded w-1/2 mt-3"></div>
            <div className="h-6 bg-[#1f2126] rounded w-1/3 mt-3"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
