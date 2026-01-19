import { Suspense } from "react";
import { getCachedInventoryAndCategories, setCachedInventoryAndCategories } from "../lib/mongodbCache";
import { getInventoryAndCategories } from "../lib/cache";
import { inferCategory } from "../lib/categories";
import Sidebar from "@/components/Sidebar";
import ProductListClient from "@/components/ProductListClient";
import { ProductsSkeleton } from "@/components/ProductsSkeleton";

export const revalidate = 1800; // ISR: revalidate every 30 minutes

async function ProductsContent() {
  // Use unified cache which prefers uploaded Product docs, then mongo cache, then in-memory, then Square fetch
  const data = await getInventoryAndCategories();

  // Also store to Mongo cache collection if not already present (helps other instances)
  try {
    await setCachedInventoryAndCategories(data.items as any);
  } catch (e) {
    // ignore write errors
  }

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
