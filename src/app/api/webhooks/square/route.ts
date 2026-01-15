import { NextRequest, NextResponse } from "next/server";
import { corsPreflight, withCorsResponse } from "../../../../lib/api/cors";
import { verifySquareSignature } from "../../../../lib/square/webhook";

export async function OPTIONS() {
  return corsPreflight();
}

export async function POST(req: NextRequest) {
  const url = req.nextUrl.toString();
  const signature = req.headers.get("x-square-hmacsha256-signature");
  const bodyText = await req.text();

  const valid = verifySquareSignature({
    url,
    body: bodyText,
    signature,
  });

  if (!valid) {
    const response = NextResponse.json(
      { error: "Invalid signature" },
      { status: 401 }
    );
    return withCorsResponse(response);
  }

  const event = JSON.parse(bodyText);

  const response = NextResponse.json({ received: true, type: event.type });
  return withCorsResponse(response);
}

