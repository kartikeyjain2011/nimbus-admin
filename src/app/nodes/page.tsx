"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Cpu, RefreshCw, Power, Search, X } from "lucide-react";

const initialRacks = [
  { id: "RACK-MUM-01", dc: "Mumbai Primary DC", type: "NVIDIA RTX 4090 (24GB VRAM)", activeCount: 64, totalCount: 64, load: 96, temp: "68°C", fanSpeed: "82%", status: "Online" },
  { id: "RACK-MUM-02", dc: "Mumbai Primary DC", type: "NVIDIA RTX 4070 Ti (16GB VRAM)", activeCount: 80, totalCount: 80, load: 88, temp: "62°C", fanSpeed: "75%", status: "Online" },
  { id: "RACK-DEL-01", dc: "Delhi North DC", type: "NVIDIA RTX 4090 Ti Bare-Metal", activeCount: 32, totalCount: 32, load: 98, temp: "74°C", fanSpeed: "90%", status: "Online" },
  { id: "RACK-BLR-01", dc: "Bangalore Edge DC", type: "NVIDIA RTX 3060 (8GB VRAM)", activeCount: 140, totalCount: 160, load: 72, temp: "58°C", fanSpeed: "65%", status: "Online" },
  { id: "RACK-SIN-01", dc: "Singapore Hub DC", type: "NVIDIA RTX 4080 (16GB VRAM)", activeCount: 48, totalCount: 64, load: 60, temp: "54°C", fanSpeed: "60%", status: "Standby" },
];

function NodesPageContent() {
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get("search") || "";
  const [userSearch, setUserSearch] = useState<string | null>(null);
  const search = userSearch ?? urlSearch;

  const [racks, setRacks] = useState(initialRacks);

  const toggleRackStatus = (id: string) => {
    setRacks(prev => prev.map(r => {
      if (r.id === id) {
        const nextStatus = r.status === "Online" ? "Maintenance" : "Online";
        return { ...r, status: nextStatus };
      }
      return r;
    }));
  };

  const filteredRacks = racks.filter(r => {
    const q = search.toLowerCase();
    return (
      r.id.toLowerCase().includes(q) ||
      r.dc.toLowerCase().includes(q) ||
      r.type.toLowerCase().includes(q) ||
      r.status.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-xl text-black font-mono">GPU Node Infrastructure Control</h1>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-black text-white">
              512 Total Bare-Metal & Shared Rigs
            </span>
          </div>
          <p className="text-xs text-zinc-600 mt-1 font-mono">
            Control data center rack instances, fan speed, VRAM temperature thresholds, and AV1 video encoder instances.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap w-full md:w-auto">
          <div className="relative w-full sm:w-64 font-mono">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Search rack ID, GPU type, DC..."
              className="w-full bg-zinc-50 border border-zinc-300 focus:border-black focus:bg-white focus:outline-none rounded-xl pl-9 pr-8 py-2 text-xs text-black"
            />
            {search && (
              <button 
                onClick={() => setUserSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button className="px-4 py-2 rounded-xl bg-black text-white text-xs font-mono font-bold hover:bg-zinc-800 transition-all flex items-center gap-2 cursor-pointer border border-black shadow-sm shrink-0">
            <RefreshCw className="w-4 h-4" /> Recalibrate Cluster Nodes
          </button>
        </div>
      </div>

      {/* Racks Grid */}
      {filteredRacks.length === 0 ? (
        <div className="py-12 text-center text-xs font-mono text-zinc-500">
          No GPU racks match &ldquo;{search}&rdquo;.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredRacks.map((rack) => (
            <div key={rack.id} className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm space-y-4 hover:border-black transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-100 border border-zinc-300 flex items-center justify-center text-black">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-black font-mono">{rack.id}</h3>
                    <p className="text-xs text-zinc-500">{rack.dc}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs font-mono px-2.5 py-1 rounded-full border font-bold ${
                    rack.status === "Online" ? "bg-black text-white border-black" :
                    rack.status === "Standby" ? "bg-zinc-100 text-black border-zinc-300" :
                    "bg-zinc-200 text-zinc-800 border-zinc-400"
                  }`}>
                    {rack.status}
                  </span>

                  <button
                    onClick={() => toggleRackStatus(rack.id)}
                    className="p-1.5 rounded-lg bg-zinc-100 border border-zinc-300 hover:border-black text-zinc-700 hover:text-black transition-colors cursor-pointer"
                    title="Toggle Rack Power/Maintenance"
                  >
                    <Power className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-mono space-y-2">
                <div className="text-black font-bold">{rack.type}</div>
                <div className="grid grid-cols-3 gap-2 text-[11px] text-zinc-600">
                  <div>Rigs Active: <span className="text-black font-bold">{rack.activeCount}/{rack.totalCount}</span></div>
                  <div>Temp: <span className="text-black font-bold">{rack.temp}</span></div>
                  <div>Fan Speed: <span className="text-black font-bold">{rack.fanSpeed}</span></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-zinc-500">Cluster Load</span>
                  <span className="text-black font-bold">{rack.load}%</span>
                </div>
                <div className="w-full bg-zinc-200 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-black" 
                    style={{ width: `${rack.load}%` }} 
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function NodesPage() {
  return (
    <Suspense fallback={
      <div className="py-12 text-center text-xs font-mono text-zinc-500 flex items-center justify-center gap-2">
        <RefreshCw className="w-4 h-4 animate-spin text-black" /> Loading Racks...
      </div>
    }>
      <NodesPageContent />
    </Suspense>
  );
}
