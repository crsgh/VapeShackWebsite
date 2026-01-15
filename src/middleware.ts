import { NextRequest, NextResponse } from "next/server";

const AGE_COOKIE_NAME = "ageVerified";

const publicRoutes = [
  "/age-gate",
  "/api/webhooks/square",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/refresh",
  "/api/products",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/assets")
  ) {
    return NextResponse.next();
  }

  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  const ageVerified = req.cookies.get(AGE_COOKIE_NAME)?.value;

  if (ageVerified === "true") {
    return NextResponse.next();
  }

  const url = req.nextUrl.clone();
  url.pathname = "/age-gate";
  // Preserve full original path + query string so category filter stays intact
  const fullPathWithQuery = req.nextUrl.pathname + req.nextUrl.search;
  url.searchParams.set("from", fullPathWithQuery || pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

