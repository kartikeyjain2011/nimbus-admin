"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Play, HardDrive, CheckCircle, Flame, RefreshCw, ShoppingBag } from "lucide-react";

interface GameItem {
  id: number;
  title: string;
  publisher: string;
  genre: string;
  activePlayers: number;
  precached: boolean;
  minTier: "Basic" | "Priority" | "Ultra" | "Ultimate";
  rayTracing: string;
  storageGB: number;
  rating: string;
  purchasesCount: number;
}

export default function GameLibraryPage() {
  const [games, setGames] = useState<GameItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [summary, setSummary] = useState({ totalTitles: 0, totalStreaming: 0, totalPurchases: 0 });

  const fetchGames = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/games");
      const data = await res.json();
      if (data.success && data.games) {
        setGames(data.games);
        if (data.summary) {
          setSummary(data.summary);
        }
      }
    } catch (err) {
      console.error("Failed to load games:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const res = await fetch("/api/games");
        const data = await res.json();
        if (!ignore && data.success && data.games) {
          setGames(data.games);
          if (data.summary) {
            setSummary(data.summary);
          }
        }
      } catch (err) {
        console.error("Failed to load games:", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => { ignore = true; };
  }, []);

  const filteredGames = games.filter(g => {
    const matchesSearch = g.title.toLowerCase().includes(search.toLowerCase()) || g.publisher.toLowerCase().includes(search.toLowerCase());
    const matchesGenre = selectedGenre === "All" || g.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-xl text-black font-mono">Nimbus Cloud Game Catalog & Purchases</h1>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-black text-white">
              Synced with Storefront Licenses
            </span>
          </div>
          <p className="text-xs text-zinc-600 mt-1 font-mono">
            Manage pre-cached NVMe game images across GPU nodes and view game purchases bound to Clerk user accounts.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <button
            onClick={() => fetchGames()}
            className="px-3.5 py-2 rounded-xl bg-zinc-100 border border-zinc-300 hover:border-black text-black font-bold flex items-center gap-2 cursor-pointer transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <div className="px-3.5 py-2 rounded-xl bg-zinc-100 border border-zinc-300 text-black font-semibold flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-black" />
            <span>Storefront Purchases: <strong className="text-black font-bold">{summary.totalPurchases || 11600} Licenses</strong></span>
          </div>

          <div className="px-3.5 py-2 rounded-xl bg-zinc-100 border border-zinc-300 text-black font-semibold flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-black" />
            <span>NVMe Pool: <strong className="text-black font-bold">250 TB Pre-cached</strong></span>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-white rounded-2xl p-4 border border-zinc-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, developer, or genre..."
            className="w-full bg-zinc-50 border border-zinc-200 focus:border-black focus:bg-white focus:outline-none rounded-xl pl-9 pr-4 py-2 text-xs text-black font-mono"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto text-xs font-mono">
          {["All", "Sci-Fi RPG", "Action RPG", "Racing", "Open World", "Esports FPS"].map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap font-bold ${
                selectedGenre === genre
                  ? "bg-black text-white shadow-sm"
                  : "bg-zinc-100 text-zinc-600 border border-zinc-300 hover:text-black hover:border-black"
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Games Grid */}
      {loading ? (
        <div className="py-12 text-center text-xs font-mono text-zinc-500 flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-black" /> Loading game catalog...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredGames.map((game) => (
            <div key={game.id} className="bg-white rounded-2xl p-5 border border-zinc-200 hover:border-black shadow-sm transition-all flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-zinc-500">{game.genre}</span>
                  <span className="flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-100 text-black border border-zinc-300">
                    <Flame className="w-3 h-3 text-black" /> {game.activePlayers} streaming
                  </span>
                </div>

                <h3 className="font-bold text-black text-base leading-tight mb-1">{game.title}</h3>
                <p className="text-xs text-zinc-500 font-mono">{game.publisher}</p>
              </div>

              <div className="space-y-2 pt-3 border-t border-zinc-200 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-zinc-500">User Purchases:</span>
                  <span className="text-black font-bold">{game.purchasesCount} Unlocked</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Minimum Plan:</span>
                  <span className="text-black font-bold">{game.minTier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Ray Tracing:</span>
                  <span className="text-black font-semibold">{game.rayTracing}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">NVMe Pre-cache:</span>
                  <span className="text-black font-bold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-black" /> Ready ({game.storageGB} GB)
                  </span>
                </div>
              </div>

              <button className="w-full py-2.5 rounded-xl bg-black text-white hover:bg-zinc-800 text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center gap-2 border border-black shadow-sm">
                <Play className="w-3.5 h-3.5 fill-white text-white" /> Test Stream Instance
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
