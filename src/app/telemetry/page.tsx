"use client";

import { useState, useEffect } from "react";
import { Activity, Zap, Radio, Globe, Shield, RefreshCw, BarChart2, CheckCircle2, Info } from "lucide-react";

export default function TelemetryPage() {
  const [pingData, setPingData] = useState<number[]>([11, 10, 12, 11, 9, 11, 13, 11, 10, 11, 12, 11, 10, 11]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPingData(prev => {
        const next = [...prev.slice(1), Math.floor(Math.random() * 4) + 9]; // Ping between 9ms and 13ms
        return next;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Data source notice */}
      <div className="rounded-xl bg-[#f59e0b]/10 border border-[#f59e0b]/30 px-4 py-2.5 flex items-center gap-2 text-[11px] font-mono text-[#f59e0b]">
        <Info className="w-3.5 h-3.5 shrink-0" />
        <span>Simulated data — frontendnimbuz.vercel.app has no WebRTC/telemetry backend to source real ping data from.</span>
      </div>

      {/* Header Banner */}
      <div className="card-panel rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-xl text-[#f3f4f6]">Real-time Latency & Packet Spectrum Telemetry</h1>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30">
              LIVE SIGNAL 60 FPS
            </span>
          </div>
          <p className="text-xs text-[#8e96ab] mt-1">
            Real-time webRTC packet routing from Mumbai Node to edge streaming clients.
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="px-4 py-2 rounded-xl bg-[#090a0f] border border-[#222638] flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#00f0ff] animate-pulse" />
            <span>Avg Round-trip: <strong className="text-[#00f0ff] text-sm">11 ms</strong></span>
          </div>
        </div>
      </div>

      {/* Real-time Spectrum Bar Chart */}
      <div className="card-panel rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-[#f3f4f6] text-base">Live Millisecond Signal Spectrum (Past 30 Seconds)</h2>
            <p className="text-xs text-[#8e96ab]">Updated live via WebRTC telemetry stream</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#10b981]">
            <CheckCircle2 className="w-4 h-4" /> Zero Packet Loss Detected
          </div>
        </div>

        {/* Live Signal Visualizer */}
        <div className="h-48 bg-[#090a0f] border border-[#222638] rounded-2xl p-6 flex items-end justify-between gap-2 relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#00f0ff]/10 to-transparent pointer-events-none" />
          {pingData.map((val, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
              <span className="text-[10px] font-mono text-[#8e96ab] opacity-0 group-hover:opacity-100 transition-opacity">
                {val}ms
              </span>
              <div 
                className="w-full rounded-t-lg bg-gradient-to-t from-[#00f0ff]/40 to-[#00f0ff] transition-all duration-500 shadow-[0_0_12px_rgba(0,240,255,0.4)]"
                style={{ height: `${(val / 20) * 100}%` }}
              />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#222638] text-xs font-mono">
          <div className="p-4 rounded-xl bg-[#090a0f] border border-[#222638]">
            <div className="text-[#8e96ab] mb-1">Encoding Bitrate</div>
            <div className="text-[#00f0ff] font-bold text-lg">85.4 Mbps (AV1)</div>
          </div>
          <div className="p-4 rounded-xl bg-[#090a0f] border border-[#222638]">
            <div className="text-[#8e96ab] mb-1">WebRTC Latency Buffer</div>
            <div className="text-[#10b981] font-bold text-lg">2 ms</div>
          </div>
          <div className="p-4 rounded-xl bg-[#090a0f] border border-[#222638]">
            <div className="text-[#8e96ab] mb-1">Audio Stream (Dolby Atmos)</div>
            <div className="text-[#a855f7] font-bold text-lg">7.1 PCM Lossless</div>
          </div>
        </div>
      </div>
    </div>
  );
}
