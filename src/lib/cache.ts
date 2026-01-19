import { inferCategory } from "./categories";
import { fetchInventory } from "./square/inventory";
import { getCachedInventoryAndCategories as getMongoCached } from "./mongodbCache";
import { connectMongo } from "./mongodb";
import { Product } from "../models/Product";

export type InventoryItem = {
  catalogObjectId: string;
  variationId: string;
  name: string;
  sku: string | null;
  priceMoney: {
    amount: number;
    currency: string;
  };
  imageUrl: string | null;
  availableQuantity: number;
  categoryName: string | null;
};

type CachedData = {
  items: InventoryItem[];
  categories: Array<{ name: string }>;
  timestamp: number;
};

const CACHE_DURATION = 1800000; // 30 minutes - longer cache for faster loading
let cachedData: CachedData | null = null;

export function getCachedInventoryAndCategories(): CachedData | null {
  if (
    cachedData &&
    Date.now() - cachedData.timestamp < CACHE_DURATION
  ) {
    return cachedData;
  }
  cachedData = null;
  return null;
}

export function clearInventoryCache(): void {
  console.log("[cache] Clearing inventory cache");
  cachedData = null;
}

export function setCachedInventoryAndCategories(
  items: InventoryItem[]
): CachedData {
  const categoryMap = new Map<string, number>();

  items.forEach((item) => {
    const category = inferCategory(item.name);
    if (category !== "Unknown") {
      const current = categoryMap.get(category) || 0;
      categoryMap.set(category, current + item.availableQuantity);
    }
  });

  const categories = Array.from(categoryMap.entries())
    .filter(([_, quantity]) => quantity > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([name, _]) => ({ name }));

  cachedData = {
    items,
    categories,
    timestamp: Date.now(),
  };

  return cachedData;
}

export async function getInventoryAndCategories(): Promise<{
  items: InventoryItem[];
  categories: Array<{ name: string }>;
}> {
  // 1) If Product documents were uploaded via the admin sync, use them as source-of-truth
  try {
    await connectMongo();
    const docs = await Product.find({}).lean();
    if (docs && docs.length > 0) {
      const items = docs.map((d: any) => ({
        catalogObjectId: d.catalogObjectId,
        variationId: d.variationId,
        name: d.name,
        sku: d.sku ?? null,
        priceMoney: d.priceMoney,
        imageUrl: d.imageUrl ?? null,
        availableQuantity: d.availableQuantity ?? 0,
        categoryName: d.categoryName ?? null,
      })) as InventoryItem[];

      // derive category list from stored categoryName or inferred categories
      const categorySet = new Set<string>();
      items.forEach((it) => {
        if (it.categoryName) categorySet.add(it.categoryName);
        else {
          const inferred = inferCategory(it.name);
          if (inferred !== "Unknown") categorySet.add(inferred);
        }
      });

      const categories = Array.from(categorySet).sort().map((name) => ({ name }));
      return { items, categories };
    }
  } catch (err) {
    // If Mongo is not configured or query fails, fall back to other caches
  }

  // 2) Try Mongo-backed cache collection (CachedInventory)
  try {
    const mongo = await getMongoCached();
    if (mongo) {
      const categoryObjs = (mongo.categories || []).map((name) => ({ name }));
      return { items: mongo.items as InventoryItem[], categories: categoryObjs };
    }
  } catch (err) {
    // ignore and fall back to local cache / fetch
  }

  // 3) Try in-memory cache
  const local = getCachedInventoryAndCategories();
  if (local) return local;

  // 4) Fallback: fetch from Square and populate in-memory cache
  // Prevent concurrent requests from issuing multiple parallel fetches to Square
  // by reusing an in-flight promise.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const globalAny = global as any;
  if (!globalAny.__inventoryFetchInFlight) {
    globalAny.__inventoryFetchInFlight = (async () => {
      try {
        const items = await fetchInventory();
        const cached = setCachedInventoryAndCategories(items);
        return cached;
      } finally {
        // clear the in-flight promise so future fetches can run when needed
        globalAny.__inventoryFetchInFlight = null;
      }
    })();
  }

  return await globalAny.__inventoryFetchInFlight;
}
