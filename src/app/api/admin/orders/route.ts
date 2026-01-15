import { NextRequest, NextResponse } from "next/server";
import { corsPreflight, withCorsResponse } from "@/lib/api/cors";
import { verifyAccessToken } from "@/services/authService";
import { connectMongo } from "@/lib/mongodb";
import { Order } from "@/models/Order";

export async function OPTIONS() {
  return corsPreflight();
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      const response = NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
      return withCorsResponse(response);
    }

    const token = authHeader.replace("Bearer ", "");
    const user = verifyAccessToken(token);

    if (user.role !== "admin") {
      const response = NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
      return withCorsResponse(response);
    }

    await connectMongo();

    const orders = await Order.find().sort({ createdAt: -1 }).lean();

    const response = NextResponse.json({ orders });
    return withCorsResponse(response);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to load orders";
    const response = NextResponse.json(
      { error: message },
      { status: 500 }
    );
    return withCorsResponse(response);
  }
}

