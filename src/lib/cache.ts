import { inferCategory } from "./categories";
import type { InventoryItem } from "./square/inventory";
import { connectMongo } from "./mongodb";
import { Product } from "../models/Product";
import type { ProductDocument } from "../models/Product";

type CachedData = {
  items: InventoryItem[];
  categories: Array<{ name: string }>;
  timestamp: number;
};

const CACHE_DURATION = 15000;
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
    .filter(([, quantity]) => quantity > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => ({ name }));

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
  const existing = getCachedInventoryAndCategories();
  if (existing) {
    return existing;
  }
  await connectMongo();
  type ProductLean = ProductDocument & {
    __v?: number;
    createdAt?: Date;
    updatedAt?: Date;
  };
  const docs = (await Product.find().lean()) as ProductLean[];
  const items: InventoryItem[] = docs.map((doc: ProductLean) => ({
    catalogObjectId: doc.catalogObjectId,
    variationId: doc.variationId,
    name: doc.name,
    sku: doc.sku ?? null,
    priceMoney: doc.priceMoney,
    availableQuantity: doc.availableQuantity,
    categoryName: doc.categoryName ?? null,
    imageUrl: doc.imageUrl ?? null,
  }));
  const filtered = items.filter((item) => {
    const name = item.name.toLowerCase();
    const category = (item.categoryName || "").toLowerCase();
    if (name.includes("ace 25") && category.includes("juice")) {
      return false;
    }
    return true;
  });
  const { items: cachedItems, categories } =
    setCachedInventoryAndCategories(filtered);
  return {
    items: cachedItems,
    categories,
  };
}
