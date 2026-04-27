"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { VenueCard } from "@/components/venue/venue-card";
import { HOST_CITIES } from "@/lib/data/hostCities";
import { searchVenues } from "@/lib/search/venueSearch";
import { RankedVenue } from "@/lib/types";

export function SearchPageClient({
  initialCity,
  venuesByCity
}: {
  initialCity: string;
  venuesByCity: Record<string, RankedVenue[]>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [city, setCity] = useState(searchParams.get("city") ?? initialCity);
  const [results, setResults] = useState<RankedVenue[]>(() =>
    (venuesByCity[searchParams.get("city") ?? initialCity] ?? []).slice(0, 20)
  );
  const [loading, setLoading] = useState(false);
  const cityOptions = useMemo(() => HOST_CITIES, []);
  const allVenues = venuesByCity[city] ?? [];

  useEffect(() => {
    const nextParams = new URLSearchParams(searchParams.toString());
    if (query.trim()) nextParams.set("q", query.trim());
    else nextParams.delete("q");
    nextParams.set("city", city);
    router.replace(`/search?${nextParams.toString()}`, { scroll: false });
  }, [city, query, router, searchParams]);

  useEffect(() => {
    setLoading(true);
    const timeout = window.setTimeout(() => {
      setResults(searchVenues(allVenues, query).slice(0, 20));
      setLoading(false);
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [allVenues, query]);

  return (
    <div className="container-shell py-8">
      <input
        autoFocus
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search bars, restaurants, countries..."
        className="h-14 w-full rounded-full border border-[#d8e3f5] bg-white px-5 text-lg outline-none ring-[#f4b942] focus:ring-2"
      />
      <div className="mt-4 flex gap-2 overflow-x-auto">
        {cityOptions.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setCity(item.key)}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${city === item.key ? "bg-[#f4b942] text-[#0a1628]" : "border border-line bg-white text-navy"}`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="mt-6">
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : results.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {results.map((venue) => (
              <VenueCard key={venue.id} venue={venue} />
            ))}
          </div>
        ) : (
          <EmptyState
            emoji="🔎"
            title={`No venues found for "${query}" in ${HOST_CITIES.find((item) => item.key === city)?.label ?? city}`}
            subtitle={`Try "French bar", "sports bar", or "Argentina".`}
            action={
              <Link href={`/${city}/map`} className="inline-flex rounded-full bg-[#f4b942] px-5 py-2.5 text-sm font-bold text-[#0a1628]">
                Browse the map
              </Link>
            }
          />
        )}
      </div>
    </div>
  );
}
