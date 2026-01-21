"use client";

import React from "react";

type Props = {
  initialCategories: { name: string }[];
};

export default function CategoryFilter({ initialCategories }: Props) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const base = window.location.pathname;
    if (!val) {
      window.location.href = base;
      return;
    }
    const url = `${base}?category=${encodeURIComponent(val)}`;
    window.location.href = url;
  };

  const filtered = initialCategories.filter(c => (c.name || "").toLowerCase() !== "accessories");

  return (
    <div className="md:hidden">
      <label htmlFor="mobile-category" className="sr-only">
        Filter by category
      </label>
      <div className="relative">
        <select
          id="mobile-category"
          onChange={handleChange}
          defaultValue=""
          className="block w-full rounded-md border border-gray-200 bg-white py-2 pl-3 pr-8 text-sm text-gray-700 focus:border-gray-300"
        >
          <option value="">All Categories</option>
          {filtered.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <svg className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="none" aria-hidden>
            <path d="M7 7l3 3 3-3" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}
