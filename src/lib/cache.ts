import { inferCategory } from "./categories";

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
