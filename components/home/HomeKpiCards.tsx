// Clickable KPI cards for the homepage hero that route into useful city and matchday views.
"use client";

import Link from "next/link";

import { getHostCity } from "@/lib/data/hostCities";
import { useUserCity } from "@/lib/hooks/useUserCity";

export function HomeKpiCards({
  hostCityCount,
  totalVenues,
  reservableVenues
}: {
  hostCityCount: number;
  totalVenues: number;
  reservableVenues: number;
}) {
  const { userCity, suggestedCity } = useUserCity();
  const activeCity = getHostCity(userCity ?? suggestedCity ?? "nyc")?.key ?? "nyc";

  const items = [
    { label: "Host cities", value: hostCityCount.toLocaleString(), href: "/today" },
    { label: "Venues", value: totalVenues.toLocaleString(), href: `/${activeCity}/map` },
    { label: "Reservations", value: reservableVenues.toLocaleString(), href: `/${activeCity}/map?reservations=1` }
  ];

  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-3">
      {items.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className="surface group block p-4 transition hover:border-gold/50 hover:bg-surface-2"
        >
          <div className="text-small uppercase tracking-[0.18em] text-ink-55">{item.label}</div>
          <div className="mt-2 flex items-center gap-2 text-3xl font-semibold text-[color:var(--fg-primary)]">
            <span>{item.value}</span>
            <span className="text-base text-mist opacity-0 transition-opacity group-hover:opacity-100">→</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
