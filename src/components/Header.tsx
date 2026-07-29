"use client";

import { useState } from "react";
import { Search, Globe, RefreshCw, Wifi, ExternalLink } from "lucide-react";

export default function Header() {
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

  return (
    <header className="h-16 bg-[#0d0f19]/80 backdrop-blur-md border-b border-[#222638] px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Search Input */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-[#8e96ab] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search games, streamer IPs, GPU node IDs, transactions..."
            className="w-full bg-[#121420] border border-[#222638] focus:border-[#00f0ff] focus:outline-none rounded-xl pl-9 pr-4 py-2 text-xs text-[#f3f4f6] placeholder-[#8e96ab] transition-colors"
          />
        </div>
      </div>

      {/* Control Actions & Status */}
      <div className="flex items-center gap-4">
        {/* Frontend site link */}
        <a
          href="https://frontendnimbuz.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-xs font-mono text-[#00f0ff] hover:bg-[#00f0ff]/20 transition-all"
        >
          <span>frontendnimbuz.vercel.app</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        {/* Region Switcher Dropdown */}
        <div className="flex items-center gap-2 bg-[#121420] border border-[#222638] rounded-xl px-3 py-1.5 text-xs text-[#f3f4f6]">
          <Globe className="w-3.5 h-3.5 text-[#00f0ff]" />
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="bg-transparent border-none text-xs font-mono text-[#f3f4f6] focus:outline-none cursor-pointer"
          >
            <option value="Mumbai (Primary)" className="bg-[#121420] text-[#f3f4f6]">Mumbai (11ms)</option>
            <option value="Delhi Node" className="bg-[#121420] text-[#f3f4f6]">Delhi (18ms)</option>
            <option value="Bangalore Node" className="bg-[#121420] text-[#f3f4f6]">Bangalore (14ms)</option>
            <option value="Singapore Hub" className="bg-[#121420] text-[#f3f4f6]">Singapore (35ms)</option>
          </select>
        </div>

        {/* Live Status indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#10b981]/10 border border-[#10b981]/20 text-xs font-mono text-[#10b981]">
          <Wifi className="w-3.5 h-3.5 animate-pulse" />
          <span>AV1 Stream: Live</span>
        </div>

        {/* Refresh Button */}
        <button
          onClick={handleRefresh}
          className="p-2 rounded-xl bg-[#121420] border border-[#222638] hover:border-[#00f0ff]/40 text-[#8e96ab] hover:text-[#00f0ff] transition-colors cursor-pointer"
          title="Sync Telemetry & Clerk Data"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-[#00f0ff]" : ""}`} />
        </button>

        {/* Admin Profile */}
        <div className="flex items-center gap-3 pl-2 border-l border-[#222638]">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#00f0ff]/20 to-[#a855f7]/20 border border-[#00f0ff]/30 flex items-center justify-center text-[#00f0ff] font-bold text-xs font-mono">
            OP
          </div>
          <div className="hidden md:block">
            <div className="text-xs font-medium text-[#f3f4f6]">Ops Lead</div>
            <div className="text-[10px] text-[#8e96ab] font-mono">admin@nimbuz.cloud</div>
          </div>
        </div>
      </div>
    </header>
  );
}
