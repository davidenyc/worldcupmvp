// Saved venues section for /me that starts as a shell and is upgraded in later commits.
"use client";

import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import type { MembershipTier } from "@/lib/store/membership";
import type { RankedVenue } from "@/lib/types";

export function MySavedVenues({
  venues,
  tier
}: {
  venues: RankedVenue[];
  tier: MembershipTier;
}) {
  return (
    <section className="surface p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm uppercase tracking-[0.2em] text-mist">Saved venues</div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-deep">Saved</h2>
          <p className="mt-2 text-sm text-mist">
            {tier === "free" ? `Saved · ${venues.length} of 5 (Free)` : `Saved · ${venues.length} (${tier === "fan" ? "Fan Pass" : "Elite"} — unlimited)`}
          </p>
        </div>
      </div>

      <div className="mt-5">
        {venues.length ? (
          <div className="grid gap-3">
            {venues.slice(0, 3).map((venue) => (
              <Link key={venue.slug} href={`/venue/${venue.slug}`} className="rounded-2xl border border-line bg-surface-2 p-4 transition hover:border-line-strong">
                <div className="text-base font-semibold text-deep">{venue.name}</div>
                <div className="mt-1 text-sm text-mist">{venue.neighborhood || venue.address}</div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            emoji="❤️"
            title="Nothing saved yet"
            subtitle="Browse the map and tap the heart on any venue to build your short list."
            action={
              <Link href="/nyc/map" className="inline-flex rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-deep">
                Browse the map →
              </Link>
            }
          />
        )}
      </div>
    </section>
  );
}
