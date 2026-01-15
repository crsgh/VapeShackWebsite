import { connectMongo } from "../lib/mongodb";
import { Order, OrderDocument, OrderItem } from "../models/Order";
import { CartItemInput, checkStockForCart } from "./inventoryService";
import { getSquareClient } from "../lib/square/client";
import { config } from "../lib/config";
import { clearInventoryCache } from "../lib/cache";

export type CheckoutItemInput = CartItemInput & {
  catalogObjectId: string;
  name: string;
  sku: string | null;
  unitPrice: number;
  currency: string;
};

export type CheckoutInput = {
  userId: string;
  items: CheckoutItemInput[];
  shippingAddress?: {
    fullName: string;
    line1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  paymentMethod?: string;
};

export type CheckoutResult = {
  order: OrderDocument;
  stockOk: boolean;
};

export async function checkout(input: CheckoutInput): Promise<CheckoutResult> {
  const stockCheck = await checkStockForCart(
    input.items.map((item) => ({
      variationId: item.variationId,
      quantity: item.quantity,
    }))
  );

  if (!stockCheck.ok) {
    throw new Error("Insufficient stock for one or more items");
  }

  await connectMongo();

  const totalAmount = input.items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  const currency = "PHP";

  const orderItems: OrderItem[] = input.items.map((item) => ({
    catalogObjectId: item.catalogObjectId,
    variationId: item.variationId,
    name: item.name,
    sku: item.sku,
    unitPrice: item.unitPrice,
    currency: "PHP",
    quantity: item.quantity,
  }));

  const order = await Order.create({
    userId: input.userId,
    items: orderItems,
    totalAmount,
    currency,
    status: "pending",
  });

  return {
    order,
    stockOk: true,
  };
}

export async function completeOrder(orderId: string): Promise<OrderDocument> {
  await connectMongo();

  const order = await Order.findById(orderId);
  if (!order) {
    throw new Error("Order not found");
  }

  if (order.status !== "pending") {
    throw new Error("Order is not pending");
  }

  const client = getSquareClient();

  if (!config.square.locationId) {
    throw new Error("Square locationId is not configured");
  }

  const lineItems = order.items.map((item: OrderItem) => ({
    quantity: item.quantity.toString(),
    catalogObjectId: item.variationId,
    basePriceMoney: {
      amount: BigInt(item.unitPrice),
      currency: "PHP",
    },
    name: item.name,
  }));

  console.log("[orderService] creating square order", {
    locationId: config.square.locationId,
    lineItemsCount: lineItems.length,
    lineItems: lineItems.map((li: any) => ({ ...li, basePriceMoney: { ...li.basePriceMoney, amount: li.basePriceMoney.amount.toString() } })),
  });

  let squareOrderId: string | undefined;
  try {
    const squareOrderResponse = await client.orders.create({
      order: {
        locationId: config.square.locationId as string,
        lineItems,
      },
    });

    squareOrderId = squareOrderResponse?.order?.id;
    console.log("[orderService] square order created", { squareOrderId });
  } catch (err) {
    console.error("[orderService] square createOrder failed:", err);
    throw new Error("Square createOrder failed: " + (err instanceof Error ? err.message : String(err)));
  }

  order.squareOrderId = squareOrderId;

  // Mark order as fulfilled
  order.status = "fulfilled";
  await order.save();

  // Clear inventory cache so customers see updated quantities
  clearInventoryCache();

  console.log(`[orderService] order ${orderId} completed with squareOrderId ${squareOrderId}`);

  return order;
}
