"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import type { ClerkUser } from "@/lib/clerk";

function timeAgo(epochMs: number | null): string {
  if (!epochMs) return "Never";
  const diffMs = Date.now() - epochMs;
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days < 1) return "Today";
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years === 1 ? "" : "s"} ago`;
}

function displayName(u: ClerkUser): string {
  const combined = [u.firstName, u.lastName].filter(Boolean).join(" ").trim();
  return combined || u.username || u.email || u.id;
}

export default function UsersTable({ users }: { users: ClerkUser[] }) {
  const [search, setSearch] = useState("");

  const filteredUsers = users.filter((u) => {
    const name = displayName(u).toLowerCase();
    const email = (u.email || "").toLowerCase();
    const q = search.toLowerCase();
    return name.includes(q) || email.includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="card-panel rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-xl text-[#f3f4f6]">Registered Cloud Streamers & Subscribers</h1>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30">
              {users.length} Registered via Clerk
            </span>
          </div>
          <p className="text-xs text-[#8e96ab] mt-1">
            Live account data pulled from the Clerk Backend API for frontendnimbuz.vercel.app.
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-[#8e96ab] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search streamer name or email..."
            className="w-full bg-[#090a0f] border border-[#222638] focus:border-[#00f0ff] focus:outline-none rounded-xl pl-9 pr-4 py-2 text-xs text-[#f3f4f6]"
          />
        </div>
      </div>

      <div className="card-panel rounded-2xl p-6 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-[#222638] text-[#8e96ab] uppercase tracking-wider">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Clerk User ID</th>
                <th className="py-3 px-4">Joined</th>
                <th className="py-3 px-4">Last Sign-in</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222638]">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-[#161926]/60 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      {u.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={u.imageUrl} alt={displayName(u)} className="w-7 h-7 rounded-full object-cover border border-[#222638]" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-[#161926] border border-[#222638] flex items-center justify-center text-[10px] text-[#8e96ab] font-bold">
                          {displayName(u).charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="font-bold text-[#f3f4f6]">{displayName(u)}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-[#8e96ab]">
                    {u.email || "—"}
                    {u.email && !u.emailVerified && (
                      <span className="ml-1.5 text-[9px] px-1.5 py-0.5 rounded bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/30">
                        unverified
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-[10px] text-[#8e96ab]">{u.id}</td>
                  <td className="py-3.5 px-4 text-[#8e96ab]">{timeAgo(u.createdAt)}</td>
                  <td className="py-3.5 px-4 text-[#8e96ab]">{timeAgo(u.lastSignInAt)}</td>
                  <td className="py-3.5 px-4 text-right">
                    {u.banned ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#f43f5e]/10 text-[#f43f5e] border border-[#f43f5e]/20">
                        Banned
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20">
                        Active
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#8e96ab]">
                    No users match &quot;{search}&quot;.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
