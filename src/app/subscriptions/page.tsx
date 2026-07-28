"use client";

import { useState } from "react";
import { CreditCard, TrendingUp, DollarSign, Users, ShieldCheck, ArrowUpRight, CheckCircle2, Zap } from "lucide-react";

const plansBreakdown = [
  { name: "BASIC", price: "₹799", mrr: "₹8,45,000", subscribers: "1,058", hardware: "RTX 3060 / 8GB VRAM", growth: "+12%" },
  { name: "PRO", price: "₹1,499", mrr: "₹16,80,000", subscribers: "1,120", hardware: "RTX 4070 Ti / 16GB VRAM", growth: "+18%", badge: "Most Popular" },
  { name: "PREMIUM", price: "₹2,499", mrr: "₹12,50,000", subscribers: "500", hardware: "RTX 4090 / 24GB VRAM", growth: "+25%", badge: "Best Value" },
  { name: "ULTIMATE", price: "₹2,999", mrr: "₹5,10,000", subscribers: "170", hardware: "RTX 4090 Ti Bare-Metal", growth: "+31%", badge: "Ultimate" },
];

const razorpayTransactions = [
  { txId: "pay_Razorpay_9401", user: "R. Sen", email: "rsen.gamer@gmail.com", plan: "PRO", amount: "₹1,499", method: "UPI (Google Pay)", date: "2026-07-28 13:30", status: "Success" },
  { txId: "pay_Razorpay_9402", user: "A. Fernandes", email: "a.ferns@yahoo.co.in", plan: "PRO (3 Mo)", amount: "₹4,272", method: "Credit Card (HDFC)", date: "2026-07-28 13:12", status: "Success" },
  { txId: "pay_Razorpay_9403", user: "K. Iyer", email: "kiyer99@outlook.com", plan: "PREMIUM (Annual)", amount: "₹25,489", method: "NetBanking (ICICI)", date: "2026-07-28 12:45", status: "Success" },
  { txId: "pay_Razorpay_9404", user: "V. Sharma", email: "vsharma.dev@gmail.com", plan: "ULTIMATE", amount: "₹2,999", method: "UPI (PhonePe)", date: "2026-07-28 11:20", status: "Success" },
  { txId: "pay_Razorpay_9405", user: "P. Patel", email: "patel.pranav@gmail.com", plan: "BASIC", amount: "₹799", method: "Wallet (Paytm)", date: "2026-07-28 10:05", status: "Success" },
];

export default function SubscriptionsPage() {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="card-panel rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-xl text-[#f3f4f6]">Razorpay Subscription & Revenue Analytics</h1>
            <span className="text-xs font-mono font-[#10b981] px-2.5 py-0.5 rounded-full bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30">
              Live Payment Gateway Active
            </span>
          </div>
          <p className="text-xs text-[#8e96ab] mt-1">
            Tracking cloud GPU recurring subscriptions, Razorpay transaction logs, and plan distributions.
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="px-4 py-2 rounded-xl bg-[#090a0f] border border-[#222638]">
            <span className="text-[#8e96ab]">Total MRR: </span>
            <strong className="text-[#00f0ff] text-sm">₹42,85,000 / mo</strong>
          </div>
        </div>
      </div>

      {/* Plan Tiers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {plansBreakdown.map((plan, i) => (
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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-[#f3f4f6] text-base">Recent Razorpay Payment Log</h2>
            <p className="text-xs text-[#8e96ab]">UPI, Credit/Debit Cards, NetBanking & Wallets</p>
          </div>
          <span className="text-xs font-mono text-[#10b981] flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" /> 100% Webhook Success Rate
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-[#222638] text-[#8e96ab] uppercase tracking-wider">
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Plan Selected</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222638]">
              {razorpayTransactions.map((tx) => (
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
      </div>
    </div>
  );
}
