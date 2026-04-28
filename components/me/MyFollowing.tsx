// Following section for /me showing the countries the fan follows or an empty prompt to pick a team.
"use client";

import Link from "next/link";
import { useMemo } from "react";
import { X } from "lucide-react";
import { useState } from "react";
import { UpgradePrompt } from "@/components/membership/UpgradePrompt";
import { EmptyState } from "@/components/ui/EmptyState";
import { useMembership } from "@/lib/store/membership";
import { useUpdateUser } from "@/lib/store/user";

export function MyFollowing({
  followedCountries,
  favoriteCity
}: {
  followedCountries: string[];
  favoriteCity: string;
}) {
  const { tier, getLimit } = useMembership();
  const updateUser = useUpdateUser();
  const followLimit = getLimit("maxCountryFilters");
  const isAtCap = tier === "free" && followedCountries.length >= followLimit;
  const [showUpgrade, setShowUpgrade] = useState(false);
  const sortedCountries = useMemo(
    () => [...followedCountries].sort((a, b) => a.localeCompare(b)),
    [followedCountries]
  );

  function formatCountryLabel(country: string) {
    return country
      .split("-")
      .map((part) => (part.length <= 3 ? part.toUpperCase() : part.charAt(0).toUpperCase() + part.slice(1)))
      .join(" ");
  }

  function removeCountry(country: string) {
    if (!window.confirm(`Stop following ${formatCountryLabel(country)}?`)) return;
    const nextCountries = followedCountries.filter((entry) => entry !== country);
    updateUser({ followedCountries: nextCountries, favoriteCountries: nextCountries });
  }

  return (
    <section className="surface p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm uppercase tracking-[0.2em] text-mist">Following</div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-deep">Countries you back</h2>
          <p className="mt-2 text-sm text-mist">
            {tier === "free"
              ? `Follow up to ${followLimit} countries free · Upgrade for all 48`
              : "Following all your teams"}
          </p>
        </div>
        <Link href={`/${favoriteCity || "nyc"}/map`} className="inline-flex min-h-11 items-center rounded-full border border-line bg-surface px-4 text-sm font-semibold text-deep transition hover:bg-surface-2">
          Browse countries →
        </Link>
      </div>

      {isAtCap ? (
        <div className="mt-5 rounded-2xl border border-gold/50 bg-gold/10 p-4 text-sm text-deep">
          <div className="font-semibold">Follow limit reached</div>
          <div className="mt-1 text-mist">
            You&apos;re following {followedCountries.length} of {followLimit} free countries. Fan Pass unlocks all 48.
          </div>
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
        {sortedCountries.length ? (
          <div className="flex flex-wrap gap-2">
            {sortedCountries.map((country) => (
              <button
                key={country}
                type="button"
                onClick={() => removeCountry(country)}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-surface-2 px-4 text-sm font-semibold text-deep transition hover:border-line-strong"
              >
                <span>{formatCountryLabel(country)}</span>
                <X className="h-4 w-4 text-mist" />
              </button>
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

      {showUpgrade ? (
        <UpgradePrompt
          feature="unlimited_country_filters"
          requiredTier="fan"
          onClose={() => setShowUpgrade(false)}
        />
      ) : null}
    </section>
  );
}
