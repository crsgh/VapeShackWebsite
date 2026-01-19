"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

type ProductCardProps = {
  id: string; // variationId or itemId
  name: string;
  price: number;
  variationId: string;
  quantity?: number;
};

export default function ProductCard({
  name,
  price,
  variationId,
  quantity,
}: ProductCardProps) {
  const router = useRouter();

  const prefetch = useCallback(() => {
    try {
      router.prefetch(`/product/${variationId}`);
    } catch (e) {
      // ignore in case prefetch isn't available in some environments
    }
  }, [router, variationId]);

  return (
    <Link
      href={`/product/${variationId}`}
      className="group"
      onMouseEnter={prefetch}
      onFocus={prefetch}
      aria-label={`View ${name} details`}
    >
      <div className="border border-gray-200 bg-white text-gray-900 rounded-xl p-3 shadow-sm hover:shadow-md transition-transform duration-150 transform hover:scale-[1.02]">
        <div className="w-full h-40 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
          <svg className="w-16 h-16 text-gray-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M7 14l3-3 4 4 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="mt-3 flex items-start justify-between gap-3">
          <div className="space-y-1 max-w-[70%]">
            <h3 className="text-sm font-semibold leading-tight truncate">{name}</h3>
            <div className="text-xs text-gray-500">Qty: {quantity ?? "-"}</div>
          </div>
          <div className="text-right text-base font-semibold text-gray-900">
            ₱{(price / 100).toFixed(2)}
          </div>
        </div>
        <div className="mt-3 text-xs text-gray-500">View details</div>
      </div>
    </Link>
  );
}
