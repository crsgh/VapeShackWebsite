import type * as Square from "square";
import { getSquareClient } from "./client";
import { config } from "../config";

function isCatalogItem(
  obj: Square.CatalogObject
): obj is Square.CatalogObjectItem & {
  type: "ITEM";
  itemData: Square.CatalogItem;
} {
  return obj.type === "ITEM" && Boolean((obj as Square.CatalogObjectItem).itemData);
}

function isItemVariation(
  obj: Square.CatalogObject
): obj is Square.CatalogObjectItemVariation & {
  type: "ITEM_VARIATION";
  itemVariationData: Square.CatalogItemVariation;
} {
  return (
    obj.type === "ITEM_VARIATION" &&
    Boolean((obj as Square.CatalogObjectItemVariation).itemVariationData)
  );
}

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

function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

async function fetchCategoryMap(): Promise<Map<string, string>> {
  const client = getSquareClient();
  const categoryMap = new Map<string, string>();

  try {
    const catalogResponse = await client.catalog.list({ types: "CATEGORY" });
    const categories: Square.CatalogObject[] = [...(catalogResponse.data ?? [])];

    while (catalogResponse.hasNextPage()) {
      await catalogResponse.getNextPage();
      categories.push(...(catalogResponse.data ?? []));
    }

    categories.forEach((cat) => {
      if (cat.type === "CATEGORY" && cat.id) {
        const categoryData = (cat as any).categoryData;
        if (categoryData?.name) {
          categoryMap.set(cat.id, categoryData.name);
        }
      }
    });
  } catch (err) {
    console.error("Failed to fetch categories:", err);
  }

  return categoryMap;
}

export async function fetchInventory(
  options?: { maxCatalogObjects?: number }
): Promise<InventoryItem[]> {
  const client = getSquareClient();
  const categoryMap = await fetchCategoryMap();

  // Square list endpoints are paginated (default 100).
  // Optionally stop early once a maximum number of catalog objects is loaded.
  const firstPage = await client.catalog.list({ types: "ITEM" });
  const objects: Square.CatalogObject[] = [...(firstPage.data ?? [])];

  while (firstPage.hasNextPage()) {
    if (options?.maxCatalogObjects && objects.length >= options.maxCatalogObjects) {
      break;
    }
    await firstPage.getNextPage();
    objects.push(...(firstPage.data ?? []));
  }

  console.log(
    `[Inventory] Catalog objects fetched: ${objects.length}${
      options?.maxCatalogObjects ? ` (limit ${options.maxCatalogObjects})` : ""
    }`
  );
  const variationIds: string[] = [];

  objects.filter(isCatalogItem).forEach((obj) => {
    const variations = obj.itemData.variations || [];
    variations.forEach((variation: Square.CatalogObject) => {
      if (variation.id) {
        variationIds.push(variation.id);
      }
    });
  });

  if (!variationIds.length) {
    return [];
  }

  const counts: Square.InventoryCount[] = [];

  const locationIds = config.square.locationId
    ? [config.square.locationId]
    : undefined;

  // Batch counts in chunks to respect API limits - use Promise.all for parallel requests
  const chunks = chunk(variationIds, 100);
  const countResponses = await Promise.all(
    chunks.map((idsChunk) =>
      client.inventory.batchGetCounts({
        catalogObjectIds: idsChunk,
        locationIds,
      })
    )
  );

  countResponses.forEach((response) => {
    counts.push(...(response.data ?? []));
  });

  const countMap = new Map<string, number>();

  counts.forEach((count) => {
    if (!count.catalogObjectId) return;
    const quantity = Number(count.quantity || "0");
    const existing = countMap.get(count.catalogObjectId) || 0;
    countMap.set(count.catalogObjectId, existing + quantity);
  });

  const items: InventoryItem[] = [];

  objects.filter(isCatalogItem).forEach((obj) => {
    if (!obj.id) return;
    const variations = obj.itemData.variations || [];
    const imageUrl = obj.itemData.ecomImageUris?.[0] ?? null;
    const categoryId = obj.itemData.categoryId || null;
    const categoryName = categoryId ? categoryMap.get(categoryId) || null : null;

    variations.filter(isItemVariation).forEach((variation) => {
      if (!variation.id) return;
      const variationData = variation.itemVariationData;
      if (!variationData || !variationData.priceMoney) return;

      const availableQuantity = countMap.get(variation.id) || 0;

      // Only include items with quantity > 0
      if (availableQuantity > 0) {
        items.push({
          catalogObjectId: obj.id,
          variationId: variation.id,
          name: obj.itemData.name || "",
          sku: variationData.sku || null,
          priceMoney: {
            amount: Number(variationData.priceMoney.amount || 0),
            currency: variationData.priceMoney.currency || "USD",
          },
          imageUrl,
          availableQuantity,
          categoryName,
        });
      }
    });
  });

  return items;
}

export async function fetchInventoryForVariations(
  variationIds: string[]
): Promise<Map<string, number>> {
  if (!variationIds.length) {
    return new Map();
  }

  const client = getSquareClient();

  const counts: Square.InventoryCount[] = [];
  const locationIds = config.square.locationId
    ? [config.square.locationId]
    : undefined;

  for (const idsChunk of chunk(variationIds, 100)) {
    const inventoryResponse = await client.inventory.batchGetCounts({
      catalogObjectIds: idsChunk,
      locationIds,
    });
    counts.push(...(inventoryResponse.data ?? []));
  }

  const countMap = new Map<string, number>();

  counts.forEach((count) => {
    if (!count.catalogObjectId) return;
    const quantity = Number(count.quantity || "0");
    const existing = countMap.get(count.catalogObjectId) || 0;
    countMap.set(count.catalogObjectId, existing + quantity);
  });

  return countMap;
}

export async function fetchProductByVariationId(
  variationId: string
): Promise<InventoryItem | null> {
  const items = await fetchInventory();
  return items.find((item) => item.variationId === variationId) || null;
}
