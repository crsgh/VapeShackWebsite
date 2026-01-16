import { NextRequest, NextResponse } from "next/server";
import { corsPreflight, withCorsResponse } from "@/lib/api/cors";
import { verifyAccessToken } from "@/services/authService";
import { connectMongo } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { clearInventoryCache } from "@/lib/cache";
import { fetchInventory } from "@/lib/square/inventory";
import { config } from "@/lib/config";

export async function OPTIONS() {
  return corsPreflight();
}

export async function POST(req: NextRequest) {
  try {
    const cronSecretHeader = req.headers.get("x-sync-square-secret");
    const hasValidCronSecret =
      cronSecretHeader &&
      config.tasks.syncSquareSecret &&
      cronSecretHeader === config.tasks.syncSquareSecret;

    if (!hasValidCronSecret) {
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
    }

    await connectMongo();

    const items = await fetchInventory();

    if (!items.length) {
      const response = NextResponse.json(
        { error: "No items returned from Square" },
        { status: 500 }
      );
      return withCorsResponse(response);
    }

    const existingDocs = await Product.find({}, { variationId: 1 }).lean();
    const existingIds = new Set<string>(
      existingDocs
        .map((doc) => doc.variationId)
        .filter((id): id is string => typeof id === "string")
    );

    const bulkOps: Parameters<typeof Product.bulkWrite>[0] = [];
    const newIds = new Set<string>();

    for (const item of items) {
      newIds.add(item.variationId);
      bulkOps.push({
        updateOne: {
          filter: { variationId: item.variationId },
          update: {
            $set: {
              catalogObjectId: item.catalogObjectId,
              variationId: item.variationId,
              name: item.name,
              sku: item.sku,
              priceMoney: item.priceMoney,
              availableQuantity: item.availableQuantity,
              categoryName: item.categoryName,
              imageUrl: item.imageUrl,
            },
          },
          upsert: true,
        },
      });
    }

    const zeroedIds: string[] = [];

    existingIds.forEach((id) => {
      if (!newIds.has(id)) {
        zeroedIds.push(id);
        bulkOps.push({
          updateOne: {
            filter: { variationId: id },
            update: {
              $set: {
                availableQuantity: 0,
              },
            },
            upsert: false,
          },
        });
      }
    });

    let result: Awaited<ReturnType<typeof Product.bulkWrite>> | null = null;
    if (bulkOps.length > 0) {
      result = await Product.bulkWrite(bulkOps);
    }

    clearInventoryCache();

    const response = NextResponse.json({
      success: true,
      synced: items.length,
      zeroed: zeroedIds.length,
      matched: result ? result.matchedCount : 0,
      modified: result ? result.modifiedCount : 0,
      upserted: result ? result.upsertedCount : 0,
    });
    return withCorsResponse(response);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Sync from Square failed";
    const response = NextResponse.json(
      { error: message },
      { status: 500 }
    );
    return withCorsResponse(response);
  }
}
