import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const customSession = request.cookies.get("nimbus_admin_session");
  const clerkSession = request.cookies.get("__session") || request.cookies.get("__clerk_db_jwt") || request.cookies.get("__client_uat");

  // If already logged in and visiting /login, redirect directly to dashboard /
  if (pathname === "/login") {
    if (customSession || clerkSession) {
      const dashboardUrl = new URL("/", request.url);
      return NextResponse.redirect(dashboardUrl);
    }
    return NextResponse.next();
  }

  // Public paths that bypass authentication check
  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/search") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // If no session cookie present, redirect to login
  if (!customSession && !clerkSession) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
