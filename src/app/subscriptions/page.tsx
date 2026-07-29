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
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-xl text-black font-mono">Razorpay Subscription & Revenue Sync</h1>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-black text-white flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Razorpay Live Webhook Sync
            </span>
          </div>
          <p className="text-xs text-zinc-600 mt-1 font-mono">
            Tracking cloud GPU recurring subscriptions, Razorpay transaction logs, and plan distributions synced from frontendnimbuz.vercel.app.
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs w-full md:w-auto">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="px-4 py-2 rounded-xl bg-black text-white hover:bg-zinc-800 text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 border border-black shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
            Sync Payment Logs
          </button>

          <div className="px-4 py-2 rounded-xl bg-zinc-100 border border-zinc-300">
            <span className="text-zinc-600">Total MRR: </span>
            <strong className="text-black font-bold text-sm">{summary.totalMRR} / mo</strong>
          </div>
        </div>
      </div>

      {/* Plan Tiers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-zinc-200 hover:border-black shadow-sm transition-all flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-zinc-500">{plan.name} TIER</span>
                {plan.badge && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black text-white font-bold">
                    {plan.badge}
                  </span>
                )}
              </div>
              <div className="font-mono text-2xl font-bold text-black mb-1">{plan.price} <span className="text-xs font-normal text-zinc-500">/ mo</span></div>
              <p className="text-[11px] text-zinc-500 font-mono">{plan.hardware}</p>
            </div>

            <div className="pt-3 border-t border-zinc-200 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-zinc-500">Subscribers:</span>
                <span className="text-black font-bold">{plan.subscribers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Monthly MRR:</span>
                <span className="text-black font-bold">{plan.mrr}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">MoM Growth:</span>
                <span className="text-black font-bold">{plan.growth}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-bold text-black text-base">Recent Razorpay Payment Log</h2>
            <p className="text-xs text-zinc-500 font-mono">UPI, Credit/Debit Cards, NetBanking & Wallets</p>
          </div>
          
          <button
            onClick={handleSimulatePayment}
            className="px-3.5 py-1.5 rounded-xl bg-black text-white hover:bg-zinc-800 text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 border border-black shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> Simulate Razorpay Transaction
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs font-mono text-zinc-500 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-black" /> Loading transactions...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b-2 border-black text-black uppercase tracking-wider font-bold bg-zinc-50">
                  <th className="py-3 px-4">Transaction ID</th>
                  <th className="py-3 px-4">User & Email</th>
                  <th className="py-3 px-4">Plan Selected</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {transactions.map((tx) => (
                  <tr key={tx.txId} className="hover:bg-zinc-50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-black">{tx.txId}</td>
                    <td className="py-3.5 px-4">
                      <div className="text-black font-bold">{tx.user}</div>
                      <div className="text-[10px] text-zinc-500">{tx.email}</div>
                    </td>
                    <td className="py-3.5 px-4 text-black font-semibold">{tx.plan}</td>
                    <td className="py-3.5 px-4 font-bold text-black">{tx.amount}</td>
                    <td className="py-3.5 px-4 text-zinc-600 font-medium">{tx.method}</td>
                    <td className="py-3.5 px-4 text-zinc-600 font-medium">{tx.date}</td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-black text-white">
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
