import { NextRequest, NextResponse } from "next/server";
import { corsPreflight, withCorsResponse } from "@/lib/api/cors";
import { verifyAccessToken } from "@/services/authService";
import { completeOrder } from "@/services/orderService";

type Params = {
  params: {
    id: string;
  };
};

export async function OPTIONS() {
  return corsPreflight();
}

export async function POST(req: NextRequest, context: any) {
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

    // `params` may be a Promise in newer Next versions — unwrap if needed
    let params: { id: string } = context.params;
    if (params && typeof (params as any).then === "function") {
      params = await params;
    }

    const order = await completeOrder(params.id);

    const response = NextResponse.json({ order });
    return withCorsResponse(response);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to complete order";
    const response = NextResponse.json(
      { error: message },
      { status: 400 }
    );
    return withCorsResponse(response);
  }
}

