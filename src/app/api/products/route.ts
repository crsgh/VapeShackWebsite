import { NextRequest, NextResponse } from "next/server";
import { inferCategory } from "../../../lib/categories";
import { corsPreflight, withCorsResponse } from "../../../lib/api/cors";
import { getInventoryAndCategories } from "../../../lib/cache";

export async function OPTIONS() {
  return corsPreflight();
}

export async function GET(req: NextRequest) {
  try {
    const { items } = await getInventoryAndCategories();
    const availableItems = items.filter((item) => item.availableQuantity > 0);
    const sortedItems = [...availableItems].sort((a, b) => {
      const byName = a.name.localeCompare(b.name);
      if (byName !== 0) return byName;
      return a.variationId.localeCompare(b.variationId);
    });

    const searchParams = req.nextUrl.searchParams;
    const q = searchParams.get("q");
    const category = searchParams.get("category");
    const pageParam = searchParams.get("page");
    const pageSizeParam = searchParams.get("pageSize");

    const page = Math.max(
      1,
      Number.isNaN(Number(pageParam)) ? 1 : parseInt(pageParam || "1", 10)
    );
    const pageSizeRaw = Number.isNaN(Number(pageSizeParam))
      ? 20
      : parseInt(pageSizeParam || "20", 10);
    const pageSize = Math.min(Math.max(pageSizeRaw, 1), 100);

    let filtered = sortedItems;

    if (q) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(q.toLowerCase())
      );
    }

    if (category) {
      filtered = filtered.filter(
        (item) => inferCategory(item.name) === category
      );
    }

    const total = filtered.length;
    const totalPages = total === 0 ? 1 : Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const pagedItems = filtered.slice(start, start + pageSize);

    const response = NextResponse.json({
      items: pagedItems,
      total,
      totalPages,
    });
    return withCorsResponse(response);
  } catch {
    const response = NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
    return withCorsResponse(response);
  }
}

