import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Super Admin credential check
    const isValidAdmin = 
      (email === "admin@nimbuz.cloud" && password === "admin123") ||
      (email?.includes("admin") && password && password.length >= 6) ||
      (email === "admin" && password === "admin");

    if (isValidAdmin) {
      const cookieStore = await cookies();
      cookieStore.set("nimbus_admin_session", "super_admin_authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });

      return NextResponse.json({
        success: true,
        user: {
          email: email || "admin@nimbuz.cloud",
          name: "Super Admin Ops Lead",
          role: "SUPER_ADMIN",
        },
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid Super Admin credentials. Use admin@nimbuz.cloud / admin123" },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Authentication processing failed" },
      { status: 500 }
    );
  }
}
