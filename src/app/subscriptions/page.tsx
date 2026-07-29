"use client";

import { useState, useEffect, useCallback } from "react";
import { CheckCircle2, RefreshCw, Plus } from "lucide-react";

interface SubscriptionPlan {
  id: string;
  name: "BASIC" | "PRO" | "PREMIUM" | "ULTIMATE";
  price: string;
  mrr: string;
  subscribers: number;
  hardware: string;
  growth: string;
  badge?: string;
}

interface RazorpayTransaction {
  txId: string;
  user: string;
  email: string;
  clerkId: string;
  plan: string;
  amount: string;
  method: string;
  date: string;
  status: "Success" | "Pending" | "Failed";
}

export default function SubscriptionsPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [transactions, setTransactions] = useState<RazorpayTransaction[]>([]);
  const [summary, setSummary] = useState({ totalMRR: "₹42,85,000", totalSubscribers: 2848 });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const fetchSubscriptions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/subscriptions");
      const data = await res.json();
      if (data.success) {
        setPlans(data.plans || []);
        setTransactions(data.transactions || []);
        if (data.summary) {
          setSummary(data.summary);
        }
      }
    } catch (err) {
      console.error("Failed to load subscriptions:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const res = await fetch("/api/subscriptions");
        const data = await res.json();
        if (!ignore && data.success) {
          setPlans(data.plans || []);
          setTransactions(data.transactions || []);
          if (data.summary) {
            setSummary(data.summary);
          }
        }
      } catch (err) {
        console.error("Failed to load subscriptions:", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => { ignore = true; };
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    await fetch("/api/sync", { method: "POST" });
    await fetchSubscriptions();
    setSyncing(false);
  };

  const handleSimulatePayment = async () => {
    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "log_transaction",
          user: "V. Sharma",
          email: "vsharma.dev@gmail.com",
          plan: "ULTIMATE",
          amount: "₹2,999",
          method: "UPI (Razorpay Live)"
        })
      });
      const data = await res.json();
      if (data.success) {
        await fetchSubscriptions();
      }
    } catch (err) {
      console.error("Payment log failed:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="card-panel rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-xl text-[#f3f4f6]">Razorpay Subscription & Revenue Sync</h1>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Razorpay Live Webhook Sync
            </span>
          </div>
          <p className="text-xs text-[#8e96ab] mt-1">
            Tracking cloud GPU recurring subscriptions, Razorpay transaction logs, and plan distributions synced from frontendnimbuz.vercel.app.
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs w-full md:w-auto">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="px-4 py-2 rounded-xl bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30 hover:bg-[#00f0ff]/20 text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
            Sync Payment Logs
          </button>

          <div className="px-4 py-2 rounded-xl bg-[#090a0f] border border-[#222638]">
            <span className="text-[#8e96ab]">Total MRR: </span>
            <strong className="text-[#00f0ff] text-sm">{summary.totalMRR} / mo</strong>
          </div>
        </div>
      </div>

      {/* Plan Tiers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan, i) => (
          <div key={i} className="card-panel rounded-2xl p-5 card-panel-hover transition-all flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-[#8e96ab]">{plan.name} TIER</span>
                {plan.badge && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#00f0ff]/15 text-[#00f0ff] border border-[#00f0ff]/30">
                    {plan.badge}
                  </span>
                )}
              </div>
              <div className="font-mono text-2xl font-bold text-[#f3f4f6] mb-1">{plan.price} <span className="text-xs font-normal text-[#8e96ab]">/ mo</span></div>
              <p className="text-[11px] text-[#8e96ab] font-mono">{plan.hardware}</p>
            </div>

            <div className="pt-3 border-t border-[#222638] space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-[#8e96ab]">Subscribers:</span>
                <span className="text-[#f3f4f6] font-bold">{plan.subscribers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8e96ab]">Monthly MRR:</span>
                <span className="text-[#10b981] font-bold">{plan.mrr}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8e96ab]">MoM Growth:</span>
                <span className="text-[#00f0ff]">{plan.growth}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Transactions Table */}
      <div className="card-panel rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-bold text-[#f3f4f6] text-base">Recent Razorpay Payment Log</h2>
            <p className="text-xs text-[#8e96ab]">UPI, Credit/Debit Cards, NetBanking & Wallets</p>
          </div>
          
          <button
            onClick={handleSimulatePayment}
            className="px-3.5 py-1.5 rounded-xl bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30 hover:bg-[#10b981]/25 text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Simulate Razorpay Transaction
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs font-mono text-[#8e96ab] flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[#00f0ff]" /> Loading transactions...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-[#222638] text-[#8e96ab] uppercase tracking-wider">
                  <th className="py-3 px-4">Transaction ID</th>
                  <th className="py-3 px-4">User & Email</th>
                  <th className="py-3 px-4">Plan Selected</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222638]">
                {transactions.map((tx) => (
                  <tr key={tx.txId} className="hover:bg-[#161926]/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#00f0ff]">{tx.txId}</td>
                    <td className="py-3.5 px-4">
                      <div className="text-[#f3f4f6]">{tx.user}</div>
                      <div className="text-[10px] text-[#8e96ab]">{tx.email}</div>
                    </td>
                    <td className="py-3.5 px-4 text-[#f3f4f6] font-semibold">{tx.plan}</td>
                    <td className="py-3.5 px-4 font-bold text-[#10b981]">{tx.amount}</td>
                    <td className="py-3.5 px-4 text-[#8e96ab]">{tx.method}</td>
                    <td className="py-3.5 px-4 text-[#8e96ab]">{tx.date}</td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30">
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
