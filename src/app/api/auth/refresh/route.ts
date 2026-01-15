import { NextRequest, NextResponse } from "next/server";
import { corsPreflight, withCorsResponse } from "../../../../lib/api/cors";
import { refreshTokens } from "../../../../services/authService";

export async function OPTIONS() {
  return corsPreflight();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { refreshToken } = body;

    const tokens = refreshTokens(refreshToken);

    const response = NextResponse.json({ tokens });
    return withCorsResponse(response);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Token refresh failed";
    const response = NextResponse.json(
      { error: message },
      { status: 401 }
    );
    return withCorsResponse(response);
  }
}
