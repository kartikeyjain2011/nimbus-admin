import { clerkMiddleware } from "@clerk/nextjs/server";

// Session handling only. Authorization lives with each protected resource:
// see src/app/(dashboard)/layout.tsx and the API route handlers.
export const proxy = clerkMiddleware();

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.[\\w]+$).*)",
  ],
};
