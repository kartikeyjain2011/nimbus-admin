import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

/**
 * Returns a 401 response when the caller has no Clerk session, otherwise null.
 * Each route handler checks this itself so protection does not depend on path matching.
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const { userId } = await auth({ treatPendingAsSignedOut: false });

  if (!userId) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  return null;
}
