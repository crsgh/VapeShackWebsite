import { NextResponse } from "next/server";
import { fetchInventory } from "@/lib/square/inventory";
import { setCachedInventoryAndCategories, clearCache } from "@/lib/mongodbCache";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    if (action === "clear") {
      await clearCache();
      return NextResponse.json({
        success: true,
        message: "Cache cleared successfully",
      });
    }

    // Default: refresh cache
    console.log("[API] Refreshing inventory cache from Square...");
    const start = Date.now();
    const items = await fetchInventory();
    const fetchTime = Date.now() - start;

    await setCachedInventoryAndCategories(items);

    return NextResponse.json({
      success: true,
      message: "Cache refreshed successfully",
      itemCount: items.length,
      fetchTimeMs: fetchTime,
    });
  } catch (error) {
    console.error("[API] Cache refresh error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
