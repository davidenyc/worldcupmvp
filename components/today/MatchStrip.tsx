"use client";

import { CountryFlag } from "@/components/ui/CountryFlag";
import { formatMatchStageCompact } from "@/lib/data/today";
import type { WorldCupMatch } from "@/lib/data/matches";
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

export function MatchStrip({
  matches,
  countriesBySlug,
  activeMatchId,
  badgeLabel,
  onSelect
}: MatchStripProps) {
  if (matches.length === 0) return null;

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

          return (
            <button
              key={match.id}
              type="button"
              aria-label={`Filter venues for ${home?.name ?? match.homeCountry} versus ${away?.name ?? match.awayCountry}`}
              onClick={() => onSelect(match.id)}
              className={`min-h-11 min-w-[18rem] rounded-[1.5rem] border bg-[var(--bg-surface)] p-4 text-left shadow-sm md:min-w-0 ${
                active ? "border-gold border-2" : "border-line"
              }`}
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
          );
        })}
      </div>
    </section>
  );
}
