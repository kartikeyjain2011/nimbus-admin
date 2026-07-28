// ─── Razorpay Payments API Utility (server-only) ───────────────────────────
// Docs: https://razorpay.com/docs/api/payments/
//
// Even though frontendnimbuz's checkout flow doesn't persist transactions to
// its own database, every successful Razorpay Checkout payment IS recorded on
// Razorpay's servers. We can read that real payment ledger back out via the
// Payments API using Basic Auth (key_id:key_secret) — no separate DB needed.

const RAZORPAY_API_BASE = "https://api.razorpay.com/v1";

export interface RazorpayPayment {
  id: string;
  amount: number; // in paise
  currency: string;
  status: string; // created | authorized | captured | refunded | failed
  method: string | null;
  email: string | null;
  contact: string | null;
  description: string | null;
  createdAt: number; // epoch seconds
  notes: Record<string, string>;
}

interface RazorpayApiPayment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  method: string | null;
  email: string | null;
  contact: string | null;
  description: string | null;
  created_at: number;
  notes: Record<string, string> | unknown[];
}

export interface RazorpayPaymentsResult {
  payments: RazorpayPayment[];
  error?: string;
}

function mapPayment(p: RazorpayApiPayment): RazorpayPayment {
  return {
    id: p.id,
    amount: p.amount,
    currency: p.currency,
    status: p.status,
    method: p.method,
    email: p.email,
    contact: p.contact,
    description: p.description,
    createdAt: p.created_at,
    notes: Array.isArray(p.notes) ? {} : (p.notes as Record<string, string>) ?? {},
  };
}

/**
 * Fetches real recent payments processed through the Razorpay account behind
 * frontendnimbuz's /dashboard/upgrade checkout. Requires RAZORPAY_KEY_ID and
 * RAZORPAY_KEY_SECRET (server-only — the secret must never be exposed to the
 * client, unlike NEXT_PUBLIC_RAZORPAY_KEY_ID which is safe to expose).
 */
export async function getRecentPayments(count = 20): Promise<RazorpayPaymentsResult> {
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return {
      payments: [],
      error: "RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are not set. Add them to .env.local to load real transactions.",
    };
  }

  try {
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const res = await fetch(`${RAZORPAY_API_BASE}/payments?count=${count}`, {
      headers: { Authorization: `Basic ${auth}` },
      cache: "no-store",
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return {
        payments: [],
        error: `Razorpay API responded with ${res.status}. ${body}`.trim(),
      };
    }

    const data = await res.json();
    const items: RazorpayApiPayment[] = data.items || [];
    return { payments: items.map(mapPayment) };
  } catch (e) {
    return {
      payments: [],
      error: e instanceof Error ? `Failed to reach Razorpay API: ${e.message}` : "Failed to reach Razorpay API.",
    };
  }
}

export function formatPaiseToINR(paise: number): string {
  return "₹" + (paise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
