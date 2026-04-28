// Watchlist section for /me summarizing matches the fan marked as “I’m watching this”.
"use client";

import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { demoCountries } from "@/lib/data/demo";
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
  const countryLookup = new Map(demoCountries.map((country) => [country.slug, country] as const));

  return (
    <section className="surface p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-mist">Watching</div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-deep">Upcoming match plans</h2>
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
                <div className="flex flex-wrap items-center gap-2 text-base font-semibold text-deep">
                  <span>{countryLookup.get(match.homeCountry)?.flagEmoji ?? "🏳️"}</span>
                  <span>{countryLookup.get(match.homeCountry)?.name ?? match.homeCountry}</span>
                  <span className="text-mist">vs</span>
                  <span>{countryLookup.get(match.awayCountry)?.flagEmoji ?? "🏳️"}</span>
                  <span>{countryLookup.get(match.awayCountry)?.name ?? match.awayCountry}</span>
                </div>
                <div className="mt-1 text-sm text-mist">
                  {match.stage ? `${match.stage} · ` : ""}
                  {new Date(match.startsAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <span className="inline-flex min-h-10 items-center rounded-full border border-line bg-surface px-4 text-sm text-mist">
                    {watchVenues[match.id] ? `Venue locked: ${watchVenues[match.id]}` : "No venue picked yet"}
                  </span>
                  <Link href={`/${cityKey || "nyc"}/map?match=${match.id}`} className="inline-flex min-h-10 items-center rounded-full border border-line bg-surface px-4 text-sm font-semibold text-deep transition hover:bg-surface">
                    {watchVenues[match.id] ? "Change venue →" : "Pick a venue →"}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            emoji="📅"
            title="No matches saved"
            subtitle="Tap “I’m watching this” on Home, Today, or Matches to keep your slate together."
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
