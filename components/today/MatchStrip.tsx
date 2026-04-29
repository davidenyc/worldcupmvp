"use client";

import { useState } from "react";

import { CountryFlag } from "@/components/ui/CountryFlag";
import { WatchedCheckInSheet } from "@/components/matches/WatchedCheckInSheet";
import { getHostCity } from "@/lib/data/hostCities";
import { getMatchHostCityKey } from "@/lib/data/matchLocations";
import { formatMatchStageCompact } from "@/lib/data/today";
import type { WorldCupMatch } from "@/lib/data/matches";
import { useWatchlistStore } from "@/lib/store/watchlist";
import type { CountrySummary } from "@/lib/types";

type MatchStripProps = {
  matches: WorldCupMatch[];
  countriesBySlug: Record<string, CountrySummary>;
  activeMatchId: string | null;
  badgeLabel: string;
  onSelect: (matchId: string | null) => void;
};

function formatKickoff(startsAt: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(startsAt));
}

function formatVenueLabel(value?: string | null) {
  if (!value) return null;
  return value
    .split("-")
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ");
}

export function MatchStrip({
  matches,
  countriesBySlug,
  activeMatchId,
  badgeLabel,
  onSelect
}: MatchStripProps) {
  const [sheetMatchId, setSheetMatchId] = useState<string | null>(null);
  const watchedMatches = useWatchlistStore((state) => state.watchedMatches);
  const watchStatuses = useWatchlistStore((state) => state.watchStatuses);
  const watchVenues = useWatchlistStore((state) => state.watchVenues);
  const watchRatings = useWatchlistStore((state) => state.watchRatings);
  const planWatchMatch = useWatchlistStore((state) => state.planWatchMatch);
  const markWatchedMatch = useWatchlistStore((state) => state.markWatchedMatch);

  if (matches.length === 0) return null;

  const activeSheetMatch = matches.find((match) => match.id === sheetMatchId) ?? null;
  const activeSheetCityKey = activeSheetMatch ? getMatchHostCityKey(activeSheetMatch) ?? "nyc" : "nyc";
  const activeSheetCityLabel = getHostCity(activeSheetCityKey)?.label ?? activeSheetMatch?.city ?? "the host city";
  const activeSheetKickoffPassed = activeSheetMatch ? Date.now() > Date.parse(activeSheetMatch.startsAt) : false;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold uppercase tracking-[0.24em] text-mist">Today&apos;s matches</div>
          <div className="mt-1 text-body text-[color:var(--fg-secondary)]">
            Tap a match to find watch spots tuned to that crowd.
          </div>
        </div>
        {activeMatchId ? (
          <button
            type="button"
            onClick={() => onSelect(null)}
            className="inline-flex min-h-11 items-center rounded-full border border-line px-4 py-2 text-sm font-semibold text-deep"
          >
            Clear
          </button>
        ) : null}
      </div>
      <div className="grid gap-4 overflow-x-auto pb-2 md:grid-cols-2 lg:grid-cols-3">
        {matches.map((match) => {
          const home = countriesBySlug[match.homeCountry];
          const away = countriesBySlug[match.awayCountry];
          const active = match.id === activeMatchId;
          const kickoffPassed = Date.now() > Date.parse(match.startsAt);
          const status = watchStatuses[match.id];
          const isTracked = watchedMatches.includes(match.id);
          const isWatched = status === "watched";
          const plannedVenue = formatVenueLabel(watchVenues[match.id]);

          return (
            <div
              key={match.id}
              className={`min-h-11 min-w-[18rem] rounded-[1.5rem] border bg-[var(--bg-surface)] p-4 text-left shadow-sm md:min-w-0 ${
                active ? "border-gold border-2" : "border-line"
              }`}
            >
              <button
                type="button"
                aria-label={`Filter venues for ${home?.name ?? match.homeCountry} versus ${away?.name ?? match.awayCountry}`}
                onClick={() => onSelect(match.id)}
                className="block w-full text-left"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-[var(--accent-soft-bg)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--accent-soft-fg)]">
                    {badgeLabel}
                  </span>
                  <span className="text-sm text-mist">{formatKickoff(match.startsAt)}</span>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <CountryFlag country={home} size="md" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-deep">{home?.name ?? match.homeCountry}</div>
                  </div>
                </div>
                <div className="my-3 text-xs font-semibold uppercase tracking-[0.18em] text-mist">vs</div>
                <div className="flex items-center gap-3">
                  <CountryFlag country={away} size="md" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-deep">{away?.name ?? match.awayCountry}</div>
                  </div>
                </div>
                <div className="mt-4 text-sm text-[color:var(--fg-secondary)]">
                  {formatMatchStageCompact(match)}
                </div>
                <div className="mt-1 text-sm text-[color:var(--fg-secondary)]">{match.stadiumName}</div>
                <div className="mt-4 text-sm font-semibold text-gold">Tap to find watch spots →</div>
              </button>
              <div className="mt-4">
                {isWatched ? (
                  <button
                    type="button"
                    onClick={() => setSheetMatchId(match.id)}
                    className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-gold bg-gold/10 px-4 text-sm font-semibold text-deep"
                  >
                    ✓ Watched
                  </button>
                ) : kickoffPassed ? (
                  <button
                    type="button"
                    onClick={() => setSheetMatchId(match.id)}
                    className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-gold px-4 text-sm font-semibold text-deep transition hover:brightness-105"
                  >
                    I watched this →
                  </button>
                ) : isTracked ? (
                  <button
                    type="button"
                    onClick={() => setSheetMatchId(match.id)}
                    className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-[color:var(--accent-soft-fg)] bg-[var(--accent-soft-bg)] px-4 text-sm font-semibold text-[color:var(--accent-soft-fg)]"
                  >
                    {plannedVenue ? "Edit plan" : "✓ Watching"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => planWatchMatch(match.id)}
                    className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-line bg-[var(--bg-surface)] px-4 text-sm font-semibold text-deep"
                  >
                    I’ll watch this →
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {activeSheetMatch ? (
        <WatchedCheckInSheet
          open
          cityKey={activeSheetCityKey}
          cityLabel={activeSheetCityLabel}
          kickoffPassed={activeSheetKickoffPassed}
          initialVenueSlug={watchVenues[activeSheetMatch.id]}
          initialRating={watchRatings[activeSheetMatch.id]}
          onClose={() => setSheetMatchId(null)}
          onSubmit={({ venueSlug, rating }) => {
            if (activeSheetKickoffPassed) {
              markWatchedMatch(activeSheetMatch.id, { venueSlug, rating });
            } else {
              planWatchMatch(activeSheetMatch.id, venueSlug);
            }
            setSheetMatchId(null);
          }}
        />
      ) : null}
    </section>
  );
}
