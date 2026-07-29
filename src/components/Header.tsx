"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Globe, RefreshCw, Wifi, ExternalLink, LogOut, ShieldAlert } from "lucide-react";

export default function Header() {
  const router = useRouter();
  const [selectedRegion, setSelectedRegion] = useState("Mumbai (Primary)");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetch("/api/sync", { method: "POST" });
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (e) {
      console.error("Logout failed:", e);
    }
  };

  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-zinc-200 px-6 flex items-center justify-between sticky top-0 z-40 font-sans">
      {/* Search Input */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search games, streamer IPs, GPU node IDs, transactions..."
            className="w-full bg-zinc-50 border border-zinc-200 focus:border-black focus:bg-white focus:outline-none rounded-xl pl-9 pr-4 py-2 text-xs text-black placeholder-zinc-400 transition-colors font-mono"
          />
        </div>
      </div>

      {/* Control Actions & Status */}
      <div className="flex items-center gap-3">
        {/* Frontend site link */}
        <a
          href="https://frontendnimbuz.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 border border-zinc-300 text-xs font-mono font-bold text-black hover:bg-black hover:text-white transition-all"
        >
          <span>frontendnimbuz.vercel.app</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        {/* Region Switcher Dropdown */}
        <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-1.5 text-xs text-black font-mono">
          <Globe className="w-3.5 h-3.5 text-black" />
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="bg-transparent border-none text-xs font-mono text-black focus:outline-none cursor-pointer font-semibold"
          >
            <option value="Mumbai (Primary)">Mumbai (11ms)</option>
            <option value="Delhi Node">Delhi (18ms)</option>
            <option value="Bangalore Node">Bangalore (14ms)</option>
            <option value="Singapore Hub">Singapore (35ms)</option>
          </select>
        </div>

        {/* Live Status indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-100 border border-zinc-300 text-xs font-mono text-black font-bold">
          <Wifi className="w-3.5 h-3.5 animate-pulse text-black" />
          <span>AV1 Stream: Live</span>
        </div>

        {/* Refresh Button */}
        <button
          onClick={handleRefresh}
          className="p-2 rounded-xl bg-zinc-50 border border-zinc-200 hover:border-black text-zinc-600 hover:text-black transition-colors cursor-pointer"
          title="Sync Telemetry & Clerk Data"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-black" : ""}`} />
        </button>

        {/* Admin Profile */}
        <div className="flex items-center gap-3 pl-3 border-l border-zinc-200">
          <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center font-bold text-xs font-mono shadow-sm">
            SA
          </div>
          <div className="hidden md:block">
            <div className="text-xs font-bold text-black flex items-center gap-1">
              Super Admin <ShieldAlert className="w-3 h-3 text-black" />
            </div>
            <div className="text-[10px] text-zinc-500 font-mono">admin@nimbuz.cloud</div>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 rounded-xl bg-zinc-100 hover:bg-black hover:text-white border border-zinc-200 text-zinc-700 transition-colors cursor-pointer ml-1"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
