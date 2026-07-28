// ─── Clerk Backend API Utility (server-only) ───────────────────────────────
// Docs: https://clerk.com/docs/reference/backend-api
//
// This calls the Clerk Backend REST API directly with fetch — no @clerk/backend
// SDK dependency required. Must only ever be imported from server components /
// route handlers, since it uses CLERK_SECRET_KEY.

const CLERK_API_BASE = "https://api.clerk.com/v1";

export interface ClerkUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  email: string | null;
  emailVerified: boolean;
  imageUrl: string | null;
  createdAt: number; // epoch ms
  lastSignInAt: number | null; // epoch ms
  banned: boolean;
}

interface ClerkApiEmailAddress {
  id: string;
  email_address: string;
  verification?: { status: string | null } | null;
}

interface ClerkApiUser {
  id: string;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  email_addresses: ClerkApiEmailAddress[];
  primary_email_address_id: string | null;
  image_url: string | null;
  created_at: number;
  last_sign_in_at: number | null;
  banned: boolean;
}

export interface ClerkUsersResult {
  users: ClerkUser[];
  totalCount: number;
  error?: string;
}

function mapClerkUser(u: ClerkApiUser): ClerkUser {
  const primary =
    u.email_addresses.find((e) => e.id === u.primary_email_address_id) ??
    u.email_addresses[0] ??
    null;

  return {
    id: u.id,
    firstName: u.first_name,
    lastName: u.last_name,
    username: u.username,
    email: primary?.email_address ?? null,
    emailVerified: primary?.verification?.status === "verified",
    imageUrl: u.image_url,
    createdAt: u.created_at,
    lastSignInAt: u.last_sign_in_at,
    banned: u.banned,
  };
}

/**
 * Fetches registered users directly from the Clerk instance backing
 * frontendnimbuz.vercel.app. Requires CLERK_SECRET_KEY (server-only env var,
 * must belong to the SAME Clerk application as the frontend for the user
 * lists to match).
 */
export async function getClerkUsers(limit = 100): Promise<ClerkUsersResult> {
  const secretKey = process.env.CLERK_SECRET_KEY;

  if (!secretKey) {
    return {
      users: [],
      totalCount: 0,
      error: "CLERK_SECRET_KEY is not set. Add it to .env.local to load real Clerk users.",
    };
  }

  try {
    const [usersRes, countRes] = await Promise.all([
      fetch(`${CLERK_API_BASE}/users?limit=${limit}&order_by=-created_at`, {
        headers: { Authorization: `Bearer ${secretKey}` },
        cache: "no-store",
      }),
      fetch(`${CLERK_API_BASE}/users/count`, {
        headers: { Authorization: `Bearer ${secretKey}` },
        cache: "no-store",
      }),
    ]);

    if (!usersRes.ok) {
      const body = await usersRes.text().catch(() => "");
      return {
        users: [],
        totalCount: 0,
        error: `Clerk API responded with ${usersRes.status}. ${body}`.trim(),
      };
    }

    const rawUsers: ClerkApiUser[] = await usersRes.json();
    const users = rawUsers.map(mapClerkUser);

    let totalCount = users.length;
    if (countRes.ok) {
      const countBody = await countRes.json();
      if (typeof countBody?.total_count === "number") {
        totalCount = countBody.total_count;
      }
    }

    return { users, totalCount };
  } catch (e) {
    return {
      users: [],
      totalCount: 0,
      error: e instanceof Error ? `Failed to reach Clerk API: ${e.message}` : "Failed to reach Clerk API.",
    };
  }
}
