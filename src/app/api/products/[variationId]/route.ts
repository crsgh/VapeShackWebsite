import { NextRequest, NextResponse } from "next/server";
import { fetchInventory } from "../../../../lib/square/inventory";
import { corsPreflight, withCorsResponse } from "../../../../lib/api/cors";

type Params = {
  params: {
    variationId: string;
  };
};

export async function OPTIONS() {
  return corsPreflight();
}

export async function GET(_req: NextRequest, context: any) {
  try {
    // unwrap params which may be a Promise in newer Next versions
    let params: { variationId: string } = context.params;
    if (params && typeof (params as any).then === "function") {
      params = await params;
    }

    const items = await fetchInventory();
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
