import { Schema, model, models, Types } from "mongoose";

export type AddressDocument = {
  _id: string;
  userId: Types.ObjectId;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
  createdAt: Date;
  updatedAt: Date;
};

const AddressSchema = new Schema<AddressDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    label: { type: String, required: true },
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    latitude: { type: Number },
    longitude: { type: Number },
  },
  { timestamps: true }
);

export const Address =
  models.Address || model<AddressDocument>("Address", AddressSchema);

