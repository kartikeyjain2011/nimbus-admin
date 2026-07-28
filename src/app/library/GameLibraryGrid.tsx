"use client";

import { useState } from "react";
import { Search, Play, HardDrive, CheckCircle, Flame } from "lucide-react";
import type { RawgGame } from "@/lib/rawg";

// Deterministic pseudo-metrics derived from RAWG's real "added" popularity
// count, since Nimbus-specific fields (min plan tier, streamers online,
// NVMe pre-cache size) don't exist in RAWG's public schema.
function deriveMinTier(rating: number): string {
  if (rating >= 4.5) return "Ultra";
  if (rating >= 4.0) return "Priority";
  return "Basic";
}

function deriveStorageGB(playtime: number, id: number): number {
  const base = 35 + (playtime || 1) * 8;
  return Math.min(140, Math.round(base + (id % 20)));
}

export default function GameLibraryGrid({ games, error }: { games: RawgGame[]; error?: string }) {
  const [search, setSearch] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");

  const allGenres = Array.from(
    new Set(games.flatMap((g) => g.genres.map((genre) => genre.name)))
  ).slice(0, 6);

  const filteredGames = games.filter((g) => {
    const matchesSearch = g.name.toLowerCase().includes(search.toLowerCase());
    const matchesGenre = selectedGenre === "All" || g.genres.some((genre) => genre.name === selectedGenre);
    return matchesSearch && matchesGenre;
  });

  return (
    <div className="space-y-6">
      <div className="card-panel rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-xl text-[#f3f4f6]">Nimbus Cloud Game Catalog</h1>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30">
              {games.length} Titles (Live RAWG Feed)
            </span>
          </div>
          <p className="text-xs text-[#8e96ab] mt-1">
            Real game metadata pulled from the RAWG catalog API — the same source frontendnimbuz.vercel.app uses.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="px-3.5 py-2 rounded-xl bg-[#090a0f] border border-[#222638] flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-[#00f0ff]" />
            <span>Est. NVMe Pool: <strong className="text-[#10b981]">250 TB Pre-cached</strong></span>
          </div>
        </div>
      </div>

      {error && (
        <div className="card-panel rounded-2xl p-4 border border-[#f59e0b]/30 text-xs font-mono text-[#f59e0b]">
          {error} — add <code>NEXT_PUBLIC_RAWG_API_KEY</code> to <code>.env.local</code> to load the live catalog.
        </div>
      )}

      <div className="card-panel rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#8e96ab] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title..."
            className="w-full bg-[#090a0f] border border-[#222638] focus:border-[#00f0ff] focus:outline-none rounded-xl pl-9 pr-4 py-2 text-xs text-[#f3f4f6]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto text-xs font-mono">
          {["All", ...allGenres].map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                selectedGenre === genre
                  ? "bg-[#00f0ff] text-[#090a0f] font-bold"
                  : "bg-[#090a0f] text-[#8e96ab] border border-[#222638] hover:text-[#f3f4f6]"
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredGames.map((game) => {
          const minTier = deriveMinTier(game.rating);
          const storageGB = deriveStorageGB(game.playtime, game.id);
          return (
            <div key={game.id} className="card-panel rounded-2xl overflow-hidden card-panel-hover transition-all flex flex-col justify-between">
              {game.background_image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={game.background_image} alt={game.name} className="w-full h-32 object-cover" />
              )}
              <div className="p-5 space-y-4 flex flex-col justify-between flex-1">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#8e96ab]">
                      {game.genres[0]?.name ?? "Uncategorized"}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30">
                      <Flame className="w-3 h-3" /> {game.rating.toFixed(1)} / 5
                    </span>
                  </div>

                  <h3 className="font-bold text-[#f3f4f6] text-base leading-tight mb-1">{game.name}</h3>
                  <p className="text-xs text-[#8e96ab] font-mono">
                    {game.released ? new Date(game.released).getFullYear() : "TBA"}
                    {game.metacritic ? ` • Metacritic ${game.metacritic}` : ""}
                  </p>
                </div>

                <div className="space-y-2 pt-3 border-t border-[#222638] text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-[#8e96ab]">Minimum Plan:</span>
                    <span className="text-[#00f0ff] font-semibold">{minTier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8e96ab]">Platforms:</span>
                    <span className="text-[#a855f7] text-right">
                      {game.parent_platforms.slice(0, 2).map((p) => p.platform.name).join(", ") || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8e96ab]">NVMe Pre-cache:</span>
                    <span className="text-[#10b981] flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Ready (~{storageGB} GB)
                    </span>
                  </div>
                </div>

                <button className="w-full py-2 rounded-xl bg-[#161926] border border-[#222638] hover:border-[#00f0ff]/40 text-[#00f0ff] text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center gap-2">
                  <Play className="w-3.5 h-3.5 fill-[#00f0ff]" /> Launch Test Stream Node
                </button>
              </div>
            </div>
          );
        })}

        {filteredGames.length === 0 && !error && (
          <div className="col-span-full text-center text-xs text-[#8e96ab] py-10">
            No titles match your filters.
          </div>
        )}
      </div>
    </div>
  );
}
