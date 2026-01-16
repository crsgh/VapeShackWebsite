import { NextResponse } from "next/server";

export async function GET(request: Request) {
  return NextResponse.json({
    success: true,
    message: "Inventory MongoDB caching has been disabled; this endpoint is no longer used.",
  });
}
