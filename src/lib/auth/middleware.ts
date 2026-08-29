import { type NextRequest, NextResponse } from "next/server";

/**
 * List of route prefixes that require an authenticated session.
 */
const PROTECTED_ROUTES = [
  "/dashboard",
  "/medicines",
  "/inventory",
  "/suppliers",
  "/purchases",
  "/customers",
  "/sales",
  "/invoices",
  "/payments",
  "/distributors",
  "/expenses",
  "/reports",
  "/settings",
];

/**
 * List of public authentication routes.
 */
const AUTH_ROUTES = ["/login"];

/**
 * Checks cookie-based session in Next.js Middleware
 * and enforces route-level authentication guards for 100% offline desktop ERP.
 */
export async function updateSession(request: NextRequest) {
  const sessionCookie = request.cookies.get("wmdms_session")?.value || request.cookies.get("wmdms_demo_session")?.value;
  const isUserAuthenticated = !!sessionCookie;
  const pathname = request.nextUrl.pathname;

  // 1. Check if user is accessing a protected route without session
  const isProtectedRoute = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isProtectedRoute && !isUserAuthenticated) {
    const redirectUrl = new URL("/login", request.url);
    if (pathname !== "/dashboard") {
      redirectUrl.searchParams.set("redirect", pathname);
    }
    return NextResponse.redirect(redirectUrl);
  }

  // 2. Check if authenticated user is accessing login
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname === route);

  if (isAuthRoute && isUserAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}
