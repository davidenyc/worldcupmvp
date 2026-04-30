"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

import { CollapsibleGrid } from "@/components/ui/CollapsibleGrid";
import { trackCountryStripFlagTap } from "@/lib/analytics/track";
import { useUser } from "@/lib/store/user";
import type { CountrySummary } from "@/lib/types";

const POPULAR_COUNTRY_ORDER = ["argentina", "brazil", "france", "mexico", "portugal", "usa"] as const;

interface PrimaryCountryStripProps {
  countries: CountrySummary[];
  cityKey: string;
}

export function PrimaryCountryStrip({ countries, cityKey }: PrimaryCountryStripProps) {
  const router = useRouter();
  const { favoriteCountrySlug } = useUser();

  const sortedCountries = useMemo(() => {
    const preferredOrder = favoriteCountrySlug
      ? [favoriteCountrySlug, ...POPULAR_COUNTRY_ORDER.filter((slug) => slug !== favoriteCountrySlug)]
      : [...POPULAR_COUNTRY_ORDER];

    const orderLookup = new Map(preferredOrder.map((slug, index) => [slug, index] as const));

    return [...countries].sort((left, right) => {
      const leftIndex = orderLookup.get(left.slug);
      const rightIndex = orderLookup.get(right.slug);

      if (leftIndex !== undefined || rightIndex !== undefined) {
        if (leftIndex === undefined) return 1;
        if (rightIndex === undefined) return -1;
        return leftIndex - rightIndex;
      }

      if (left.featured !== right.featured) {
        return left.featured ? -1 : 1;
      }

      return left.name.localeCompare(right.name);
    });
  }, [countries, favoriteCountrySlug]);

  return (
    <section>
      <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-mist">
        Backing someone else? Pick a flag.
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
        <CollapsibleGrid initialCount={6} noun="nation">
          {sortedCountries.map((country) => (
            <button
              key={country.slug}
              type="button"
              onClick={() => {
                trackCountryStripFlagTap({ countrySlug: country.slug, cityKey });
                router.push(`/${cityKey}/map?country=${country.slug}`);
              }}
              aria-label={`${country.name} watch parties in ${cityKey}`}
              className="flex min-h-20 min-w-20 flex-col items-center justify-center rounded-2xl border border-line bg-[var(--bg-surface)] px-2 py-3 text-center transition hover:border-gold hover:ring-2 hover:ring-gold/30"
            >
              <span className="text-[2rem] leading-none sm:text-[2.5rem]">{country.flagEmoji}</span>
              <span className="mt-2 text-xs font-semibold text-[color:var(--fg-primary)]">
                {country.fifaCode ?? country.name}
              </span>
            </button>
          ))}
        </CollapsibleGrid>
      </div>
    </section>
  );
}
