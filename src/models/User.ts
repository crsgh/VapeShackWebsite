import { Schema, model, models } from "mongoose";

export type UserRole = "customer" | "admin";

export type UserDocument = {
  _id: string;
  email: string;
  passwordHash: string;
  name: string;
  dob: Date;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
};

const UserSchema = new Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
    dob: { type: Date, required: true },
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
  },
  { timestamps: true }
);

export const User =
  models.User || model<UserDocument>("User", UserSchema);

