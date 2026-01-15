import { connectMongo } from "./mongodb";
import { CachedInventory } from "../models/CachedInventory";
import type { InventoryItem } from "./square/inventory";
import { inferCategory } from "./categories";

const CACHE_KEY = "inventory-cache";
const CACHE_TTL_MINUTES = 30; // Cache for 30 minutes - longer cache for faster loading

export async function getCachedInventoryAndCategories(): Promise<{
  items: InventoryItem[];
  categories: string[];
} | null> {
  try {
    await connectMongo();
    // Use lean() to return plain JS objects and avoid Mongoose doc prototypes
    const cached = await CachedInventory.findOne({ _id: CACHE_KEY }).lean();

    if (cached && cached.expiresAt > new Date()) {
      const sanitizedItems = (cached.items ?? []).map((item: any) => {
        const { _id, __v, ...rest } = item;
        return rest;
      });

      const categoriesSet = new Set<string>();
      sanitizedItems.forEach((item: any) => {
        const inferred = inferCategory(item.name);
        if (inferred !== "Unknown") {
          categoriesSet.add(inferred);
        }
      });
      const categories = Array.from(categoriesSet).sort();

      return {
        items: sanitizedItems as any,
        categories,
      };
    }

    return null;
  } catch (error) {
    return null;
  }
}

export async function setCachedInventoryAndCategories(
  items: InventoryItem[]
): Promise<void> {
  try {
    await connectMongo();

    // Compute unique inferred categories from item names
    const categoriesSet = new Set<string>();
    items.forEach((item) => {
      const inferred = inferCategory(item.name);
      if (inferred !== "Unknown") {
        categoriesSet.add(inferred);
      }
    });
    const categories = Array.from(categoriesSet).sort();

    const expiresAt = new Date(Date.now() + CACHE_TTL_MINUTES * 60 * 1000);

    await CachedInventory.updateOne(
      { _id: CACHE_KEY },
      {
        items,
        categories,
        fetchedAt: new Date(),
        expiresAt,
      },
      { upsert: true }
    );

    console.log(
      `[Cache] Stored: ${items.length} items cached until ${expiresAt.toISOString()}`
    );
  } catch (error) {
    console.error("[Cache] Error writing to MongoDB:", error);
  }
}

export async function clearCache(): Promise<void> {
  try {
    await connectMongo();
    await CachedInventory.deleteOne({ _id: CACHE_KEY });
    console.log("[Cache] Cleared: Inventory cache removed from MongoDB");
  } catch (error) {
    console.error("[Cache] Error clearing cache:", error);
  }
}
