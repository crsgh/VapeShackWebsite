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

  return (
    <aside className="w-[260px] flex-shrink-0 hidden md:block">
      <div className="sticky top-20 text-gray-900 pr-4">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
          Categories
        </h2>
        <ul className="space-y-1">
          <li>
            <Link
              href="/"
              className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                !currentCategory
                  ? "bg-gray-100 text-gray-900 font-medium"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              All Products
            </Link>
          </li>
          {initialCategories.length === 0 ? (
            <li className="px-3 py-2 text-gray-400 text-sm">No categories found</li>
          ) : (
            initialCategories.map((category) => {
              const href = `/?category=${encodeURIComponent(category.name)}`;
              const isActive = currentCategory === category.name;
              return (
                <li key={category.name}>
                  <Link
                    href={href}
                    className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive
                        ? "bg-gray-100 text-gray-900 font-medium"
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
    </aside>
  );
}
