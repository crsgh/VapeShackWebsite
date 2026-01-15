import { Schema, model, models, Types } from "mongoose";

export type OrderStatus =
  | "pending"
  | "paid"
  | "failed"
  | "cancelled"
  | "fulfilled";

export type OrderItem = {
  catalogObjectId: string;
  variationId: string;
  name: string;
  sku: string | null;
  unitPrice: number;
  currency: string;
  quantity: number;
};

export type OrderDocument = {
  _id: string;
  userId: Types.ObjectId;
  items: OrderItem[];
  totalAmount: number;
  currency: string;
  status: OrderStatus;
  squareOrderId?: string;
  shippingAddress?: {
    fullName: string;
    line1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  paymentMethod?: string;
  createdAt: Date;
  updatedAt: Date;
};

const OrderItemSchema = new Schema<OrderItem>(
  {
    catalogObjectId: { type: String, required: true },
    variationId: { type: String, required: true },
    name: { type: String, required: true },
    sku: { type: String },
    unitPrice: { type: Number, required: true },
    currency: { type: String, required: true },
    quantity: { type: Number, required: true },
  },
  { _id: false }
);

const OrderSchema = new Schema<OrderDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [OrderItemSchema], required: true },
    totalAmount: { type: Number, required: true },
    currency: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "cancelled", "fulfilled"],
      default: "pending",
    },
    squareOrderId: { type: String },
    shippingAddress: {
      fullName: { type: String },
      line1: { type: String },
      city: { type: String },
      state: { type: String },
      postalCode: { type: String },
      country: { type: String },
    },
    paymentMethod: { type: String },
  },
  { timestamps: true }
);

export const Order =
  models.Order || model<OrderDocument>("Order", OrderSchema);
