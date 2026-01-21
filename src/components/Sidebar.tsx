"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

type Category = {
  name: string;
};

type SidebarProps = {
  initialCategories: Category[];
};

export default function Sidebar({ initialCategories }: SidebarProps) {
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category") || "";

  const filteredCategories = initialCategories.filter(c => (c.name || "").toLowerCase() !== "accessories");

  return (
    <>
      {/* 
        SIDEBAR - Responsive visibility:
        - hidden md:block: Sidebar is hidden on mobile, visible on medium screens and up
        - w-56: Fixed width (224px)
        - fixed: Fixed positioning to stay while scrolling
        - left-0 top-0: Position at top-left
        - pt-20: Top padding to account for navbar
        - bg-white border-r: White background with right border
        - min-h-screen: Full height
        - overflow-y-auto: Scrollable if content overflows
      */}
      <aside className="hidden md:block w-56 bg-white border-r border-gray-200 min-h-screen fixed left-0 top-0 overflow-y-auto pt-20">
      <div className="px-4 py-6 space-y-8">
        {/* Products Section */}
        <div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-3">
            Categories
          </h2>
          <ul className="space-y-1">
            <li>
              <Link
                href="/products"
                className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  !currentCategory
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                All Products
              </Link>
            </li>
            {filteredCategories.length === 0 ? (
              <li className="px-4 py-2 text-gray-400 text-sm">No categories found</li>
            ) : (
              filteredCategories.map((category) => {
                const href = `/products?category=${encodeURIComponent(category.name)}`;
                const isActive = currentCategory === category.name;
                return (
                  <li key={category.name}>
                    <Link
                      href={href}
                      className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-gray-100 text-gray-900"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      {category.name}
                    </Link>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      </div>
    </aside>
    </>
  );
}
