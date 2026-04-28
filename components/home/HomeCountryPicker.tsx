"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { CollapsibleGrid } from "@/components/ui/CollapsibleGrid";
import { useUserCity } from "@/lib/hooks/useUserCity";
import { CountrySummary } from "@/lib/types";

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
    () => [...visible].sort((left, right) => left.name.localeCompare(right.name)),
    [visible]
  );

  return (
    <div>
      <input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        type="search"
        placeholder="Search your country…"
        className="mt-4 h-12 w-full rounded-full border border-line bg-surface px-4 text-sm text-deep outline-none placeholder:text-mist"
      />
      <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
        <CollapsibleGrid initialCount={9} noun="nation" nounPlural="nations">
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
