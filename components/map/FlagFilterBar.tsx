"use client";

import { useMemo, useState } from "react";

import { CountryFlag } from "@/components/ui/CountryFlag";
import { CountrySummary } from "@/lib/types";

export function FlagFilterBar({
  countries,
  selectedCountrySlugs,
  onToggleCountry,
  compact = false
}: {
  countries: CountrySummary[];
  selectedCountrySlugs: string[];
  onToggleCountry: (slug: string) => void;
  compact?: boolean;
}) {
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return countries;

    return countries.filter(
      (country) =>
        country.name.toLowerCase().includes(q) ||
        country.fifaCode.toLowerCase().includes(q) ||
        country.supporterKeywords.some((keyword) => keyword.toLowerCase().includes(q))
    );
  }, [countries, query]);

  return (
    <div
      className={`space-y-4 ${
        compact ? "" : "rounded-2xl border border-[#d8e3f5] bg-white/95 p-4 text-[#0a1628] backdrop-blur-md shadow-sm dark:border-white/10 dark:bg-[#161b22] dark:text-white"
      }`}
    >
      {selectedCountrySlugs.length > 0 ? (
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-[#f4f8ff] p-2 dark:bg-white/8">
          <span className="mr-1 text-xs font-semibold text-[#0a1628]/55 dark:text-white">Watching:</span>
          {selectedCountrySlugs.map((slug) => {
            const country = countries.find((item) => item.slug === slug);
            if (!country) return null;

            return (
              <button
                key={slug}
                type="button"
                onClick={() => onToggleCountry(slug)}
                className="inline-flex items-center gap-1 rounded-full bg-[#f4b942] px-2 py-1 text-xs font-bold text-[#0a1628]"
              >
                <CountryFlag country={country} size="sm" className="shrink-0" />
                {country.name} ×
              </button>
            );
          })}
        </div>
      ) : null}

      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="🔍 Search countries"
        className="h-11 w-full rounded-full border border-[#d8e3f5] bg-white px-4 text-sm text-[#0a1628] outline-none placeholder:text-[#0a1628]/35 dark:border-white/10 dark:bg-white/8 dark:text-white dark:placeholder:text-white/30"
      />

      <div className="overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex min-w-max gap-2">
          {visible.map((country) => {
            const active = selectedCountrySlugs.includes(country.slug);

            return (
              <button
                key={country.slug}
                type="button"
                onClick={() => onToggleCountry(country.slug)}
                className={`flex h-9 shrink-0 items-center gap-2 rounded-full border px-3 text-sm transition ${
                  active
                    ? "border-[#f4b942] bg-[#f4b942] font-bold text-[#0a1628]"
                    : "border-[#d8e3f5] bg-white text-[#0a1628] dark:border-white/10 dark:bg-white/5 dark:text-white"
                }`}
              >
                <CountryFlag country={country} size="sm" className="shrink-0" />
                <span>{country.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
