"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CountrySummary } from "@/lib/types";

export function FlagFilterBar({
  countries,
  selectedCountrySlugs,
  soccerBarsMode,
  onToggle,
  onSoccerBarsToggle,
  onClear
}: {
  countries: CountrySummary[];
  selectedCountrySlugs: string[];
  soccerBarsMode: boolean;
  onToggle: (slug: string) => void;
  onSoccerBarsToggle: () => void;
  onClear: () => void;
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
    <div className="surface space-y-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm uppercase tracking-[0.2em] text-mist">Country flags</div>
          <div className="text-lg font-semibold text-deep">Filter markers by supporter flag</div>
        </div>
        <Button variant="ghost" onClick={onClear}>
          Clear all
        </Button>
      </div>
      <button
        type="button"
        aria-pressed={soccerBarsMode}
        onClick={onSoccerBarsToggle}
        className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
          soccerBarsMode
            ? "border-emerald-800 bg-emerald-800 text-white shadow-card"
            : "border-line bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
      >
        <div className="text-sm font-semibold">⚽ Soccer Bars</div>
        <div className={`mt-1 text-xs ${soccerBarsMode ? "text-white/80" : "text-gray-600"}`}>
          Generic soccer bars with no country-specific supporter tag
        </div>
      </button>
      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search flags, country names, FIFA codes"
      />
      <div className="flex gap-3 overflow-x-auto pb-1">
        {visible.map((country) => {
          const active = selectedCountrySlugs.includes(country.slug);
          return (
            <button
              key={country.slug}
              type="button"
              onClick={() => onToggle(country.slug)}
              className={`min-w-[84px] rounded-2xl border px-3 py-3 text-center transition ${
                active
                  ? "border-accent bg-sky shadow-card"
                  : "border-line bg-white hover:bg-sky/50"
              }`}
            >
              <div className="text-2xl">{country.flagEmoji}</div>
              <div className="mt-1 text-xs font-semibold text-deep">{country.fifaCode}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
