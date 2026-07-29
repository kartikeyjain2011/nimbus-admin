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
  RefreshCw,
  ShieldCheck
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
    <div className="space-y-6 font-sans">
      {/* Top Banner Alert / Status */}
      <div className="bg-white rounded-2xl p-5 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center shrink-0">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg text-black font-mono">Super Admin Dashboard & Live Sync</h1>
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-black text-white">
                LIVE SYNC ACTIVE
              </span>
            </div>
            <p className="text-xs text-zinc-600 mt-0.5 font-mono">
              Synced with <a href="https://frontendnimbuz.vercel.app" target="_blank" rel="noopener noreferrer" className="text-black underline font-bold">frontendnimbuz.vercel.app</a> • Clerk Auth & Razorpay Sync Active
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono w-full md:w-auto">
          <button
            onClick={triggerFullSync}
            disabled={syncing}
            className="px-4 py-2 rounded-xl bg-black text-white hover:bg-zinc-800 text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 border border-black shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing..." : "Sync All Frontend Data"}
          </button>
        </div>
      </div>

      {/* Top Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white rounded-2xl p-5 border border-zinc-200 hover:border-black transition-all space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500">Clerk Registered Users</span>
            <div className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-300 flex items-center justify-center text-black">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-3xl font-bold text-black">{metrics.usersCount}</span>
            <span className="flex items-center text-xs font-mono text-black font-bold">
              <TrendingUp className="w-3.5 h-3.5 mr-1" /> +14.2%
            </span>
          </div>
          <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden">
            <div className="bg-black h-full w-[78%]" />
          </div>
          <p className="text-[11px] text-zinc-500 font-mono">Clerk Auth Synced</p>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-2xl p-5 border border-zinc-200 hover:border-black transition-all space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500">Round Trip Latency</span>
            <div className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-300 flex items-center justify-center text-black">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-3xl font-bold text-black">11 <span className="text-base font-normal text-zinc-500">ms</span></span>
            <span className="text-xs font-mono text-black font-bold">Ultra-Low Latency</span>
          </div>
          <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden">
            <div className="bg-black h-full w-[25%]" />
          </div>
          <p className="text-[11px] text-zinc-500 font-mono">Mumbai Node • AV1 Stream Mode</p>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-2xl p-5 border border-zinc-200 hover:border-black transition-all space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500">Monthly MRR (Razorpay)</span>
            <div className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-300 flex items-center justify-center text-black">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-3xl font-bold text-black">{metrics.mrr}</span>
            <span className="flex items-center text-xs font-mono text-black font-bold">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> +22% MRR
            </span>
          </div>
          <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden">
            <div className="bg-black h-full w-[85%]" />
          </div>
          <p className="text-[11px] text-zinc-500 font-mono">Basic, Pro, Premium & Ultimate</p>
        </div>

        {/* Metric 4 */}
        <div className="bg-white rounded-2xl p-5 border border-zinc-200 hover:border-black transition-all space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500">GPU Rig Utilization</span>
            <div className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-300 flex items-center justify-center text-black">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-3xl font-bold text-black">92%</span>
            <span className="text-xs font-mono text-black font-bold">471 / 512 Rigs</span>
          </div>
          <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden">
            <div className="bg-black h-full w-[92%]" />
          </div>
          <p className="text-[11px] text-zinc-500 font-mono">RTX 4090 / 4070 Ti / 3060 Racks</p>
        </div>
      </div>

      {/* Latency Spectrum & GPU Cluster Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latency Break Down & Bitrate Card */}
        <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm space-y-5 lg:col-span-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-black text-base">Latency Telemetry Spectrum</h2>
                <p className="text-xs text-zinc-500">Round trip breakdown (Device → Nimbus GPU)</p>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-black animate-ping" />
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200">
                <div className="flex justify-between items-center text-xs font-mono mb-2">
                  <span className="text-zinc-600 font-medium">Network Transit Time</span>
                  <span className="text-black font-bold">5 ms</span>
                </div>
                <div className="w-full bg-zinc-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-black h-full w-[45%]" />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200">
                <div className="flex justify-between items-center text-xs font-mono mb-2">
                  <span className="text-zinc-600 font-medium">GPU Render & AV1 Encode</span>
                  <span className="text-black font-bold">4 ms</span>
                </div>
                <div className="w-full bg-zinc-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-black h-full w-[36%]" />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200">
                <div className="flex justify-between items-center text-xs font-mono mb-2">
                  <span className="text-zinc-600 font-medium">Client Browser Decode</span>
                  <span className="text-black font-bold">2 ms</span>
                </div>
                <div className="w-full bg-zinc-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-black h-full w-[19%]" />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-200 flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-500">Target Total Ping</span>
            <span className="text-black font-bold text-sm">11 ms</span>
          </div>
        </div>

        {/* GPU Rig Cluster Status Grid */}
        <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-black text-base">GPU Node Data Center Racks</h2>
              <p className="text-xs text-zinc-500">Real-time node allocation across regional data centers</p>
            </div>
            <a href="/nodes" className="text-xs font-mono font-bold text-black hover:underline flex items-center gap-1">
              View All Nodes <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {gpuClusters.map((cluster, i) => (
              <div key={i} className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-3 hover:border-black transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-black" />
                    <span className="font-bold text-xs text-black">{cluster.name}</span>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold ${
                    cluster.status === "Optimal" 
                      ? "bg-black text-white border-black" 
                      : "bg-zinc-200 text-black border-zinc-400"
                  }`}>
                    {cluster.status}
                  </span>
                </div>

                <div className="text-[11px] font-mono text-zinc-600 space-y-1">
                  <div>GPU: <span className="text-black font-medium">{cluster.gpu}</span></div>
                  <div className="flex justify-between">
                    <span>Active: {cluster.nodes}</span>
                    <span>Temp: {cluster.temp}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono text-zinc-600">
                    <span>GPU Utilization</span>
                    <span className="text-black font-bold">{cluster.load}%</span>
                  </div>
                  <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-black" 
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
      <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-black text-base">Live Active Player Sessions</h2>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-black text-white">
                {filteredSessions.length} Streams Active
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Real-time monitoring of user streams, connected device, GPU hardware, and frame rate metrics
            </p>
          </div>

          {/* Tier Filters */}
          <div className="flex items-center gap-2 bg-zinc-100 border border-zinc-300 p-1 rounded-xl text-xs font-mono">
            {["All", "Basic", "Priority", "Ultra", "Ultimate"].map((tier) => (
              <button
                key={tier}
                onClick={() => setSelectedFilter(tier)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold ${
                  selectedFilter === tier
                    ? "bg-black text-white shadow-sm"
                    : "text-zinc-600 hover:text-black"
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
              <tr className="border-b-2 border-black text-black uppercase tracking-wider font-bold bg-zinc-50">
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
            <tbody className="divide-y divide-zinc-200">
              {filteredSessions.map((s) => (
                <tr key={s.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-black">{s.user}</div>
                    <div className="text-[10px] text-zinc-500">{s.email}</div>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-black">
                    {s.game}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold border bg-zinc-100 text-black border-zinc-300">
                      {s.tier} ({s.planPrice})
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-black">
                    <div className="flex items-center gap-1.5 font-medium">
                      {s.device === "TV" && <Tv className="w-3.5 h-3.5 text-black" />}
                      {s.device === "Laptop" && <Laptop className="w-3.5 h-3.5 text-black" />}
                      {s.device === "Phone" && <Smartphone className="w-3.5 h-3.5 text-black" />}
                      {s.device === "Tablet" && <Tablet className="w-3.5 h-3.5 text-black" />}
                      <span>{s.device}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="text-black font-semibold">{s.res}</div>
                    <div className="text-[10px] text-zinc-500">{s.gpu}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-black font-bold">{s.latency}</span>
                    <span className="text-zinc-500 text-[10px]"> • {s.bitrate}</span>
                  </td>
                  <td className="py-3.5 px-4 text-zinc-600 font-medium">
                    {s.duration}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => terminateSession(s.id)}
                      className="px-3 py-1 rounded-lg bg-black text-white hover:bg-zinc-800 text-[10px] font-bold transition-all cursor-pointer border border-black shadow-sm"
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
