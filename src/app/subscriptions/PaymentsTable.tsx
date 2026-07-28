"use client";

import { CheckCircle2 } from "lucide-react";
import type { RazorpayPayment } from "@/lib/razorpay";
import { formatPaiseToINR } from "@/lib/razorpay";

function statusStyle(status: string): string {
  switch (status) {
    case "captured":
      return "bg-[#10b981]/15 text-[#10b981] border-[#10b981]/30";
    case "authorized":
      return "bg-[#00f0ff]/15 text-[#00f0ff] border-[#00f0ff]/30";
    case "failed":
      return "bg-[#f43f5e]/15 text-[#f43f5e] border-[#f43f5e]/30";
    default:
      return "bg-[#8e96ab]/15 text-[#8e96ab] border-[#8e96ab]/30";
  }
}

export default function PaymentsTable({ payments }: { payments: RazorpayPayment[] }) {
  return (
    <div className="card-panel rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-[#f3f4f6] text-base">Recent Razorpay Payment Log</h2>
          <p className="text-xs text-[#8e96ab]">Live payment ledger pulled from the Razorpay Payments API</p>
        </div>
        <span className="text-xs font-mono text-[#10b981] flex items-center gap-1">
          <CheckCircle2 className="w-4 h-4" /> {payments.length} Recent Transactions
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono border-collapse">
          <thead>
            <tr className="border-b border-[#222638] text-[#8e96ab] uppercase tracking-wider">
              <th className="py-3 px-4">Payment ID</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Method</th>
              <th className="py-3 px-4">Contact</th>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#222638]">
            {payments.map((tx) => (
              <tr key={tx.id} className="hover:bg-[#161926]/60 transition-colors">
                <td className="py-3.5 px-4 font-bold text-[#00f0ff]">{tx.id}</td>
                <td className="py-3.5 px-4">
                  <div className="text-[#f3f4f6]">{tx.description || tx.notes.plan_id || "—"}</div>
                  <div className="text-[10px] text-[#8e96ab]">{tx.email}</div>
                </td>
                <td className="py-3.5 px-4 font-bold text-[#10b981]">{formatPaiseToINR(tx.amount)}</td>
                <td className="py-3.5 px-4 text-[#8e96ab] uppercase">{tx.method || "—"}</td>
                <td className="py-3.5 px-4 text-[#8e96ab]">{tx.contact || "—"}</td>
                <td className="py-3.5 px-4 text-[#8e96ab]">
                  {new Date(tx.createdAt * 1000).toLocaleString("en-IN")}
                </td>
                <td className="py-3.5 px-4 text-right">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusStyle(tx.status)}`}>
                    {tx.status}
                  </span>
                </td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-[#8e96ab]">
                  No transactions found yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
