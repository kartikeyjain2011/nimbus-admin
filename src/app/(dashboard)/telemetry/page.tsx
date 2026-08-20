"use client";

import { useState, useEffect } from "react";
import { Radio, CheckCircle2 } from "lucide-react";

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
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-xl text-black font-mono">Real-time Latency & Packet Spectrum Telemetry</h1>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-black text-white">
              LIVE SIGNAL 60 FPS
            </span>
          </div>
          <p className="text-xs text-zinc-600 mt-1 font-mono">
            Real-time webRTC packet routing from Mumbai Node to edge streaming clients.
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="px-4 py-2 rounded-xl bg-zinc-100 border border-zinc-300 flex items-center gap-2 text-black font-semibold">
            <Radio className="w-4 h-4 text-black animate-pulse" />
            <span>Avg Round-trip: <strong className="text-black font-bold text-sm">11 ms</strong></span>
          </div>
        </div>
      </div>

      {/* Real-time Spectrum Bar Chart */}
      <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-black text-base">Live Millisecond Signal Spectrum (Past 30 Seconds)</h2>
            <p className="text-xs text-zinc-500 font-mono">Updated live via WebRTC telemetry stream</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-black font-bold">
            <CheckCircle2 className="w-4 h-4 text-black" /> Zero Packet Loss Detected
          </div>
        </div>

        {/* Live Signal Visualizer */}
        <div className="h-48 bg-zinc-50 border border-zinc-200 rounded-2xl p-6 flex items-end justify-between gap-2 relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-zinc-200/50 to-transparent pointer-events-none" />
          {pingData.map((val, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
              <span className="text-[10px] font-mono text-black font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                {val}ms
              </span>
              <div 
                className="w-full rounded-t-lg bg-black transition-all duration-500 shadow-sm"
                style={{ height: `${(val / 20) * 100}%` }}
              />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-zinc-200 text-xs font-mono">
          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200">
            <div className="text-zinc-500 mb-1">Encoding Bitrate</div>
            <div className="text-black font-bold text-lg">85.4 Mbps (AV1)</div>
          </div>
          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200">
            <div className="text-zinc-500 mb-1">WebRTC Latency Buffer</div>
            <div className="text-black font-bold text-lg">2 ms</div>
          </div>
          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200">
            <div className="text-zinc-500 mb-1">Audio Stream (Dolby Atmos)</div>
            <div className="text-black font-bold text-lg">7.1 PCM Lossless</div>
          </div>
        </div>
      </div>
    </div>
  );
}
