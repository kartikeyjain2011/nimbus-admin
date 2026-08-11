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
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-zinc-200/80 px-6 flex items-center justify-between sticky top-0 z-40 font-sans">
      {/* Search Input */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search games, streamer IPs, GPU nodes..."
            className="w-full bg-zinc-50/80 border border-zinc-200/80 focus:border-zinc-400 focus:bg-white focus:outline-none rounded-xl pl-9 pr-4 py-2 text-xs text-zinc-900 placeholder-zinc-400 transition-all font-normal"
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
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100/80 border border-zinc-200/80 text-xs font-medium text-zinc-800 hover:bg-zinc-900 hover:text-white transition-all"
        >
          <span>frontendnimbuz.vercel.app</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        {/* Region Switcher Dropdown */}
        <div className="flex items-center gap-2 bg-zinc-50/80 border border-zinc-200/80 rounded-xl px-3 py-1.5 text-xs text-zinc-800">
          <Globe className="w-3.5 h-3.5 text-zinc-600" />
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="bg-transparent border-none text-xs text-zinc-800 focus:outline-none cursor-pointer font-medium"
          >
            <option value="Mumbai (Primary)">Mumbai (11ms)</option>
            <option value="Delhi Node">Delhi (18ms)</option>
            <option value="Bangalore Node">Bangalore (14ms)</option>
            <option value="Singapore Hub">Singapore (35ms)</option>
          </select>
        </div>

        {/* Live Status indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium">
          <Wifi className="w-3.5 h-3.5 animate-pulse text-emerald-600" />
          <span>AV1 Stream: Live</span>
        </div>

        {/* Refresh Button */}
        <button
          onClick={handleRefresh}
          className="p-2 rounded-xl bg-zinc-50/80 border border-zinc-200/80 hover:border-zinc-400 text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer"
          title="Sync Telemetry & Data"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-zinc-900" : ""}`} />
        </button>

        {/* Admin Profile */}
        <div className="flex items-center gap-3 pl-3 border-l border-zinc-200/80">
          <div className="w-8 h-8 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            SA
          </div>
          <div className="hidden md:block">
            <div className="text-xs font-semibold text-zinc-900 flex items-center gap-1">
              Super Admin <ShieldAlert className="w-3 h-3 text-zinc-700" />
            </div>
            <div className="text-[10px] text-zinc-400 font-normal">admin@nimbuz.cloud</div>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-900 hover:text-white border border-zinc-200 text-zinc-700 transition-colors cursor-pointer ml-1"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
