import { Suspense } from "react";
import { getCachedInventoryAndCategories, setCachedInventoryAndCategories } from "../../lib/mongodbCache";
import { getInventoryAndCategories } from "../../lib/cache";
import Sidebar from "@/components/Sidebar";
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
      <main className="flex-1">
        <ProductListClient initialItems={data.items as any} />
      </main>
    </>
  );
}

import AuthGuard from "@/components/AuthGuard";

export default function ProductsPage() {
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
