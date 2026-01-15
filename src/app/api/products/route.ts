import { NextRequest, NextResponse } from "next/server";
import { fetchInventory } from "../../../lib/square/inventory";
import { inferCategory } from "../../../lib/categories";
import { corsPreflight, withCorsResponse } from "../../../lib/api/cors";
import { getCachedInventoryAndCategories, setCachedInventoryAndCategories } from "../../../lib/mongodbCache";

export async function OPTIONS() {
  return corsPreflight();
}

export async function GET(req: NextRequest) {
  try {
    // Prefer MongoDB cached items if available
    const cached = await getCachedInventoryAndCategories();
    const items = cached ? cached.items : await fetchInventory();
    console.log("[Products API] cachePresent=", Boolean(cached), "itemsCount=", items.length);
    if (!cached) {
      // Store freshly fetched items in cache for next requests
      await setCachedInventoryAndCategories(items);
    }

    const searchParams = req.nextUrl.searchParams;
    const q = searchParams.get("q");
    const category = searchParams.get("category");

    let filtered = items;
    console.log("[Products API] beforeFilter count=", filtered.length);

    // Filter by search query
    if (q) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(q.toLowerCase())
      );
    }

    // Filter by inferred category (matching by name, not Square category ID)
    if (category) {
      filtered = filtered.filter((item) =>
        inferCategory(item.name) === category
      );
    }

    const response = NextResponse.json({ items: filtered });
    return withCorsResponse(response);
  } catch {
    const response = NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
    return withCorsResponse(response);
  }
}

