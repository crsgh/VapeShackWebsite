import { Schema, model, models } from "mongoose";
import type { InventoryItem } from "../lib/square/inventory";

export type ProductDocument = InventoryItem & {
  _id: string;
};

const ProductSchema = new Schema<ProductDocument>(
  {
    catalogObjectId: { type: String },
    variationId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    sku: { type: String },
    priceMoney: {
      amount: { type: Number, required: true },
      currency: { type: String, required: true, default: "PHP" },
    },
    imageUrl: { type: String },
    availableQuantity: { type: Number, required: true, default: 0 },
    categoryName: { type: String },
  },
  { timestamps: true }
);

export const Product =
  models.Product || model<ProductDocument>("Product", ProductSchema);

