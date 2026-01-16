import { NextRequest, NextResponse } from "next/server";
import { getInventoryAndCategories } from "../../../../lib/cache";
import { corsPreflight, withCorsResponse } from "../../../../lib/api/cors";

export async function OPTIONS() {
  return corsPreflight();
}

type RouteContext = {
  params: {
    variationId: string;
  };
};

export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const { items } = await getInventoryAndCategories();
    const item = items.find((i) => i.variationId === params.variationId);

    if (!item) {
      const response = NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
      return withCorsResponse(response);
    }

    const response = NextResponse.json({ item });
    return withCorsResponse(response);
  } catch {
    const response = NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
    return withCorsResponse(response);
  }
}
