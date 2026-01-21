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
      {/* 
        CARD CONTAINER - Adjust appearance here:
        - rounded-lg: Border radius (try: rounded-sm, rounded-md, rounded-lg, rounded-xl)
        - border border-gray-200: Border style (change gray-200 to different color)
      */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
        
        {/* 
          IMAGE CONTAINER - Adjust size here:
          - aspect-square: Makes it a square (change to aspect-video for 16:9, aspect-auto for auto)
          - bg-gray-100: Background color (change gray-100 to different shade)
          - w-24 h-24: Icon size inside (increase to w-32 h-32 for larger icon)
        */}
        <div className="w-full aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
          <svg className="w-24 h-24 text-gray-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M7 14l3-3 4 4 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* 
          CONTENT SECTION - Adjust padding and spacing here:
          - p-4: Padding inside content (try p-3, p-5, p-6 for different spacing)
          - space-y-3: Vertical spacing between elements (try space-y-2, space-y-4, space-y-5)
        */}
        <div className="p-4 space-y-3">
          
          {/* 
            PRODUCT NAME - Adjust text size here:
            - text-sm: Font size (try text-xs, text-base, text-lg for different sizes)
            - line-clamp-2: Max lines shown (change to line-clamp-1, line-clamp-3)
          */}
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug">
            {name}
          </h3>

          {/* 
            PRICE & STOCK SECTION - Adjust spacing here:
            - space-y-1: Spacing between price and stock (try space-y-0, space-y-2)
          */}
          <div className="space-y-1">
            {/* 
              PRICE - Adjust size here:
              - text-xl: Font size (try text-lg, text-2xl, text-3xl)
            */}
            <div className="text-xl font-bold text-gray-900">
              ₱{(price / 100).toFixed(2)}
            </div>
            
            {/* 
              STOCK - Adjust size here:
              - text-xs: Font size (try text-sm for larger)
            */}
            <div className="text-xs text-gray-500">
              Stock: {quantity ?? "—"}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
