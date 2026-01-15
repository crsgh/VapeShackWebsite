import { Schema, model, models } from "mongoose";
import type { InventoryItem } from "../lib/square/inventory";

export type CachedInventoryDocument = {
  _id: string;
  items: InventoryItem[];
  categories: string[];
  fetchedAt: Date;
  expiresAt: Date;
};

const ItemSchema = new Schema(
  {
    catalogObjectId: String,
    variationId: String,
    name: String,
    sku: String,
    priceMoney: {
      amount: Number,
      currency: String,
    },
    imageUrl: String,
    availableQuantity: Number,
    categoryName: String,
  },
  { _id: false, id: false }
);

const CachedInventorySchema = new Schema<CachedInventoryDocument>(
  {
    _id: { type: String, required: true },
    items: [ItemSchema],
    categories: [String],
    fetchedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, default: () => new Date(Date.now() + 10 * 60 * 1000) }, // 10 minutes
  },
  { timestamps: false }
);

// TTL index - automatically delete expired cache documents
CachedInventorySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const CachedInventory =
  models.CachedInventory ||
  model<CachedInventoryDocument>("CachedInventory", CachedInventorySchema);
