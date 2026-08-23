import { createServerClient, type CookieOptions } from "@supabase/ssr";
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
const AUTH_ROUTES = ["/login", "/forgot-password"];

/**
 * Refreshes Supabase Auth tokens in Next.js Edge Middleware
 * and enforces route-level authentication guards.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {}

  const demoSessionCookie = request.cookies.get("wmdms_demo_session")?.value;
  const isUserAuthenticated = !!user || !!demoSessionCookie;

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

  // 2. Check if authenticated user is accessing login or forgot-password
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname === route);

  if (isAuthRoute && isUserAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return supabaseResponse;
}
