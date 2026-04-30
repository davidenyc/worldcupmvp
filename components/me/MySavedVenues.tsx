// Saved venues section for /me that starts as a shell and is upgraded in later commits.
"use client";

import Link from "next/link";
import { useState } from "react";
import { UpgradePrompt } from "@/components/membership/UpgradePrompt";
import { EmptyState } from "@/components/ui/EmptyState";
import { VenueCard } from "@/components/venue/venue-card";
import { useMembership } from "@/lib/store/membership";
import type { RankedVenue } from "@/lib/types";

export function MySavedVenues({
  venues,
  cityKey
}: {
  venues: RankedVenue[];
  cityKey: string;
}) {
  const { tier, getLimit } = useMembership();
  const saveLimit = getLimit("maxSaves");
  const isFreeCap = tier === "free" && venues.length >= saveLimit;
  const [showUpgrade, setShowUpgrade] = useState(false);

  return (
    <section className="surface p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-mist">Saved venues</div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-deep">Your shortlist</h2>
          <p className="mt-2 text-sm text-mist">
            {tier === "free"
              ? `Saved · ${venues.length} of ${Number.isFinite(saveLimit) ? saveLimit : "∞"} (Free)`
              : `Saved · ${venues.length} (${tier === "fan" ? "Fan Pass" : "Elite"} — unlimited)`}
          </p>
        </div>
      </div>

      {isFreeCap ? (
        <div className="mt-5 rounded-2xl border border-gold/50 bg-gold/10 p-4 text-sm text-deep">
          <div className="font-semibold">Hit your save limit?</div>
          <div className="mt-1 text-mist">Fan Pass unlocks unlimited saves across all 17 host cities.</div>
          <button
            type="button"
            onClick={() => setShowUpgrade(true)}
            className="mt-3 inline-flex min-h-10 items-center rounded-full bg-gold px-4 text-sm font-semibold text-deep"
          >
            Upgrade to Fan Pass →
          </button>
        </div>
      ) : null}

      <div className="mt-5">
        {venues.length ? (
          <div className="grid gap-4">
            {venues.map((venue) => (
              <VenueCard key={venue.id} venue={venue} />
            ))}
          </div>
        ) : (
          <EmptyState
            emoji="❤️"
            title="Nothing saved yet"
            subtitle="Browse the map and tap the heart on any venue to build your short list."
            action={
              <Link href={`/${cityKey || "nyc"}/map`} className="inline-flex min-h-11 items-center justify-center rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-deep">
                Browse the map →
              </Link>
            }
          />
        )}
      </div>

      {showUpgrade ? (
        <UpgradePrompt feature="unlimited_saves" requiredTier="fan" onClose={() => setShowUpgrade(false)} />
      ) : null}
    </section>
  );
}
