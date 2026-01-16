import { NextRequest, NextResponse } from "next/server";
import { corsPreflight, withCorsResponse } from "@/lib/api/cors";
import { verifyAccessToken } from "@/services/authService";
import { connectMongo } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { clearInventoryCache } from "@/lib/cache";

export async function OPTIONS() {
  return corsPreflight();
}

function normalizeHeader(label: string) {
  return label.trim().toLowerCase().replace(/[\s_-]+/g, "");
}

function parseCsv(text: string) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length < 2) {
    return [];
  }

  const firstLine = lines[0];
  let delimiter = ",";
  if (firstLine.includes(";") && !firstLine.includes(",")) {
    delimiter = ";";
  } else if (firstLine.includes("\t")) {
    delimiter = "\t";
  }

  const header = firstLine
    .split(delimiter)
    .map((h) => normalizeHeader(h));

  const findIndex = (candidates: string[]) =>
    header.findIndex((h) => candidates.includes(h));

  const idxVariationId = findIndex([
    "variationid",
    "itemvariationid",
    "itemvariation",
    "id",
    "token",
  ]);
  const idxName = findIndex([
    "name",
    "itemname",
    "productname",
    "customerfacingname",
    "variationname",
  ]);
  const idxSku = findIndex(["sku", "skucode"]);
  const idxPrice = findIndex(["price", "unitprice", "unitamount"]);
  const idxQuantity = findIndex([
    "availablequantity",
    "quantity",
    "qty",
    "stock",
    "currentquantityvsweb",
    "newquantityvsweb",
  ]);
  const idxCategory = findIndex([
    "categoryname",
    "category",
    "categorylabel",
  ]);
  const idxImageUrl = findIndex([
    "imageurl",
    "image",
    "image_link",
    "imagelink",
  ]);

  const records: {
    variationId: string;
    name: string;
    sku: string | null;
    price: number;
    quantity: number;
    categoryName: string | null;
    imageUrl: string | null;
  }[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(delimiter).map((c) => c.trim());
    const variationId =
      idxVariationId >= 0 ? cols[idxVariationId] || "" : "";
    const name = idxName >= 0 ? cols[idxName] || "" : "";
    if (!variationId || !name) {
      continue;
    }

    const sku =
      idxSku >= 0 && cols[idxSku] ? cols[idxSku] : null;

    const priceRaw = idxPrice >= 0 ? cols[idxPrice] || "" : "";
    const priceFloat = priceRaw ? parseFloat(priceRaw) : 0;
    const price = Number.isFinite(priceFloat)
      ? Math.round(priceFloat * 100)
      : 0;

    const qtyRaw =
      idxQuantity >= 0 ? cols[idxQuantity] || "" : "";
    const quantity = qtyRaw ? parseInt(qtyRaw, 10) || 0 : 0;

    const categoryName =
      idxCategory >= 0 && cols[idxCategory]
        ? cols[idxCategory]
        : null;

    const imageUrl =
      idxImageUrl >= 0 && cols[idxImageUrl]
        ? cols[idxImageUrl]
        : null;

    records.push({
      variationId,
      name,
      sku,
      price,
      quantity,
      categoryName,
      imageUrl,
    });
  }

  return records;
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

    if (user.role !== "admin") {
      const response = NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
      return withCorsResponse(response);
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      const response = NextResponse.json(
        { error: "Missing file field in form-data" },
        { status: 400 }
      );
      return withCorsResponse(response);
    }

    const text = await (file as Blob).text();
    const records = parseCsv(text);

    if (!records.length) {
      const response = NextResponse.json(
        { error: "No valid rows found in CSV" },
        { status: 400 }
      );
      return withCorsResponse(response);
    }

    await connectMongo();

    const bulkOps = records.map((r) => ({
      updateOne: {
        filter: { variationId: r.variationId },
        update: {
          $set: {
            variationId: r.variationId,
            name: r.name,
            sku: r.sku,
            priceMoney: {
              amount: r.price,
              currency: "PHP",
            },
            availableQuantity: r.quantity,
            categoryName: r.categoryName,
            imageUrl: r.imageUrl,
          },
        },
        upsert: true,
      },
    }));

    const result = await Product.bulkWrite(bulkOps);

    clearInventoryCache();

    const response = NextResponse.json({
      success: true,
      matched: result.matchedCount,
      modified: result.modifiedCount,
      upserted: result.upsertedCount,
      totalProcessed: records.length,
    });
    return withCorsResponse(response);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Import failed";
    const response = NextResponse.json(
      { error: message },
      { status: 500 }
    );
    return withCorsResponse(response);
  }
}
