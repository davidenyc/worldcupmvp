"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { CountrySummary } from "@/lib/types";

export function CountrySearch({ countries }: { countries: CountrySummary[] }) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return countries;
    return countries.filter((country) => country.name.toLowerCase().includes(normalized));
  }, [countries, query]);

  return (
    <div className="surface p-4">
      <label className="mb-3 block text-sm font-medium text-navy/80">Search countries</label>
      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Portugal, Mexico, Japan..."
      />
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((country) => (
          <Link
            key={country.slug}
            href={`/country/${country.slug}`}
            className="rounded-2xl border border-white bg-white p-4 transition hover:border-accent/40 hover:bg-sky/35"
          >
            <div className="text-3xl">{country.flagEmoji}</div>
            <div className="mt-3 font-semibold text-deep">{country.name}</div>
            <div className="mt-1 text-sm text-navy/60">{country.supportersLabel}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
