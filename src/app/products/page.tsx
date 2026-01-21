import { Suspense } from "react";
import { getCachedInventoryAndCategories, setCachedInventoryAndCategories } from "../../lib/mongodbCache";
import { getInventoryAndCategories } from "../../lib/cache";
import Sidebar from "@/components/Sidebar";
import CategoryFilter from "@/components/CategoryFilter";
import ProductListClient from "@/components/ProductListClient";
import { ProductsSkeleton } from "@/components/ProductsSkeleton";

export const revalidate = 1800; // ISR: revalidate every 30 minutes

async function ProductsContent() {
  const data = await getInventoryAndCategories();

  try {
    await setCachedInventoryAndCategories(data.items as any);
  } catch (e) {}

  const categoryObjs = data.categories;
  return (
    <>
      <Sidebar initialCategories={categoryObjs} />
      {/* 
        MAIN CONTAINER - Responsive adjustments:
        - hidden md:block: Sidebar hidden on mobile, visible on desktop (md = medium screens)
        - ml-0 md:ml-56: No left margin on mobile, 56 units on desktop
        - px-3 sm:px-4 md:px-6: Increases padding as screen gets larger
        - py-4 sm:py-6 md:py-8: Increases vertical padding on larger screens
      */}
      <main className="flex-1 ml-0 md:ml-56 min-h-screen bg-white">
        <div className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 w-full">
          <div className="mb-6 md:hidden">
            <CategoryFilter initialCategories={categoryObjs} />
          </div>
          <ProductListClient initialItems={data.items as any} />
        </div>
      </main>
    </>
  );
}

import AuthGuard from "@/components/AuthGuard";

export default function ProductsPage() {
  return (
    <AuthGuard>
      {/* 
        RESPONSIVE LAYOUT - This uses flexbox to adapt to screen size:
        - flex: Creates horizontal layout
        - On desktop: sidebar (fixed width) + main content
        - On mobile: sidebar hidden, main content full width
      */}
      <div className="flex min-h-screen bg-white">
        <Suspense fallback={<ProductsSkeleton />}>
          <ProductsContent />
        </Suspense>
      </div>
    </AuthGuard>
  );
}
