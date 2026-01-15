import { Suspense } from "react";
import { getCachedInventoryAndCategories, setCachedInventoryAndCategories } from "../lib/mongodbCache";
import { fetchInventory } from "../lib/square/inventory";
import { inferCategory } from "../lib/categories";
import Sidebar from "@/components/Sidebar";
import ProductListClient from "@/components/ProductListClient";
import { ProductsSkeleton } from "@/components/ProductsSkeleton";

export const revalidate = 1800; // ISR: revalidate every 30 minutes

async function ProductsContent() {
  // Try MongoDB cache first (instant load on repeat visits or cache hits)
  const cachedData = await getCachedInventoryAndCategories();
  if (cachedData) {
    const categoryObjs = cachedData.categories.map((name) => ({ name }));
    return (
      <>
        <Sidebar initialCategories={categoryObjs} />
        <main className="flex-1">
          <ProductListClient initialItems={cachedData.items} />
        </main>
      </>
    );
  }

  // Cache miss or expired: fetch from Square API
  const initialItems = await fetchInventory();
  
  // Store in MongoDB cache for next request
  await setCachedInventoryAndCategories(initialItems);

  // Compute inferred categories from items
  const categoriesSet = new Set<string>();
  for (const item of initialItems) {
    const inferred = inferCategory(item.name);
    if (inferred !== "Unknown") {
      categoriesSet.add(inferred);
    }
  }
  const categories = Array.from(categoriesSet).sort().map((name) => ({ name }));

  return (
    <>
      <Sidebar initialCategories={categories} />
      <main className="flex-1">
        <ProductListClient initialItems={initialItems} />
      </main>
    </>
  );
}

import AuthGuard from "@/components/AuthGuard";

export default function Home() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <div className="container mx-auto px-4 py-8 flex gap-6">
          <Suspense fallback={<ProductsSkeleton />}>
            <ProductsContent />
          </Suspense>
        </div>
      </div>
    </AuthGuard>
  );
}
