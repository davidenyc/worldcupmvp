// Watchlist toggle used across Home, Today, and Matches cards to save matches into /me.
"use client";

import { Star } from "lucide-react";
import { useWatchlistStore } from "@/lib/store/watchlist";

export function WatchToggleButton({
  matchId,
  className = ""
}: {
  matchId: string;
  className?: string;
}) {
  const watchedMatches = useWatchlistStore((state) => state.watchedMatches);
  const toggleWatchedMatch = useWatchlistStore((state) => state.toggleWatchedMatch);
  const watching = watchedMatches.includes(matchId);

  return (
    <button
      type="button"
      onClick={() => toggleWatchedMatch(matchId)}
      aria-label={watching ? "Remove from watchlist" : "Add to watchlist"}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full border px-4 text-sm font-semibold transition ${
        watching
          ? "border-gold bg-gold/12 text-deep"
          : "border-line bg-surface text-deep hover:bg-surface-2"
      } ${className}`.trim()}
    >
      <Star className={`h-4 w-4 ${watching ? "fill-current text-gold" : "text-mist"}`} />
      {watching ? "Watching" : "I’m watching this"}
    </button>
  );
}
