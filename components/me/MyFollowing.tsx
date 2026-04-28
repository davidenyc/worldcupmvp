// Following section for /me showing the countries the fan follows or an empty prompt to pick a team.
"use client";

import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import type { MembershipTier } from "@/lib/store/membership";

export function MyFollowing({
  followedCountries,
  favoriteCity,
  tier
}: {
  followedCountries: string[];
  favoriteCity: string;
  tier: MembershipTier;
}) {
  const label = tier === "free" ? "Follow up to 2 countries free · Upgrade for all 48" : "Following all your teams";

  return (
    <section className="surface p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm uppercase tracking-[0.2em] text-mist">Following</div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-deep">Countries you back</h2>
          <p className="mt-2 text-sm text-mist">{label}</p>
        </div>
        <Link href={`/${favoriteCity || "nyc"}/map`} className="inline-flex min-h-11 items-center rounded-full border border-line bg-surface px-4 text-sm font-semibold text-deep transition hover:bg-surface-2">
          Browse countries →
        </Link>
      </div>

      <div className="mt-5">
        {followedCountries.length ? (
          <div className="flex flex-wrap gap-2">
            {followedCountries.map((country) => (
              <div key={country} className="inline-flex min-h-11 items-center rounded-full border border-line bg-surface-2 px-4 text-sm font-semibold text-deep">
                {country.replace(/-/g, " ")}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            emoji="🏳️"
            title="No countries yet"
            subtitle="Pick your team so the app can rank the right bars, restaurants, and promos first."
            action={
              <Link href="/" className="inline-flex rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-deep">
                Pick your team →
              </Link>
            }
          />
        )}
      </div>
    </section>
  );
}
