import { getTrendingGames } from "@/lib/rawg";
import GameLibraryGrid from "./GameLibraryGrid";

// Server component: fetches the real, live RAWG game catalog (same source
// frontendnimbuz.vercel.app uses) instead of a hardcoded mock list.
export const dynamic = "force-dynamic";

export default async function GameLibraryPage() {
  const { games, error } = await getTrendingGames(24);
  return <GameLibraryGrid games={games} error={error} />;
}
