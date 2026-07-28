"use client";

import { useState } from "react";
import { Users, Search, Shield, Tv, Laptop, Smartphone, Tablet, Flame, Clock } from "lucide-react";

const initialUsers = [
  { id: "USR-101", name: "R. Sen", email: "rsen.gamer@gmail.com", tier: "Priority", joined: "8 months ago", totalHours: "340 hrs", status: "Active Now", game: "Cyberpunk 2077", device: "Laptop" },
  { id: "USR-102", name: "A. Fernandes", email: "a.ferns@yahoo.co.in", tier: "Priority", joined: "3 months ago", totalHours: "185 hrs", status: "Active Now", game: "Black Myth: Wukong", device: "TV" },
  { id: "USR-103", name: "K. Iyer", email: "kiyer99@outlook.com", tier: "Ultra", joined: "1 year ago", totalHours: "620 hrs", status: "Active Now", game: "Elden Ring", device: "Laptop" },
  { id: "USR-104", name: "V. Sharma", email: "vsharma.dev@gmail.com", tier: "Ultimate", joined: "2 weeks ago", totalHours: "48 hrs", status: "Active Now", game: "Forza Horizon 5", device: "TV" },
  { id: "USR-105", name: "P. Patel", email: "patel.pranav@gmail.com", tier: "Basic", joined: "5 months ago", totalHours: "95 hrs", status: "Active Now", game: "Grand Theft Auto V", device: "Phone" },
];

export default function UsersPage() {
  const [search, setSearch] = useState("");

  const filteredUsers = initialUsers.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="card-panel rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-xl text-[#f3f4f6]">Registered Cloud Streamers & Subscribers</h1>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30">
              2,848 Total Subscribers
            </span>
          </div>
          <p className="text-xs text-[#8e96ab] mt-1">
            Manage user accounts, connected storefront licenses (Steam, Epic Games, GOG, Xbox), and streaming session limits.
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

      {/* Users Table */}
      <div className="card-panel rounded-2xl p-6 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-[#222638] text-[#8e96ab] uppercase tracking-wider">
                <th className="py-3 px-4">User ID & Name</th>
                <th className="py-3 px-4">Plan Tier</th>
                <th className="py-3 px-4">Currently Playing</th>
                <th className="py-3 px-4">Device</th>
                <th className="py-3 px-4">Total Stream Time</th>
                <th className="py-3 px-4">Tenure</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222638]">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-[#161926]/60 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-[#f3f4f6]">{u.name}</div>
                    <div className="text-[10px] text-[#8e96ab]">{u.email} ({u.id})</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                      u.tier === "Ultimate" ? "bg-[#a855f7]/15 text-[#a855f7] border-[#a855f7]/30" :
                      u.tier === "Ultra" ? "bg-[#00f0ff]/15 text-[#00f0ff] border-[#00f0ff]/30" :
                      u.tier === "Priority" ? "bg-[#10b981]/15 text-[#10b981] border-[#10b981]/30" :
                      "bg-[#8e96ab]/15 text-[#8e96ab] border-[#8e96ab]/30"
                    }`}>
                      {u.tier}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-[#00f0ff]">{u.game}</td>
                  <td className="py-3.5 px-4 text-[#f3f4f6]">{u.device}</td>
                  <td className="py-3.5 px-4 text-[#8e96ab] font-bold">{u.totalHours}</td>
                  <td className="py-3.5 px-4 text-[#8e96ab]">{u.joined}</td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20 flex items-center gap-1 justify-end w-max ml-auto">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" /> {u.status}
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
