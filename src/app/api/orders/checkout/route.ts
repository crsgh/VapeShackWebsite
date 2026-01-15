import { NextRequest, NextResponse } from "next/server";
import { corsPreflight, withCorsResponse } from "../../../../lib/api/cors";
import { checkout } from "../../../../services/orderService";
import { verifyAccessToken } from "../../../../services/authService";

export async function OPTIONS() {
  return corsPreflight();
}

export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const { items, shippingAddress, paymentMethod } = body;

    const result = await checkout({
      userId: user.id,
      items,
      shippingAddress,
      paymentMethod,
    });

    const response = NextResponse.json({
      orderId: result.order._id,
      squareOrderId: result.order.squareOrderId,
      status: result.order.status,
    });

    return withCorsResponse(response);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Checkout failed";
    const response = NextResponse.json(
      { error: message },
      { status: 400 }
    );
    return withCorsResponse(response);
  }
}

