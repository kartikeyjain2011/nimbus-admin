import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get("nimbus_admin_session");

  if (!session || session.value !== "super_admin_authenticated") {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      email: "admin@nimbuz.cloud",
      name: "Super Admin Ops Lead",
      role: "SUPER_ADMIN",
    },
  });
}
