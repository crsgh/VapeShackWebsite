import { fetchInventoryForVariations } from "../lib/square/inventory";

export type CartItemInput = {
  variationId: string;
  quantity: number;
};

export type StockCheckResult = {
  ok: boolean;
  insufficientItems: {
    variationId: string;
    requested: number;
    available: number;
  }[];
};

export async function checkStockForCart(
  items: CartItemInput[]
): Promise<StockCheckResult> {
  const variationIds = items.map((i) => i.variationId);
  const counts = await fetchInventoryForVariations(variationIds);

  const insufficientItems: StockCheckResult["insufficientItems"] = [];

  items.forEach((item) => {
    const available = counts.get(item.variationId) || 0;
    if (item.quantity > available) {
      insufficientItems.push({
        variationId: item.variationId,
        requested: item.quantity,
        available,
      });
    }
  });

  return {
    ok: insufficientItems.length === 0,
    insufficientItems,
  };
}
