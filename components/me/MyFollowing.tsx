// Following section for /me showing the countries the fan follows or an empty prompt to pick a team.
"use client";

import Link from "next/link";
import { useMemo } from "react";
import { X } from "lucide-react";
import { useState } from "react";
import { UpgradePrompt } from "@/components/membership/UpgradePrompt";
import { EmptyState } from "@/components/ui/EmptyState";
import { demoCountries } from "@/lib/data/demo";
import { useMembership } from "@/lib/store/membership";
import { useUpdateUser } from "@/lib/store/user";

export function MyFollowing({
  favoriteCountry,
  followedCountries,
  favoriteCity
}: {
  favoriteCountry: string | null;
  followedCountries: string[];
  favoriteCity: string;
}) {
  const { tier, getLimit } = useMembership();
  const updateUser = useUpdateUser();
  const followLimit = getLimit("maxCountryFilters");
  const isAtCap = tier === "free" && followedCountries.length >= followLimit;
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const sortedCountries = useMemo(
    () => [...followedCountries].sort((a, b) => a.localeCompare(b)),
    [followedCountries]
  );
  const countryLookup = useMemo(
    () => new Map(demoCountries.map((country) => [country.slug, country] as const)),
    []
  );
  const suggestedCountries = useMemo(
    () =>
      demoCountries
        .filter((country) => country.featured && !followedCountries.includes(country.slug))
        .slice(0, 8),
    [followedCountries]
  );
  const favoriteCountryMeta = favoriteCountry ? countryLookup.get(favoriteCountry) ?? null : null;

  function formatCountryLabel(country: string) {
    return countryLookup.get(country)?.name ?? country
      .split("-")
      .map((part) => (part.length <= 3 ? part.toUpperCase() : part.charAt(0).toUpperCase() + part.slice(1)))
      .join(" ");
  }

  function removeCountry(country: string) {
    if (!window.confirm(`Stop following ${formatCountryLabel(country)}?`)) return;
    const nextCountries = followedCountries.filter((entry) => entry !== country);
    updateUser({ followedCountries: nextCountries, favoriteCountries: nextCountries });
  }

  function addCountry(country: string) {
    if (followedCountries.includes(country)) return;
    if (isAtCap) {
      setShowUpgrade(true);
      return;
    }

    const nextCountries = [...followedCountries, country];
    updateUser({
      followedCountries: nextCountries,
      favoriteCountries: favoriteCountry ? [favoriteCountry, ...nextCountries.filter((entry) => entry !== favoriteCountry)] : nextCountries
    });
  }

  return (
    <section className="surface p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-mist">Backing and following</div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-deep">Who you&apos;re riding with</h2>
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

      {favoriteCountryMeta ? (
        <Link
          href={`/${favoriteCity || "nyc"}/map?country=${favoriteCountryMeta.slug}`}
          className="mt-5 flex min-h-28 items-center justify-between gap-4 rounded-[1.75rem] border border-line bg-surface-2 p-5 transition hover:border-line-strong"
        >
          <div className="flex items-center gap-4">
            <div className="text-5xl leading-none">{favoriteCountryMeta.flagEmoji}</div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-mist">Backing</div>
              <div className="mt-1 text-2xl font-semibold text-deep">{favoriteCountryMeta.name}</div>
            </div>
          </div>
          <span className="inline-flex min-h-10 items-center rounded-full border border-line bg-surface px-4 text-sm font-semibold text-deep">
            Open map →
          </span>
        </Link>
      ) : null}

      {isAtCap ? (
        <div className="mt-5 rounded-2xl border border-gold/50 bg-gold/10 p-4 text-sm text-deep">
          <div className="font-semibold">Following 3+ nations is a Fan Pass perk.</div>
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
              <div
                key={country}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-surface-2 px-4 text-sm font-semibold text-deep transition hover:border-line-strong"
              >
                <Link href={`/${favoriteCity || "nyc"}/map?country=${country}`} className="inline-flex items-center gap-2">
                  <span className="text-base leading-none">{countryLookup.get(country)?.flagEmoji ?? "🏳️"}</span>
                  <span>{formatCountryLabel(country)}</span>
                </Link>
                <button
                  type="button"
                  onClick={() => removeCountry(country)}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-line bg-surface text-mist"
                  aria-label={`Stop following ${formatCountryLabel(country)}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
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

      <div className="mt-5">
        <button
          type="button"
          onClick={() => setPickerOpen((current) => !current)}
          className="inline-flex min-h-11 items-center rounded-full border border-line bg-surface px-4 text-sm font-semibold text-deep transition hover:bg-surface-2"
        >
          + Follow another nation
        </button>
      </div>

      {pickerOpen ? (
        <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {suggestedCountries.map((country) => (
            <button
              key={country.slug}
              type="button"
              onClick={() => addCountry(country.slug)}
              className="flex min-h-14 items-center gap-3 rounded-2xl border border-line bg-surface-2 px-4 text-left text-sm font-semibold text-deep transition hover:border-line-strong"
            >
              <span className="text-xl leading-none">{country.flagEmoji}</span>
              <span>{country.name}</span>
            </button>
          ))}
        </div>
      ) : null}

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
