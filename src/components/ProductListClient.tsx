"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "./ProductCard";

type InventoryItem = {
  variationId: string;
  name: string;
  sku: string | null;
  priceMoney: { amount: number; currency: string };
  availableQuantity: number;
};

type ProductListClientProps = {
  initialItems: InventoryItem[];
};

export default function ProductListClient({ initialItems }: ProductListClientProps) {
  const searchParams = useSearchParams();
  const [items, setItems] = useState<InventoryItem[]>(initialItems || []);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(initialItems.length || 0);
  const categoryParam = searchParams.get("category") || "";

  useEffect(() => {
    const controller = new AbortController();
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const params = new URLSearchParams();
        if (query) params.append("q", query);
        if (categoryParam) params.append("category", categoryParam);
        params.append("page", String(page));
        params.append("pageSize", "20");
        const url = `/api/products${params.toString() ? "?" + params.toString() : ""}`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error("Failed to load products");
        const data = await res.json();
        setItems(data.items || []);
        if (typeof data.total === "number") {
          setTotalItems(data.total);
        } else if (Array.isArray(data.items)) {
          setTotalItems(data.items.length);
        }
        if (typeof data.totalPages === "number") {
          setTotalPages(data.totalPages);
        } else {
          setTotalPages(1);
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    run();
    return () => controller.abort();
  }, [query, categoryParam, page]);

  useEffect(() => {
    setPage(1);
  }, [categoryParam]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between pb-4 border-b border-gray-100">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500">Search by name or SKU</p>
        </div>
        <div className="w-full md:w-80 relative">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 pl-10 pr-3 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:border-gray-400 focus:bg-white transition-all"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </div>
        </div>
      </div>

      {loading && <p className="text-sm text-gray-500">Loading...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {items.length === 0 && !loading ? (
        <div className="py-12 text-center text-gray-500">
          No products found.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map((item) => (
              <ProductCard
                key={item.variationId}
                id={item.variationId}
                variationId={item.variationId}
                name={`${item.name}${item.sku ? ` - ${item.sku}` : ""}`}
                price={Number(item.priceMoney.amount)}
                quantity={item.availableQuantity}
              />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center mt-8 space-x-4">
               <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    page <= 1
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  Previous
                </button>
                <span className="text-sm text-gray-500">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    page >= totalPages
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  Next
                </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
