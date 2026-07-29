import { NextResponse } from "next/server";
import { getStoreGames, setStoreGames } from "@/lib/dataStore";

export async function GET() {
  try {
    let games = getStoreGames();

    if (games.length === 0) {
      const rawgApiKey = process.env.NEXT_PUBLIC_RAWG_API_KEY || "eff2d0fa962b4061bd1a6fab810525d3";
      try {
        const rawgRes = await fetch(`https://api.rawg.io/api/games?key=${rawgApiKey}&page_size=12&ordering=-rating`, { cache: "no-store" });
        if (rawgRes.ok) {
          const rawgData = await rawgRes.json();
          if (Array.isArray(rawgData.results)) {
            games = rawgData.results.map((g: Record<string, unknown>, idx: number) => {
              const gObj = g as {
                id?: number;
                name?: string;
                developers?: Array<{ name?: string }>;
                publishers?: Array<{ name?: string }>;
                genres?: Array<{ name?: string }>;
                rating?: number | string;
                background_image?: string;
              };
              return {
                id: gObj.id || idx + 1,
                title: gObj.name || "Unknown Game",
                publisher: gObj.developers?.[0]?.name || gObj.publishers?.[0]?.name || "AAA Game Studio",
                genre: gObj.genres?.[0]?.name || "Action RPG",
                activePlayers: Math.floor(400 + Math.random() * 900),
                precached: true,
                minTier: idx % 3 === 0 ? ("Basic" as const) : idx % 3 === 1 ? ("Priority" as const) : ("Ultra" as const),
                rayTracing: idx % 2 === 0 ? "Path Tracing / DLSS 3.5" : "Ray-Traced Reflections",
                storageGB: Math.floor(45 + Math.random() * 80),
                rating: gObj.rating ? String(gObj.rating) : "9.5",
                purchasesCount: Math.floor(800 + Math.random() * 1500),
                bgImage: gObj.background_image
              };
            });
            setStoreGames(games);
          }
        }
      } catch (e) {
        console.warn("RAWG fetch notice:", e);
      }
    }

    const totalTitles = games.length;
    const totalStreaming = games.reduce((acc, g) => acc + g.activePlayers, 0);
    const totalPurchases = games.reduce((acc, g) => acc + (g.purchasesCount || 0), 0);

    return NextResponse.json({
      success: true,
      summary: {
        totalTitles,
        totalStreaming,
        totalPurchases,
        nvmePrecachedTB: "250 TB"
      },
      games,
      source: "RAWG Game Database API & Storefront Sync"
    });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
