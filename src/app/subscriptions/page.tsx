"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, RefreshCw, Plus, X, RotateCcw, AlertTriangle, CreditCard, Search } from "lucide-react";

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
  status: "Success" | "Pending" | "Failed" | "Cancelled" | "Refunded";
  subscriptionStatus?: "Active" | "Cancelled" | "Refunded";
}

function SubscriptionsPageContent() {
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get("search") || "";
  const [userSearch, setUserSearch] = useState<string | null>(null);
  const search = userSearch ?? urlSearch;

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [transactions, setTransactions] = useState<RazorpayTransaction[]>([]);
  const [summary, setSummary] = useState({ totalMRR: "₹42,85,000", totalSubscribers: 2848 });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"All" | "Active" | "Cancelled" | "Refunded">("All");
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [refundingTx, setRefundingTx] = useState<RazorpayTransaction | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

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
    setActionNotice(null);
    await fetch("/api/sync", { method: "POST" });
    await fetchSubscriptions();
    setSyncing(false);
    setActionNotice("Synced Razorpay payment webhooks and subscription logs.");
  };

  const handleSimulatePayment = async () => {
    try {
      setIsProcessing(true);
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
        setActionNotice("Simulated Razorpay live transaction logged successfully.");
        await fetchSubscriptions();
      }
    } catch (err) {
      console.error("Payment log failed:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelSubscription = async (txId: string, userName: string) => {
    try {
      setIsProcessing(true);
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel_subscription", txId })
      });
      const data = await res.json();
      if (data.success) {
        setActionNotice(`Subscription for ${userName} (${txId}) has been CANCELLED.`);
        await fetchSubscriptions();
      }
    } catch (err) {
      console.error("Failed to cancel subscription:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleActivateSubscription = async (txId: string, userName: string) => {
    try {
      setIsProcessing(true);
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "activate_subscription", txId })
      });
      const data = await res.json();
      if (data.success) {
        setActionNotice(`Subscription for ${userName} (${txId}) has been ACTIVATED.`);
        await fetchSubscriptions();
      }
    } catch (err) {
      console.error("Failed to activate subscription:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmProcessRefund = async () => {
    if (!refundingTx) return;
    try {
      setIsProcessing(true);
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "process_refund", txId: refundingTx.txId })
      });
      const data = await res.json();
      if (data.success) {
        setActionNotice(`Refund of ${refundingTx.amount} processed for ${refundingTx.user} via Razorpay API.`);
        setRefundingTx(null);
        await fetchSubscriptions();
      }
    } catch (err) {
      console.error("Refund failed:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    const q = search.toLowerCase();
    const matchesSearch = 
      tx.txId.toLowerCase().includes(q) ||
      tx.user.toLowerCase().includes(q) ||
      tx.email.toLowerCase().includes(q) ||
      tx.clerkId.toLowerCase().includes(q) ||
      tx.plan.toLowerCase().includes(q) ||
      tx.amount.toLowerCase().includes(q) ||
      tx.method.toLowerCase().includes(q);

    const status = String(tx.subscriptionStatus || tx.status || "Success");
    if (!matchesSearch) return false;
    if (filterStatus === "All") return true;
    if (filterStatus === "Active") return status === "Success" || status === "Active";
    if (filterStatus === "Cancelled") return status === "Cancelled";
    if (filterStatus === "Refunded") return status === "Refunded";
    return true;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Executive Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-zinc-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-zinc-900 text-white flex items-center justify-center shrink-0 shadow-xs">
            <CreditCard className="w-5.5 h-5.5 text-zinc-100" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="font-semibold text-xl text-zinc-900 tracking-tight">Razorpay Subscription Management</h1>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" /> Razorpay Live Webhook Sync
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-1 font-normal">
              Manage recurring cloud gaming subscriptions, execute plan cancellations, activations, and instant refunds.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto shrink-0 flex-wrap">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium transition-all cursor-pointer flex items-center gap-2 shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
            Sync Payment Logs
          </button>

          <div className="px-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200/80 text-xs">
            <span className="text-zinc-500 font-normal">Total MRR: </span>
            <strong className="text-zinc-900 font-bold text-sm ml-1">{summary.totalMRR} / mo</strong>
          </div>
        </div>
      </div>

      {/* Action Notification Notice */}
      {actionNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button 
            onClick={() => setActionNotice(null)}
            className="text-emerald-700 hover:text-emerald-900 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Plan Tiers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-zinc-200/80 hover:border-zinc-300 shadow-xs transition-all flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-zinc-500">{plan.name} TIER</span>
                {plan.badge && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-zinc-900 text-white">
                    {plan.badge}
                  </span>
                )}
              </div>
              <div className="text-2xl font-bold tracking-tight text-zinc-900 mb-1">{plan.price} <span className="text-xs font-normal text-zinc-400">/ mo</span></div>
              <p className="text-[11px] text-zinc-500 font-normal">{plan.hardware}</p>
            </div>

            <div className="pt-3 border-t border-zinc-100 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500 font-normal">Subscribers:</span>
                <span className="text-zinc-900 font-semibold">{plan.subscribers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 font-normal">Monthly MRR:</span>
                <span className="text-zinc-900 font-semibold">{plan.mrr}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 font-normal">MoM Growth:</span>
                <span className="text-emerald-600 font-semibold">{plan.growth}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Transactions & Subscription Control Table */}
      <div className="bg-white rounded-2xl p-6 border border-zinc-200/80 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="font-semibold text-zinc-900 text-base">Razorpay Payment & Subscription Control</h2>
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200">
                {filteredTransactions.length} Transactions Listed
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-1 font-normal">
              Execute live plan cancellations, instant activations, and Razorpay refunds.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Search Input for Transactions */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search transaction ID, user, email, plan..."
                className="w-full bg-zinc-50/80 border border-zinc-200/80 focus:border-zinc-400 focus:bg-white focus:outline-none rounded-xl pl-9 pr-8 py-2 text-xs text-zinc-900 placeholder-zinc-400 font-normal transition-all"
              />
              {search && (
                <button 
                  onClick={() => setUserSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1 bg-zinc-100/80 border border-zinc-200/70 p-1 rounded-xl text-xs">
              {(["All", "Active", "Cancelled", "Refunded"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium ${
                    filterStatus === status
                      ? "bg-white text-zinc-900 shadow-xs border border-zinc-200/60 font-semibold"
                      : "text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            <button
              onClick={handleSimulatePayment}
              disabled={isProcessing}
              className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 shadow-xs disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" /> Simulate Payment
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-zinc-500 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-zinc-800" /> Loading transaction logs...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-500 font-semibold text-[11px] uppercase tracking-wider bg-zinc-50/50">
                  <th className="py-3 px-4">Transaction ID</th>
                  <th className="py-3 px-4">User & Email</th>
                  <th className="py-3 px-4">Plan & Amount</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-zinc-500 text-xs font-normal">
                      No transactions match &ldquo;{search}&rdquo;.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => {
                    const currentStatus = String(tx.subscriptionStatus || tx.status || "Success");
                    const isActive = currentStatus === "Success" || currentStatus === "Active";
                    const isCancelled = currentStatus === "Cancelled";
                    const isRefunded = currentStatus === "Refunded";

                    return (
                      <tr key={tx.txId} className="hover:bg-zinc-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-zinc-900 font-mono">{tx.txId}</td>
                        <td className="py-3.5 px-4">
                          <div className="text-zinc-900 font-semibold">{tx.user}</div>
                          <div className="text-[11px] text-zinc-400 font-normal">{tx.email}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="text-zinc-900 font-medium">{tx.plan}</div>
                          <div className="text-[11px] text-zinc-500 font-semibold">{tx.amount}</div>
                        </td>
                        <td className="py-3.5 px-4 text-zinc-600 font-normal">{tx.method}</td>
                        <td className="py-3.5 px-4 text-zinc-500 font-normal">{tx.date}</td>
                        <td className="py-3.5 px-4">
                          {isActive && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Active
                            </span>
                          )}
                          {isCancelled && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-zinc-100 text-zinc-700 border border-zinc-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                              Cancelled
                            </span>
                          )}
                          {isRefunded && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
                              <RotateCcw className="w-3 h-3 text-rose-600" />
                              Refunded
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isActive && (
                              <button
                                onClick={() => handleCancelSubscription(tx.txId, tx.user)}
                                disabled={isProcessing}
                                className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[11px] font-medium transition-all cursor-pointer shadow-xs disabled:opacity-50"
                                title="Cancel subscription for this user"
                              >
                                Cancel Sub
                              </button>
                            )}

                            {isCancelled && (
                              <button
                                onClick={() => handleActivateSubscription(tx.txId, tx.user)}
                                disabled={isProcessing}
                                className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-medium transition-all cursor-pointer shadow-xs disabled:opacity-50"
                                title="Reactivate subscription"
                              >
                                Activate Sub
                              </button>
                            )}

                            {!isRefunded && (
                              <button
                                onClick={() => setRefundingTx(tx)}
                                disabled={isProcessing}
                                className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-medium transition-all cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-1"
                                title="Process a full refund via Razorpay"
                              >
                                <RotateCcw className="w-3 h-3" />
                                Refund
                              </button>
                            )}

                            {isRefunded && (
                              <span className="text-[11px] text-zinc-400 font-normal italic">
                                Fully Refunded
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Process Refund Confirmation Modal */}
      {refundingTx && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-zinc-200/90 shadow-xl space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-900 text-base">Confirm Refund Action</h3>
                  <p className="text-xs text-zinc-500 font-normal">Razorpay Gateway API Execution</p>
                </div>
              </div>
              <button 
                onClick={() => setRefundingTx(null)}
                className="text-zinc-400 hover:text-zinc-700 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/70 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500">Transaction ID:</span>
                <span className="font-semibold text-zinc-900 font-mono">{refundingTx.txId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Subscriber:</span>
                <span className="font-semibold text-zinc-900">{refundingTx.user} ({refundingTx.email})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Plan Tier:</span>
                <span className="font-semibold text-zinc-900">{refundingTx.plan}</span>
              </div>
              <div className="flex justify-between border-t border-zinc-200/60 pt-2 font-semibold">
                <span className="text-zinc-700">Refund Amount:</span>
                <span className="text-rose-600 text-sm font-bold">{refundingTx.amount}</span>
              </div>
            </div>

            <p className="text-xs text-zinc-500 font-normal">
              This action will issue a full refund to the customer&apos;s payment source via Razorpay API and mark the subscription status as <strong className="text-zinc-800">Refunded</strong>.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setRefundingTx(null)}
                className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-medium transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmProcessRefund}
                disabled={isProcessing}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 shadow-xs disabled:opacity-50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {isProcessing ? "Processing Refund..." : "Confirm Refund"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SubscriptionsPage() {
  return (
    <Suspense fallback={
      <div className="py-12 text-center text-xs text-zinc-500 flex items-center justify-center gap-2">
        <RefreshCw className="w-4 h-4 animate-spin text-zinc-800" /> Loading Subscriptions...
      </div>
    }>
      <SubscriptionsPageContent />
    </Suspense>
  );
}
