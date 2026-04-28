// Watchlist section for /me summarizing matches the fan marked as “I’m watching this”.
"use client";

import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import type { WorldCupMatch } from "@/lib/data/matches";

export function MyWatchlist({
  matches,
  watchVenues,
  cityKey
}: {
  matches: WorldCupMatch[];
  watchVenues: Record<string, string | null>;
  cityKey: string;
}) {
  function formatCountryLabel(country: string) {
    return country
      .split("-")
      .map((part) => (part.length <= 3 ? part.toUpperCase() : part.charAt(0).toUpperCase() + part.slice(1)))
      .join(" ");
  }

  return (
    <section className="surface p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm uppercase tracking-[0.2em] text-mist">Watching</div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-deep">Matches I&apos;ve RSVP&apos;d to</h2>
        </div>
        <Link href="/matches" className="inline-flex min-h-11 items-center rounded-full border border-line bg-surface px-4 text-sm font-semibold text-deep transition hover:bg-surface-2">
          Browse the schedule →
        </Link>
      </div>

      <div className="mt-5">
        {matches.length ? (
          <div className="grid gap-3">
            {matches.map((match) => (
              <div key={match.id} className="rounded-2xl border border-line bg-surface-2 p-4">
                <div className="text-base font-semibold text-deep">
                  {formatCountryLabel(match.homeCountry)} vs {formatCountryLabel(match.awayCountry)}
                </div>
                <div className="mt-1 text-sm text-mist">
                  {new Date(match.startsAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                </div>
                <div className="mt-2 text-sm text-mist">
                  {watchVenues[match.id] ? `Watching at ${watchVenues[match.id]}` : "No venue selected yet"}
                </div>
                {!watchVenues[match.id] ? (
                  <Link href={`/${cityKey || "nyc"}/map?match=${match.id}`} className="mt-3 inline-flex min-h-10 items-center rounded-full border border-line bg-surface px-4 text-sm font-semibold text-deep transition hover:bg-surface">
                    Find a watch spot →
                  </Link>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            emoji="📅"
            title="No matches saved"
            subtitle="Tap “I’m watching this” on Home, Today, or Matches to keep your slate in one place."
            action={
              <Link href="/matches" className="inline-flex rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-deep">
                Browse the schedule →
              </Link>
            }
          />
        )}
      </div>
    </section>
  );
}
