import { NextRequest, NextResponse } from "next/server";
import { corsPreflight, withCorsResponse } from "../../../../lib/api/cors";
import { login } from "../../../../services/authService";

export async function OPTIONS() {
  return corsPreflight();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    const result = await login({ email, password });

    const response = NextResponse.json({
      user: {
        id: result.user._id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
        dob: result.user.dob.toISOString(),
      },
      tokens: result.tokens,
    });

    return withCorsResponse(response);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Login failed";
    const response = NextResponse.json(
      { error: message },
      { status: 401 }
    );
    return withCorsResponse(response);
  }
}
