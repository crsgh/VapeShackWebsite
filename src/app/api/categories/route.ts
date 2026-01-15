import { NextResponse } from "next/server";
import { fetchInventory } from "@/lib/square/inventory";
import { getCachedInventoryAndCategories, setCachedInventoryAndCategories } from "@/lib/mongodbCache";
import { inferCategory } from "@/lib/categories";

export async function GET() {
  try {
    // Check MongoDB cache first
    const cached = await getCachedInventoryAndCategories();
    if (cached) {
      return NextResponse.json({ categories: cached.categories });
    }

    // If not cached, fetch and cache
    const items = await fetchInventory();
    await setCachedInventoryAndCategories(items);

    // Compute inferred categories from items
    const categoriesSet = new Set<string>();
    items.forEach((item) => {
      const inferred = inferCategory(item.name);
      if (inferred !== "Unknown") {
        categoriesSet.add(inferred);
      }
    });
    const categories = Array.from(categoriesSet).sort();

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
