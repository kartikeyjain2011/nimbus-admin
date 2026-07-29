"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Cpu, 
  TrendingUp, 
  Users, 
  Zap, 
  Radio, 
  ArrowUpRight, 
  Server,
  Tv,
  Laptop,
  Smartphone,
  Tablet,
  RefreshCw
} from "lucide-react";

interface SessionItem {
  id: string;
  user: string;
  email: string;
  game: string;
  tier: string;
  planPrice: string;
  device: string;
  gpu: string;
  res: string;
  latency: string;
  bitrate: string;
  duration: string;
  status: string;
}

const initialSessions: SessionItem[] = [
  { id: "S-9482", user: "R. Sen", email: "rsen.gamer@gmail.com", game: "Cyberpunk 2077: Phantom Liberty", tier: "Priority", planPrice: "₹1,499", device: "Laptop", gpu: "RTX 4070 Ti", res: "1440p @ 120 FPS", latency: "11 ms", bitrate: "45 Mbps", duration: "1h 42m", status: "Active" },
  { id: "S-9483", user: "A. Fernandes", email: "a.ferns@yahoo.co.in", game: "Black Myth: Wukong", tier: "Priority", planPrice: "₹1,499", device: "TV", gpu: "RTX 4070 Ti", res: "1440p @ 120 FPS", latency: "14 ms", bitrate: "52 Mbps", duration: "45m", status: "Active" },
  { id: "S-9484", user: "K. Iyer", email: "kiyer99@outlook.com", game: "Elden Ring: Shadow of Erdtree", tier: "Ultra", planPrice: "₹2,499", device: "Laptop", gpu: "RTX 4090", res: "4K @ 120 FPS", latency: "9 ms", bitrate: "85 Mbps", duration: "3h 10m", status: "Active" },
  { id: "S-9485", user: "V. Sharma", email: "vsharma.dev@gmail.com", game: "Forza Horizon 5", tier: "Ultimate", planPrice: "₹2,999", device: "TV", gpu: "RTX 4090 Ti Bare-Metal", res: "4K @ 240 FPS", latency: "5 ms", bitrate: "110 Mbps", duration: "2h 05m", status: "Active" },
  { id: "S-9486", user: "P. Patel", email: "patel.pranav@gmail.com", game: "Grand Theft Auto V", tier: "Basic", planPrice: "₹799", device: "Phone", gpu: "RTX 3060", res: "1080p @ 60 FPS", latency: "18 ms", bitrate: "22 Mbps", duration: "28m", status: "Active" },
  { id: "S-9487", user: "S. Rao", email: "srao_gaming@gmail.com", game: "Red Dead Redemption 2", tier: "Ultra", planPrice: "₹2,499", device: "Tablet", gpu: "RTX 4090", res: "4K @ 120 FPS", latency: "12 ms", bitrate: "78 Mbps", duration: "1h 15m", status: "Active" },
];

const gpuClusters = [
  { name: "Mumbai Node 01", location: "IN-WEST", gpu: "NVIDIA RTX 4090 (24GB)", nodes: "128 Rigs", load: 94, temp: "68°C", latency: "11 ms", status: "Optimal" },
  { name: "Mumbai Node 02", location: "IN-WEST", gpu: "NVIDIA RTX 4070 Ti (16GB)", nodes: "160 Rigs", load: 88, temp: "62°C", latency: "12 ms", status: "Optimal" },
  { name: "Delhi Node 01", location: "IN-NORTH", gpu: "NVIDIA RTX 4090 Ti (Bare-metal)", nodes: "64 Rigs", load: 96, temp: "71°C", latency: "14 ms", status: "High Demand" },
  { name: "Bangalore Edge", location: "IN-SOUTH", gpu: "NVIDIA RTX 3060 (8GB)", nodes: "160 Rigs", load: 74, temp: "58°C", latency: "15 ms", status: "Optimal" },
];

export default function OverviewPage() {
  const [sessions, setSessions] = useState<SessionItem[]>(initialSessions);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [syncing, setSyncing] = useState(false);
  const [metrics, setMetrics] = useState({
    usersCount: 2848,
    mrr: "₹42.85L",
    titlesCount: 2400
  });

  const loadData = useCallback(async () => {
    try {
      const [usersRes, subRes] = await Promise.all([
        fetch("/api/users"),
        fetch("/api/subscriptions")
      ]);
      const usersData = await usersRes.json();
      const subData = await subRes.json();

      setMetrics({
        usersCount: usersData.usersCount || 2848,
        mrr: subData.summary?.totalMRR || "₹42.85L",
        titlesCount: 2400
      });
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const [usersRes, subRes] = await Promise.all([
          fetch("/api/users"),
          fetch("/api/subscriptions")
        ]);
        const usersData = await usersRes.json();
        const subData = await subRes.json();

        if (!ignore) {
          setMetrics({
            usersCount: usersData.usersCount || 2848,
            mrr: subData.summary?.totalMRR || "₹42.85L",
            titlesCount: 2400
          });
        }
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      }
    }
    load();
    return () => { ignore = true; };
  }, []);

  const triggerFullSync = async () => {
    setSyncing(true);
    await fetch("/api/sync", { method: "POST" });
    await loadData();
    setSyncing(false);
  };

  const filteredSessions = selectedFilter === "All" 
    ? sessions 
    : sessions.filter(s => s.tier === selectedFilter);

  const terminateSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Alert / Status */}
      <div className="card-panel rounded-2xl p-5 border border-[#00f0ff]/30 bg-gradient-to-r from-[#00f0ff]/10 via-[#121420] to-[#a855f7]/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00f0ff]/20 border border-[#00f0ff]/40 flex items-center justify-center text-[#00f0ff] shrink-0">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg text-[#f3f4f6]">Nimbus Cloud Admin & Frontend Sync</h1>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30">
                LIVE SYNC ACTIVE
              </span>
            </div>
            <p className="text-xs text-[#8e96ab] mt-0.5">
              Synced with <a href="https://frontendnimbuz.vercel.app" target="_blank" rel="noopener noreferrer" className="text-[#00f0ff] hover:underline font-mono font-medium">frontendnimbuz.vercel.app</a> • Clerk Auth & Razorpay Active
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono w-full md:w-auto">
          <button
            onClick={triggerFullSync}
            disabled={syncing}
            className="px-4 py-2 rounded-xl bg-[#00f0ff]/15 text-[#00f0ff] border border-[#00f0ff]/40 hover:bg-[#00f0ff]/25 text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing..." : "Sync All Frontend Data"}
          </button>
        </div>
      </div>

      {/* Top Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="card-panel rounded-2xl p-5 card-panel-hover transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-[#8e96ab]">Clerk Registered Users</span>
            <div className="w-8 h-8 rounded-lg bg-[#00f0ff]/10 border border-[#00f0ff]/30 flex items-center justify-center text-[#00f0ff]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-3xl font-bold text-[#f3f4f6]">{metrics.usersCount}</span>
            <span className="flex items-center text-xs font-mono text-[#10b981]">
              <TrendingUp className="w-3.5 h-3.5 mr-1" /> +14.2%
            </span>
          </div>
          <div className="w-full bg-[#161926] h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#00f0ff] h-full w-[78%]" />
          </div>
          <p className="text-[11px] text-[#8e96ab] font-mono">Clerk Auth Synced</p>
        </div>

        {/* Metric 2 */}
        <div className="card-panel rounded-2xl p-5 card-panel-hover transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-[#8e96ab]">Round Trip Latency</span>
            <div className="w-8 h-8 rounded-lg bg-[#10b981]/10 border border-[#10b981]/30 flex items-center justify-center text-[#10b981]">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-3xl font-bold text-[#10b981]">11 <span className="text-base font-normal text-[#8e96ab]">ms</span></span>
            <span className="text-xs font-mono text-[#10b981]">Ultra-Low Latency</span>
          </div>
          <div className="w-full bg-[#161926] h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#10b981] h-full w-[25%]" />
          </div>
          <p className="text-[11px] text-[#8e96ab] font-mono">Mumbai Node • AV1 Stream Mode</p>
        </div>

        {/* Metric 3 */}
        <div className="card-panel rounded-2xl p-5 card-panel-hover transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-[#8e96ab]">Monthly MRR (Razorpay)</span>
            <div className="w-8 h-8 rounded-lg bg-[#a855f7]/10 border border-[#a855f7]/30 flex items-center justify-center text-[#a855f7]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-3xl font-bold text-[#f3f4f6]">{metrics.mrr}</span>
            <span className="flex items-center text-xs font-mono text-[#10b981]">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> +22% MRR
            </span>
          </div>
          <div className="w-full bg-[#161926] h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#a855f7] h-full w-[85%]" />
          </div>
          <p className="text-[11px] text-[#8e96ab] font-mono">Basic, Pro, Premium & Ultimate</p>
        </div>

        {/* Metric 4 */}
        <div className="card-panel rounded-2xl p-5 card-panel-hover transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-[#8e96ab]">GPU Rig Utilization</span>
            <div className="w-8 h-8 rounded-lg bg-[#f59e0b]/10 border border-[#f59e0b]/30 flex items-center justify-center text-[#f59e0b]">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-3xl font-bold text-[#f3f4f6]">92%</span>
            <span className="text-xs font-mono text-[#f59e0b]">471 / 512 Rigs</span>
          </div>
          <div className="w-full bg-[#161926] h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#f59e0b] h-full w-[92%]" />
          </div>
          <p className="text-[11px] text-[#8e96ab] font-mono">RTX 4090 / 4070 Ti / 3060 Racks</p>
        </div>
      </div>

      {/* Latency Spectrum & GPU Cluster Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latency Break Down & Bitrate Card */}
        <div className="card-panel rounded-2xl p-6 space-y-5 lg:col-span-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-[#f3f4f6] text-base">Latency Telemetry Spectrum</h2>
                <p className="text-xs text-[#8e96ab]">Round trip breakdown (Device → Nimbus GPU)</p>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-[#00f0ff] animate-ping" />
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#090a0f] border border-[#222638]">
                <div className="flex justify-between items-center text-xs font-mono mb-2">
                  <span className="text-[#8e96ab]">Network Transit Time</span>
                  <span className="text-[#00f0ff] font-bold">5 ms</span>
                </div>
                <div className="w-full bg-[#161926] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#00f0ff] h-full w-[45%]" />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#090a0f] border border-[#222638]">
                <div className="flex justify-between items-center text-xs font-mono mb-2">
                  <span className="text-[#8e96ab]">GPU Render & AV1 Encode</span>
                  <span className="text-[#a855f7] font-bold">4 ms</span>
                </div>
                <div className="w-full bg-[#161926] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#a855f7] h-full w-[36%]" />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#090a0f] border border-[#222638]">
                <div className="flex justify-between items-center text-xs font-mono mb-2">
                  <span className="text-[#8e96ab]">Client Browser Decode</span>
                  <span className="text-[#10b981] font-bold">2 ms</span>
                </div>
                <div className="w-full bg-[#161926] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#10b981] h-full w-[19%]" />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#222638] flex items-center justify-between text-xs font-mono">
            <span className="text-[#8e96ab]">Target Total Ping</span>
            <span className="text-[#00f0ff] font-bold text-sm">11 ms</span>
          </div>
        </div>

        {/* GPU Rig Cluster Status Grid */}
        <div className="card-panel rounded-2xl p-6 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-[#f3f4f6] text-base">GPU Node Data Center Racks</h2>
              <p className="text-xs text-[#8e96ab]">Real-time node allocation across regional data centers</p>
            </div>
            <a href="/nodes" className="text-xs font-mono text-[#00f0ff] hover:underline flex items-center gap-1">
              View All Nodes <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {gpuClusters.map((cluster, i) => (
              <div key={i} className="p-4 rounded-xl bg-[#090a0f] border border-[#222638] space-y-3 hover:border-[#00f0ff]/30 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-[#00f0ff]" />
                    <span className="font-medium text-xs text-[#f3f4f6]">{cluster.name}</span>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                    cluster.status === "Optimal" 
                      ? "bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20" 
                      : "bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20"
                  }`}>
                    {cluster.status}
                  </span>
                </div>

                <div className="text-[11px] font-mono text-[#8e96ab] space-y-1">
                  <div>GPU: <span className="text-[#f3f4f6]">{cluster.gpu}</span></div>
                  <div className="flex justify-between">
                    <span>Active: {cluster.nodes}</span>
                    <span>Temp: {cluster.temp}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono text-[#8e96ab]">
                    <span>GPU Utilization</span>
                    <span className="text-[#00f0ff] font-bold">{cluster.load}%</span>
                  </div>
                  <div className="w-full bg-[#161926] h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${cluster.load > 90 ? "bg-[#f59e0b]" : "bg-[#00f0ff]"}`} 
                      style={{ width: `${cluster.load}%` }} 
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Active Streaming Sessions Table */}
      <div className="card-panel rounded-2xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-[#f3f4f6] text-base">Live Active Player Sessions</h2>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30">
                {filteredSessions.length} Streams Active
              </span>
            </div>
            <p className="text-xs text-[#8e96ab] mt-0.5">
              Real-time monitoring of user streams, connected device, GPU hardware, and frame rate metrics
            </p>
          </div>

          {/* Tier Filters */}
          <div className="flex items-center gap-2 bg-[#090a0f] border border-[#222638] p-1 rounded-xl text-xs font-mono">
            {["All", "Basic", "Priority", "Ultra", "Ultimate"].map((tier) => (
              <button
                key={tier}
                onClick={() => setSelectedFilter(tier)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  selectedFilter === tier
                    ? "bg-[#00f0ff] text-[#090a0f] font-bold shadow-[0_0_10px_rgba(0,240,255,0.3)]"
                    : "text-[#8e96ab] hover:text-[#f3f4f6]"
                }`}
              >
                {tier}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-[#222638] text-[#8e96ab] uppercase tracking-wider">
                <th className="py-3 px-4">Session ID & User</th>
                <th className="py-3 px-4">Game Title</th>
                <th className="py-3 px-4">Plan Tier</th>
                <th className="py-3 px-4">Device</th>
                <th className="py-3 px-4">Stream Specs</th>
                <th className="py-3 px-4">Latency & Bitrate</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222638]">
              {filteredSessions.map((s) => (
                <tr key={s.id} className="hover:bg-[#161926]/60 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-[#f3f4f6]">{s.user}</div>
                    <div className="text-[10px] text-[#8e96ab]">{s.email}</div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-[#00f0ff]">
                    {s.game}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                      s.tier === "Ultimate" ? "bg-[#a855f7]/15 text-[#a855f7] border-[#a855f7]/30" :
                      s.tier === "Ultra" ? "bg-[#00f0ff]/15 text-[#00f0ff] border-[#00f0ff]/30" :
                      s.tier === "Priority" ? "bg-[#10b981]/15 text-[#10b981] border-[#10b981]/30" :
                      "bg-[#8e96ab]/15 text-[#8e96ab] border-[#8e96ab]/30"
                    }`}>
                      {s.tier} ({s.planPrice})
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-[#f3f4f6]">
                    <div className="flex items-center gap-1.5">
                      {s.device === "TV" && <Tv className="w-3.5 h-3.5 text-[#00f0ff]" />}
                      {s.device === "Laptop" && <Laptop className="w-3.5 h-3.5 text-[#10b981]" />}
                      {s.device === "Phone" && <Smartphone className="w-3.5 h-3.5 text-[#a855f7]" />}
                      {s.device === "Tablet" && <Tablet className="w-3.5 h-3.5 text-[#f59e0b]" />}
                      <span>{s.device}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="text-[#f3f4f6]">{s.res}</div>
                    <div className="text-[10px] text-[#8e96ab]">{s.gpu}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-[#10b981] font-bold">{s.latency}</span>
                    <span className="text-[#8e96ab] text-[10px]"> • {s.bitrate}</span>
                  </td>
                  <td className="py-3.5 px-4 text-[#8e96ab]">
                    {s.duration}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => terminateSession(s.id)}
                      className="px-2.5 py-1 rounded-lg bg-[#f43f5e]/10 text-[#f43f5e] border border-[#f43f5e]/20 hover:bg-[#f43f5e]/20 text-[10px] font-bold transition-all cursor-pointer"
                    >
                      Kill Stream
                    </button>
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
