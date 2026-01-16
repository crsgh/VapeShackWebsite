import { Suspense } from "react";
import { getInventoryAndCategories } from "../lib/cache";
import Sidebar from "@/components/Sidebar";
import ProductListClient from "@/components/ProductListClient";
import { ProductsSkeleton } from "@/components/ProductsSkeleton";

export const revalidate = 0;

async function ProductsContent() {
  const { items, categories } = await getInventoryAndCategories();
  const availableItems = items.filter((item) => item.availableQuantity > 0);
  const sortedItems = [...availableItems].sort((a, b) => {
    const byName = a.name.localeCompare(b.name);
    if (byName !== 0) return byName;
    return a.variationId.localeCompare(b.variationId);
  });
  const initialItems = sortedItems.slice(0, 20);

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
