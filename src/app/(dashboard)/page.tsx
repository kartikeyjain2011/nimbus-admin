"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Cpu, 
  TrendingUp, 
  Users, 
  Zap, 
  ArrowUpRight, 
  Server,
  Tv,
  Laptop,
  Smartphone,
  Tablet,
  RefreshCw,
  Activity,
  Search,
  X
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

function OverviewPageContent() {
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get("search") || "";
  const [userSearch, setUserSearch] = useState<string | null>(null);
  const search = userSearch ?? urlSearch;

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

  const filteredSessions = sessions.filter(s => {
    const q = search.toLowerCase();
    const matchesSearch = 
      s.id.toLowerCase().includes(q) ||
      s.user.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.game.toLowerCase().includes(q) ||
      s.gpu.toLowerCase().includes(q) ||
      s.device.toLowerCase().includes(q) ||
      s.tier.toLowerCase().includes(q);

    const matchesTier = selectedFilter === "All" || s.tier === selectedFilter;
    return matchesSearch && matchesTier;
  });

  const terminateSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Executive Clean Header */}
      <div className="bg-white rounded-2xl p-6 border border-zinc-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-zinc-900 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Activity className="w-5.5 h-5.5 text-zinc-100" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="font-semibold text-xl text-zinc-900 tracking-tight">Dashboard Overview</h1>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Sync Active
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-1 font-normal">
              Real-time monitoring for stream telemetry, GPU node performance, and subscriber MRR metrics.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
          <button
            onClick={triggerFullSync}
            disabled={syncing}
            className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing..." : "Sync All Frontend Data"}
          </button>
        </div>
      </div>

      {/* Modern KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white rounded-2xl p-5 border border-zinc-200/80 hover:border-zinc-300 hover:shadow-xs transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Registered Users</span>
            <div className="w-8 h-8 rounded-lg bg-zinc-100/80 border border-zinc-200/60 flex items-center justify-center text-zinc-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight text-zinc-900">{metrics.usersCount.toLocaleString()}</span>
            <span className="inline-flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
              <TrendingUp className="w-3 h-3 mr-1" /> +14.2%
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 font-normal">Clerk Auth Synced</p>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-2xl p-5 border border-zinc-200/80 hover:border-zinc-300 hover:shadow-xs transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Round Trip Latency</span>
            <div className="w-8 h-8 rounded-lg bg-zinc-100/80 border border-zinc-200/60 flex items-center justify-center text-zinc-700">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight text-zinc-900">11 <span className="text-sm font-normal text-zinc-500">ms</span></span>
            <span className="text-xs font-medium text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded-md">
              Ultra-Low
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 font-normal">Mumbai Node • AV1 Codec</p>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-2xl p-5 border border-zinc-200/80 hover:border-zinc-300 hover:shadow-xs transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Monthly MRR</span>
            <div className="w-8 h-8 rounded-lg bg-zinc-100/80 border border-zinc-200/60 flex items-center justify-center text-zinc-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight text-zinc-900">{metrics.mrr}</span>
            <span className="inline-flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> +22%
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 font-normal">Razorpay Subscriptions</p>
        </div>

        {/* Metric 4 */}
        <div className="bg-white rounded-2xl p-5 border border-zinc-200/80 hover:border-zinc-300 hover:shadow-xs transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">GPU Rig Utilization</span>
            <div className="w-8 h-8 rounded-lg bg-zinc-100/80 border border-zinc-200/60 flex items-center justify-center text-zinc-700">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight text-zinc-900">92%</span>
            <span className="text-xs font-medium text-zinc-500">471 / 512 Rigs</span>
          </div>
          <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-zinc-900 h-full w-[92%]" />
          </div>
        </div>
      </div>

      {/* Middle Section: Latency Telemetry & GPU Clusters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latency Breakdown Card */}
        <div className="bg-white rounded-2xl p-6 border border-zinc-200/80 shadow-xs lg:col-span-1 flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold text-zinc-900 text-base">Latency Telemetry</h2>
                <p className="text-xs text-zinc-500 font-normal">Round trip breakdown (Device → GPU)</p>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </div>

            <div className="space-y-3.5">
              <div className="p-3.5 rounded-xl bg-zinc-50/70 border border-zinc-200/60 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-600 font-medium">Network Transit Time</span>
                  <span className="text-zinc-900 font-semibold">5 ms</span>
                </div>
                <div className="w-full bg-zinc-200/80 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-zinc-900 h-full w-[45%]" />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-50/70 border border-zinc-200/60 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-600 font-medium">GPU Render & AV1 Encode</span>
                  <span className="text-zinc-900 font-semibold">4 ms</span>
                </div>
                <div className="w-full bg-zinc-200/80 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-zinc-900 h-full w-[36%]" />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-50/70 border border-zinc-200/60 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-600 font-medium">Client Browser Decode</span>
                  <span className="text-zinc-900 font-semibold">2 ms</span>
                </div>
                <div className="w-full bg-zinc-200/80 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-zinc-900 h-full w-[19%]" />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-100 flex items-center justify-between text-xs">
            <span className="text-zinc-500 font-normal">Target Total Ping</span>
            <span className="text-zinc-900 font-bold text-sm">11 ms</span>
          </div>
        </div>

        {/* GPU Node Data Center Racks */}
        <div className="bg-white rounded-2xl p-6 border border-zinc-200/80 shadow-xs lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-zinc-900 text-base">GPU Data Center Racks</h2>
              <p className="text-xs text-zinc-500 font-normal">Real-time node allocation across regional data centers</p>
            </div>
            <a href="/nodes" className="text-xs font-medium text-zinc-700 hover:text-zinc-900 hover:underline flex items-center gap-1">
              View All Nodes <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {gpuClusters.map((cluster, i) => (
              <div key={i} className="p-4 rounded-xl bg-zinc-50/70 border border-zinc-200/60 space-y-3 hover:border-zinc-300 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-zinc-700" />
                    <span className="font-semibold text-xs text-zinc-900">{cluster.name}</span>
                  </div>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                    cluster.status === "Optimal" 
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}>
                    {cluster.status}
                  </span>
                </div>

                <div className="text-[11px] text-zinc-500 space-y-1">
                  <div>GPU: <span className="text-zinc-800 font-medium">{cluster.gpu}</span></div>
                  <div className="flex justify-between">
                    <span>Active: {cluster.nodes}</span>
                    <span>Temp: {cluster.temp}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-zinc-500">
                    <span>GPU Utilization</span>
                    <span className="text-zinc-900 font-semibold">{cluster.load}%</span>
                  </div>
                  <div className="w-full bg-zinc-200/80 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-zinc-900" 
                      style={{ width: `${cluster.load}%` }} 
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Active Player Sessions Table */}
      <div className="bg-white rounded-2xl p-6 border border-zinc-200/80 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="font-semibold text-zinc-900 text-base">Active Player Sessions</h2>
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200">
                {filteredSessions.length} Streams Active
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-1 font-normal">
              Real-time monitoring of connected player hardware, resolution, latency, and session duration.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Search sessions */}
            <div className="relative w-full sm:w-60">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search session ID, user, game, GPU..."
                className="w-full bg-zinc-50/80 border border-zinc-200/80 focus:border-zinc-400 focus:bg-white focus:outline-none rounded-xl pl-9 pr-8 py-2 text-xs text-zinc-900 placeholder-zinc-400 font-normal transition-all"
              />
              {search && (
                <button 
                  onClick={() => setUserSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Tier Filters */}
            <div className="flex items-center gap-1 bg-zinc-100/80 border border-zinc-200/70 p-1 rounded-xl text-xs">
              {["All", "Basic", "Priority", "Ultra", "Ultimate"].map((tier) => (
                <button
                  key={tier}
                  onClick={() => setSelectedFilter(tier)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium ${
                    selectedFilter === tier
                      ? "bg-white text-zinc-900 shadow-xs border border-zinc-200/60 font-semibold"
                      : "text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Clean Modern Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 text-zinc-500 font-semibold text-[11px] uppercase tracking-wider bg-zinc-50/50">
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
            <tbody className="divide-y divide-zinc-100">
              {filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-zinc-500 text-xs font-normal">
                    No active sessions match &ldquo;{search}&rdquo;.
                  </td>
                </tr>
              ) : (
                filteredSessions.map((s) => (
                  <tr key={s.id} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-zinc-900">{s.user}</div>
                      <div className="text-[11px] text-zinc-400 font-normal">{s.email}</div>
                      <div className="text-[10px] text-zinc-500 font-mono">ID: {s.id}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-zinc-900">
                      {s.game}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-medium border bg-zinc-100/80 text-zinc-800 border-zinc-200">
                        {s.tier} ({s.planPrice})
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-800">
                      <div className="flex items-center gap-1.5 font-medium">
                        {s.device === "TV" && <Tv className="w-3.5 h-3.5 text-zinc-600" />}
                        {s.device === "Laptop" && <Laptop className="w-3.5 h-3.5 text-zinc-600" />}
                        {s.device === "Phone" && <Smartphone className="w-3.5 h-3.5 text-zinc-600" />}
                        {s.device === "Tablet" && <Tablet className="w-3.5 h-3.5 text-zinc-600" />}
                        <span>{s.device}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-zinc-900 font-medium">{s.res}</div>
                      <div className="text-[11px] text-zinc-400">{s.gpu}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-zinc-900 font-semibold">{s.latency}</span>
                      <span className="text-zinc-400 text-[11px]"> • {s.bitrate}</span>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-500 font-medium">
                      {s.duration}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => terminateSession(s.id)}
                        className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-[11px] font-medium transition-all cursor-pointer shadow-xs"
                      >
                        Kill Stream
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function OverviewPage() {
  return (
    <Suspense fallback={
      <div className="py-12 text-center text-xs text-zinc-500 flex items-center justify-center gap-2">
        <RefreshCw className="w-4 h-4 animate-spin text-zinc-800" /> Loading Overview...
      </div>
    }>
      <OverviewPageContent />
    </Suspense>
  );
}
