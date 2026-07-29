"use client";

import { useState } from "react";
import { Cpu, RefreshCw, Power } from "lucide-react";

const initialRacks = [
  { id: "RACK-MUM-01", dc: "Mumbai Primary DC", type: "NVIDIA RTX 4090 (24GB VRAM)", activeCount: 64, totalCount: 64, load: 96, temp: "68°C", fanSpeed: "82%", status: "Online" },
  { id: "RACK-MUM-02", dc: "Mumbai Primary DC", type: "NVIDIA RTX 4070 Ti (16GB VRAM)", activeCount: 80, totalCount: 80, load: 88, temp: "62°C", fanSpeed: "75%", status: "Online" },
  { id: "RACK-DEL-01", dc: "Delhi North DC", type: "NVIDIA RTX 4090 Ti Bare-Metal", activeCount: 32, totalCount: 32, load: 98, temp: "74°C", fanSpeed: "90%", status: "Online" },
  { id: "RACK-[#00f0ff]-01", dc: "Bangalore Edge DC", type: "NVIDIA RTX 3060 (8GB VRAM)", activeCount: 140, totalCount: 160, load: 72, temp: "58°C", fanSpeed: "65%", status: "Online" },
  { id: "RACK-SIN-01", dc: "Singapore Hub DC", type: "NVIDIA RTX 4080 (16GB VRAM)", activeCount: 48, totalCount: 64, load: 60, temp: "54°C", fanSpeed: "60%", status: "Standby" },
];

export default function NodesPage() {
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

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="card-panel rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-xl text-[#f3f4f6]">GPU Node Infrastructure Control</h1>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30">
              512 Total Bare-Metal & Shared Rigs
            </span>
          </div>
          <p className="text-xs text-[#8e96ab] mt-1">
            Control data center rack instances, fan speed, VRAM temperature thresholds, and AV1 video encoder instances.
          </p>
        </div>

        <button className="px-4 py-2 rounded-xl bg-[#00f0ff] text-[#090a0f] text-xs font-mono font-bold hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all flex items-center gap-2 cursor-pointer">
          <RefreshCw className="w-4 h-4" /> Recalibrate Cluster Nodes
        </button>
      </div>

      {/* Racks Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {racks.map((rack) => (
          <div key={rack.id} className="card-panel rounded-2xl p-6 space-y-4 hover:border-[#00f0ff]/30 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#00f0ff]/10 border border-[#00f0ff]/30 flex items-center justify-center text-[#00f0ff]">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#f3f4f6] font-mono">{rack.id}</h3>
                  <p className="text-xs text-[#8e96ab]">{rack.dc}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-xs font-mono px-2.5 py-1 rounded-full border ${
                  rack.status === "Online" ? "bg-[#10b981]/15 text-[#10b981] border-[#10b981]/30" :
                  rack.status === "Standby" ? "bg-[#00f0ff]/15 text-[#00f0ff] border-[#00f0ff]/30" :
                  "bg-[#f43f5e]/15 text-[#f43f5e] border-[#f43f5e]/30"
                }`}>
                  {rack.status}
                </span>

                <button
                  onClick={() => toggleRackStatus(rack.id)}
                  className="p-1.5 rounded-lg bg-[#090a0f] border border-[#222638] hover:border-[#00f0ff]/40 text-[#8e96ab] hover:text-[#f3f4f6] transition-colors cursor-pointer"
                  title="Toggle Rack Power/Maintenance"
                >
                  <Power className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#090a0f] border border-[#222638] text-xs font-mono space-y-2">
              <div className="text-[#00f0ff] font-semibold">{rack.type}</div>
              <div className="grid grid-cols-3 gap-2 text-[11px] text-[#8e96ab]">
                <div>Rigs Active: <span className="text-[#f3f4f6] font-bold">{rack.activeCount}/{rack.totalCount}</span></div>
                <div>Temp: <span className="text-[#10b981] font-bold">{rack.temp}</span></div>
                <div>Fan Speed: <span className="text-[#a855f7] font-bold">{rack.fanSpeed}</span></div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[#8e96ab]">Cluster Load</span>
                <span className="text-[#00f0ff] font-bold">{rack.load}%</span>
              </div>
              <div className="w-full bg-[#161926] h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${rack.load > 90 ? "bg-[#f59e0b]" : "bg-[#00f0ff]"}`} 
                  style={{ width: `${rack.load}%` }} 
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
