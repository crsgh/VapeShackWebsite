"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "./ProductCard";
import { inferCategory } from "@/lib/categories";

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
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const categoryParam = searchParams.get("category") || "";

    useEffect(() => {
      // debounce the input to avoid spamming the product fetch/filter
      const t = setTimeout(() => setQuery(inputValue.trim()), 300);
      return () => clearTimeout(t);
    }, [inputValue]);

    useEffect(() => {
      // If we have initialItems from server, prefer client-side filtering/pagination
      if (initialItems && initialItems.length > 0) {
        setError(null);
        setLoading(false);

        const qLower = query.trim().toLowerCase();
        const filtered = initialItems.filter((item) => {
          const matchesQuery = qLower
            ? item.name.toLowerCase().includes(qLower) || (item.sku || "").toLowerCase().includes(qLower)
            : true;
          const matchesCategory = categoryParam
            ? inferCategory(item.name) === categoryParam
            : true;

          return matchesQuery && matchesCategory && item.availableQuantity > 0;
        });

        const pageSize = 20;
        const total = filtered.length;
        const totalPagesCalc = total === 0 ? 1 : Math.ceil(total / pageSize);
        setTotalPages(totalPagesCalc);
        const start = (page - 1) * pageSize;
        const paged = filtered.slice(start, start + pageSize);
        setItems(paged);
        return;
      }

      // Fallback to network fetch when no initial items are available
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
    }, [query, categoryParam, page, initialItems]);

  useEffect(() => {
    setPage(1);
  }, [categoryParam]);

  useEffect(() => {
    setPage(1);
  }, [query]);

  return (
    <div className="space-y-4 md:space-y-8">
      {/* 
        HEADER SECTION - Responsive text and layout:
        - space-y-2 md:space-y-4: Spacing between title and subtitle
      */}
      <div className="space-y-2 md:space-y-4">
        <div>
          {/* 
            TITLE - Responsive font size:
            - text-2xl sm:text-3xl: Title grows on larger screens
          */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Browse and manage your inventory</p>
        </div>
        
        {/* 
          SEARCH BOX - Responsive width:
          - w-full sm:w-96: Full width on mobile, fixed width on larger screens
        */}
        <div className="w-full sm:w-96 relative">
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Search by name or SKU..."
            aria-label="Search products"
            className="w-full bg-white border border-gray-300 rounded-lg py-2.5 pl-10 pr-4 text-sm sm:text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {items.length === 0 && !loading ? (
        <div className="py-12 text-center text-gray-500">
          No products found.
        </div>
      ) : (
        <>
          {/* 
            GRID LAYOUT - Fully responsive columns:
            - grid-cols-1: 1 column on extra small screens (mobile)
            - sm:grid-cols-2: 2 columns on small screens (landscape mobile)
            - md:grid-cols-3: 3 columns on medium screens (tablet)
            - lg:grid-cols-4: 4 columns on large screens (desktop)
            - xl:grid-cols-5: 5 columns on extra large screens
            - gap-3 sm:gap-4 md:gap-5 lg:gap-6: Responsive gap spacing
          */}
          <div className="relative">
            <div
              className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5 lg:gap-6 transition-opacity ${
                loading ? "opacity-60" : "opacity-100"
              }`}
            >
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
            {loading && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="h-8 w-8 rounded-full border-2 border-gray-300 border-t-transparent animate-spin" />
              </div>
            )}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center mt-12 space-x-4">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  page <= 1
                    ? "text-gray-300 cursor-not-allowed bg-gray-100 border border-gray-200"
                    : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                }`}
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  page >= totalPages
                    ? "text-gray-300 cursor-not-allowed bg-gray-100 border border-gray-200"
                    : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
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
