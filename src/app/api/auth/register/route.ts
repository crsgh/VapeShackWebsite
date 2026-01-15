import { NextRequest, NextResponse } from "next/server";
import { corsPreflight, withCorsResponse } from "../../../../lib/api/cors";
import { register } from "../../../../services/authService";

export async function OPTIONS() {
  return corsPreflight();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name, dob } = body;

    const result = await register({ email, password, name, dob });

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
    const message =
      error instanceof Error ? error.message : "Registration failed";
    const response = NextResponse.json(
      { error: message },
      { status: 400 }
    );
    return withCorsResponse(response);
  }
}
