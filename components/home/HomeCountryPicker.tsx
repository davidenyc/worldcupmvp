"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { CollapsibleGrid } from "@/components/ui/CollapsibleGrid";
import { useUserCity } from "@/lib/hooks/useUserCity";
import { CountrySummary } from "@/lib/types";

const POPULAR_COUNTRY_ORDER = ["argentina", "brazil", "france", "mexico", "portugal", "usa"] as const;

export function HomeCountryPicker({ countries }: { countries: CountrySummary[] }) {
  const router = useRouter();
  const { userCity, suggestedCity } = useUserCity();
  const [search, setSearch] = useState("");
  const targetCity = userCity ?? suggestedCity ?? "nyc";

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return countries;
    return countries.filter((country) => country.name.toLowerCase().includes(query));
  }, [countries, search]);
  const sortedCountries = useMemo(
    () =>
      [...visible].sort((left, right) => {
        const leftPopularIndex = POPULAR_COUNTRY_ORDER.indexOf(left.slug as (typeof POPULAR_COUNTRY_ORDER)[number]);
        const rightPopularIndex = POPULAR_COUNTRY_ORDER.indexOf(right.slug as (typeof POPULAR_COUNTRY_ORDER)[number]);

        if (leftPopularIndex !== -1 || rightPopularIndex !== -1) {
          if (leftPopularIndex === -1) return 1;
          if (rightPopularIndex === -1) return -1;
          return leftPopularIndex - rightPopularIndex;
        }

        if (left.featured !== right.featured) {
          return left.featured ? -1 : 1;
        }

        return left.name.localeCompare(right.name);
      }),
    [visible]
  );

  return (
    <div>
      <input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        type="search"
        placeholder="Search your country…"
        className="mt-4 h-12 w-full rounded-full border border-line bg-transparent px-4 text-sm text-[color:var(--fg-primary)] outline-none placeholder:text-mist focus:border-gold"
      />
      <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-3 md:grid-cols-6">
        <CollapsibleGrid initialCount={6} noun="nation" nounPlural="nations">
          {sortedCountries.map((country) => (
            <button
              key={country.slug}
              type="button"
              onClick={() => router.push(`/${targetCity}/map?country=${country.slug}`)}
              className="flex h-20 flex-col items-center justify-center gap-1 rounded-2xl border border-line bg-surface px-2 text-center text-xs font-semibold text-deep transition hover:bg-surface-2"
            >
              <span className="text-2xl">{country.flagEmoji}</span>
              <span className="truncate">{country.fifaCode ?? country.name}</span>
            </button>
          ))}
        </CollapsibleGrid>
      </div>
    </div>
  );
}
