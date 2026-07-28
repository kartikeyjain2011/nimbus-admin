// ─── RAWG API Utility ───────────────────────────────────────────────────────
// Same public game-catalog API used by frontendnimbuz's lib/rawg.ts, mirrored
// here so the admin console's Game Library page reflects the real catalog
// instead of a hardcoded mock list.
// Docs: https://rawg.io/apidocs

const BASE = "https://api.rawg.io/api";
const KEY = process.env.NEXT_PUBLIC_RAWG_API_KEY || process.env.RAWG_API_KEY;

export interface RawgGame {
  id: number;
  slug: string;
  name: string;
  released: string;
  background_image: string | null;
  rating: number;
  rating_top: number;
  metacritic: number | null;
  playtime: number;
  added: number;
  genres: { id: number; name: string; slug: string }[];
  parent_platforms: { platform: { id: number; name: string; slug: string } }[];
}

interface RawgGamesResponse {
  count: number;
  results: RawgGame[];
}

export interface RawgCatalogResult {
  games: RawgGame[];
  totalCount: number;
  error?: string;
}

/**
 * Fetches trending / highly-rated titles from the real RAWG catalog —
 * the same data source frontendnimbuz uses to populate its store & library.
 */
export async function getTrendingGames(count = 24): Promise<RawgCatalogResult> {
  if (!KEY) {
    return {
      games: [],
      totalCount: 0,
      error: "NEXT_PUBLIC_RAWG_API_KEY is not set. Add it to .env.local to load the real game catalog.",
    };
  }

  try {
    const url = `${BASE}/games?key=${KEY}&ordering=-added&page_size=${count}&metacritic=70,100`;
    const res = await fetch(url, { next: { revalidate: 3600 } });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return {
        games: [],
        totalCount: 0,
        error: `RAWG API responded with ${res.status}. ${body}`.trim(),
      };
    }

    const data: RawgGamesResponse = await res.json();
    return { games: data.results, totalCount: data.count };
  } catch (e) {
    return {
      games: [],
      totalCount: 0,
      error: e instanceof Error ? `Failed to reach RAWG API: ${e.message}` : "Failed to reach RAWG API.",
    };
  }
}

/** Search the RAWG catalog by title/genre for the Library page search box. */
export async function searchGames(query: string, count = 24): Promise<RawgCatalogResult> {
  if (!KEY) {
    return {
      games: [],
      totalCount: 0,
      error: "NEXT_PUBLIC_RAWG_API_KEY is not set.",
    };
  }
  if (!query.trim()) return getTrendingGames(count);

  try {
    const url = `${BASE}/games?key=${KEY}&search=${encodeURIComponent(query)}&page_size=${count}`;
    const res = await fetch(url, { next: { revalidate: 600 } });
    if (!res.ok) {
      return { games: [], totalCount: 0, error: `RAWG API responded with ${res.status}` };
    }
    const data: RawgGamesResponse = await res.json();
    return { games: data.results, totalCount: data.count };
  } catch (e) {
    return {
      games: [],
      totalCount: 0,
      error: e instanceof Error ? e.message : "Failed to reach RAWG API.",
    };
  }
}
