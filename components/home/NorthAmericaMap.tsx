"use client";

import { useRouter } from "next/navigation";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";

import type { HostCity } from "@/lib/data/hostCities";

const GEO_URL = "/maps/countries-110m.json";

const COUNTRY_FILL: Record<HostCity["country"], string> = {
  usa: "#dbe7ff",
  canada: "#fbe2e0",
  mexico: "#dff2dc"
};

const NAME_TO_COUNTRY: Record<string, HostCity["country"]> = {
  "United States of America": "usa",
  Canada: "canada",
  Mexico: "mexico"
};

const ID_TO_COUNTRY: Record<string, HostCity["country"]> = {
  "840": "usa",
  "124": "canada",
  "484": "mexico"
};

const DOT_FILL: Record<HostCity["country"], string> = {
  usa: "#f4b942",
  canada: "#ef4444",
  mexico: "#22c55e"
};

const COUNTRY_BADGE = {
  usa: "USA",
  canada: "CAN",
  mexico: "MEX"
} as const;

interface NorthAmericaMapProps {
  cityCards: Array<HostCity & { venueCount: number; matchCount: number }>;
}

export function NorthAmericaMap({ cityCards }: NorthAmericaMapProps) {
  const router = useRouter();

  const sortedCityCards = [...cityCards].sort((a, b) => {
    if (a.key === "nyc") return -1;
    if (b.key === "nyc") return 1;
    return (b.matchCount ?? 0) - (a.matchCount ?? 0) || (b.venueCount ?? 0) - (a.venueCount ?? 0);
  });

  return (
    <section className="rounded-3xl border border-line bg-surface-2 p-4 shadow-card sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-mist">North America host map</div>
          <h2 className="mt-2 text-2xl font-bold text-deep sm:text-3xl">Pick your host city</h2>
          <p className="mt-2 max-w-2xl text-sm text-mist sm:text-base">
            Start with the city you&apos;ll actually be in, then jump straight into the best watch spots.
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-line bg-surface px-3 py-1 text-xs font-semibold text-deep">
          {cityCards.length} cities
        </span>
      </div>

      <div className="relative mt-5 overflow-hidden rounded-[2rem] border border-line bg-[#eef4ff]">
        <div className="pointer-events-none mx-auto h-28 w-full max-w-4xl opacity-25 sm:h-32 lg:h-40">
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{ scale: 560, center: [-96, 35] }}
            style={{ width: "100%", height: "100%" }}
          >
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies
                  .filter((geo) => {
                    const name = String(geo.properties.name ?? "");
                    const id = String((geo as { id?: string | number }).id ?? "");
                    return Boolean(NAME_TO_COUNTRY[name] || ID_TO_COUNTRY[id]);
                  })
                  .map((geo) => {
                    const name = String(geo.properties.name ?? "");
                    const id = String((geo as { id?: string | number }).id ?? "");
                    const country = NAME_TO_COUNTRY[name] ?? ID_TO_COUNTRY[id];
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        style={{
                          default: { fill: COUNTRY_FILL[country], stroke: "#9fc5e4", strokeWidth: 0.55, outline: "none" },
                          hover: { fill: COUNTRY_FILL[country], outline: "none" },
                          pressed: { fill: COUNTRY_FILL[country], outline: "none" }
                        }}
                      />
                    );
                  })
              }
            </Geographies>

            {cityCards.map((city) => (
              <Marker key={city.key} coordinates={[city.lng, city.lat]}>
                <circle r={city.key === "nyc" ? 4.5 : 3.5} fill={DOT_FILL[city.country]} stroke="white" strokeWidth={1.4} />
              </Marker>
            ))}
          </ComposableMap>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-4">
        {sortedCityCards.map((city) => {
          const isNYC = city.key === "nyc";

          return (
            <button
              key={city.key}
              type="button"
              onClick={() => router.push(`/${city.key}/map`)}
              className={[
                "group min-h-[100px] rounded-[1.75rem] border bg-surface p-4 text-left transition hover:bg-surface-2",
                "w-full md:min-h-[120px]",
                isNYC ? "border-gold shadow-[0_0_0_1px_rgba(244,185,66,0.12)]" : "border-line"
              ].join(" ")}
              aria-label={`${city.label}, ${city.matchCount} matches`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className={isNYC ? "text-xl font-extrabold text-deep" : "text-lg font-extrabold text-deep"}>
                    {city.label}
                  </div>
                  <div className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-mist">
                    {city.matchCount} matches
                  </div>
                  <div className="mt-1 text-xs text-mist">
                    {city.stadiumName}
                  </div>
                </div>
                <span
                  className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-line bg-surface-2 px-2 text-[11px] font-bold text-deep"
                  aria-hidden
                >
                  {COUNTRY_BADGE[city.country]}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
