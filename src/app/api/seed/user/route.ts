import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Seeding is disabled in production" },
      { status: 403 }
    );
  }

  try {
    await connectMongo();

    const email = process.env.SEED_USER_EMAIL || "seed.admin@vsvape.local";
    const password = process.env.SEED_USER_PASSWORD || "Admin123!";

    const existing = await User.findOne({ email });

    if (existing) {
      return NextResponse.json({
        created: false,
        email,
        password,
        id: existing._id,
      });
    }

    const dob = new Date("1990-01-01");
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      passwordHash,
      name: "Seed Admin",
      dob,
      role: "admin",
    });

    return NextResponse.json({
      created: true,
      email,
      password,
      id: user._id,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Seeding failed";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

