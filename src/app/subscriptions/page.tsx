import { AlertTriangle } from "lucide-react";
import { getRecentPayments, formatPaiseToINR } from "@/lib/razorpay";
import PaymentsTable from "./PaymentsTable";

// Server component: pulls the real payment ledger from the Razorpay account
// behind frontendnimbuz.vercel.app's /dashboard/upgrade checkout. Razorpay
// Checkout doesn't need its own DB — every captured payment already lives on
// Razorpay's servers and is queryable via the Payments API.
export const dynamic = "force-dynamic";

export default async function SubscriptionsPage() {
  const { payments, error } = await getRecentPayments(50);

  if (error) {
    return (
      <div className="space-y-6">
        <div className="card-panel rounded-2xl p-6 flex items-start gap-4 border border-[#f59e0b]/30">
          <div className="w-10 h-10 rounded-xl bg-[#f59e0b]/10 border border-[#f59e0b]/30 flex items-center justify-center text-[#f59e0b] shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-[#f3f4f6]">Unable to load Razorpay transactions</h1>
            <p className="text-xs text-[#8e96ab] mt-1 font-mono">{error}</p>
            <p className="text-xs text-[#8e96ab] mt-3">
              Add <code className="text-[#00f0ff]">RAZORPAY_KEY_ID</code> and{" "}
              <code className="text-[#00f0ff]">RAZORPAY_KEY_SECRET</code> to <code className="text-[#00f0ff]">.env.local</code>{" "}
              (same Razorpay account used by frontendnimbuz&apos;s Upgrade page), then restart the dev server.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const captured = payments.filter((p) => p.status === "captured");
  const totalRevenuePaise = captured.reduce((sum, p) => sum + p.amount, 0);

  const byPlan = new Map<string, { count: number; totalPaise: number }>();
  for (const p of captured) {
    const planId = p.notes.plan_id || "unknown";
    const entry = byPlan.get(planId) || { count: 0, totalPaise: 0 };
    entry.count += 1;
    entry.totalPaise += p.amount;
    byPlan.set(planId, entry);
  }

  return (
    <div className="space-y-6">
      <div className="card-panel rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-xl text-[#f3f4f6]">Razorpay Subscription & Revenue Analytics</h1>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30">
              Live Payment Gateway Data
            </span>
          </div>
          <p className="text-xs text-[#8e96ab] mt-1">
            Real captured transactions pulled from the Razorpay Payments API — no mock figures.
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="px-4 py-2 rounded-xl bg-[#090a0f] border border-[#222638]">
            <span className="text-[#8e96ab]">Total Captured (last {payments.length}): </span>
            <strong className="text-[#00f0ff] text-sm">{formatPaiseToINR(totalRevenuePaise)}</strong>
          </div>
        </div>
      </div>

      {byPlan.size > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from(byPlan.entries()).map(([planId, stats]) => (
            <div key={planId} className="card-panel rounded-2xl p-5 card-panel-hover transition-all flex flex-col justify-between space-y-4">
              <div>
                <span className="text-xs font-mono font-bold text-[#8e96ab] uppercase">{planId}</span>
                <div className="font-mono text-2xl font-bold text-[#f3f4f6] mt-1">{formatPaiseToINR(stats.totalPaise)}</div>
              </div>
              <div className="pt-3 border-t border-[#222638] text-xs font-mono flex justify-between">
                <span className="text-[#8e96ab]">Payments:</span>
                <span className="text-[#f3f4f6] font-bold">{stats.count}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <PaymentsTable payments={payments} />
    </div>
  );
}
