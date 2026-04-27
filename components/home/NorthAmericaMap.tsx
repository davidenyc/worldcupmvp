"use client";

import Link from "next/link";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";

import { useUserCity } from "@/lib/hooks/useUserCity";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const COUNTRY_COLORS: Record<"usa" | "canada" | "mexico", string> = {
  usa: "#f4b942",
  canada: "#e63946",
  mexico: "#22c55e"
};

export type HomeCityCard = {
  key: string;
  label: string;
  shortLabel: string;
  lat: number;
  lng: number;
  stadiumName: string;
  country: "usa" | "canada" | "mexico";
  matchCount: number;
  venueCount: number;
};

export function NorthAmericaMap({ cityCards }: { cityCards: HomeCityCard[] }) {
  const { userCity, suggestedCity } = useUserCity();
  const activeCityKey = userCity ?? suggestedCity ?? null;

  return (
    <div className="overflow-hidden border-y border-[#cfe0ff] bg-[#eef4ff] shadow-2xl shadow-[0_20px_60px_rgba(10,22,40,0.1)] dark:border-white/10 dark:bg-[#161b22] dark:shadow-none sm:rounded-[2rem] sm:border sm:p-4">
      <div className="bg-white dark:bg-[#1c2330] sm:rounded-[1.5rem] sm:border sm:border-[#cfe0ff] sm:p-4 sm:dark:border-white/10">
        <div className="mb-4 flex flex-col items-start gap-3 px-4 pt-4 sm:flex-row sm:items-center sm:justify-between sm:px-2 sm:pt-0">
          <div>
            <div className="text-xs uppercase tracking-[0.24em] text-[#0a1628]/45 dark:text-white/45">North America host map</div>
            <div className="mt-1 text-xl font-semibold text-[#0a1628] dark:text-white sm:text-sm">Tap a city to jump straight to its watch spots</div>
          </div>
          <div className="rounded-full border border-[#cfe0ff] bg-white px-3 py-1.5 text-xs font-semibold text-[#0a1628]/75 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-white/75">
            17 host cities
          </div>
        </div>

        <div className="overflow-hidden bg-[linear-gradient(180deg,#f8fbff_0%,#eef4ff_100%)] dark:bg-[#111827] sm:rounded-[1.5rem] sm:border sm:border-[#cfe0ff] sm:dark:border-white/10">
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{ scale: 640, center: [-98, 38] }}
            style={{ width: "100%", height: "100%" }}
            className="h-[100svh] w-full sm:h-[720px] md:h-[760px]"
          >
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const id = String((geo as { id?: string | number }).id ?? "");
                  const fill =
                    id === "840"
                      ? "#d8e6ff"
                      : id === "124"
                        ? "#ffd7df"
                        : id === "484"
                          ? "#d7f3df"
                          : "transparent";
                  const stroke = id === "840" || id === "124" || id === "484" ? "#0a162820" : "none";

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      style={{
                        default: { fill, stroke, strokeWidth: 0.7, outline: "none" },
                        hover: { fill, stroke, strokeWidth: 0.7, outline: "none" },
                        pressed: { fill, stroke, strokeWidth: 0.7, outline: "none" }
                      }}
                    />
                  );
                })
              }
            </Geographies>

            {cityCards.map((city) => {
              const accent = COUNTRY_COLORS[city.country];
              const shouldAnimate = activeCityKey === city.key;

              return (
                <Marker key={city.key} coordinates={[city.lng, city.lat]}>
                  <Link
                    href={`/${city.key}/map`}
                    className="group cursor-pointer outline-none"
                    aria-label={`${city.label} · ${city.stadiumName} · ${city.matchCount} matches`}
                    title={`${city.label} · ${city.stadiumName} · ${city.matchCount} matches`}
                  >
                    {shouldAnimate && <circle cx={0} cy={0} r={16} fill={accent} opacity={0.22} className="animate-ping" />}
                    <circle cx={0} cy={0} r={10} fill={accent} stroke="#ffffff" strokeWidth={3} />
                    <text
                      x={0}
                      y={34}
                      textAnchor="middle"
                      fill="#0a1628"
                      fontSize={11}
                      fontWeight={700}
                      letterSpacing="0.08em"
                      className="transition group-hover:fill-[#0f1f3d]"
                    >
                      {city.shortLabel}
                    </text>
                  </Link>
                </Marker>
              );
            })}
          </ComposableMap>
        </div>
      </div>
    </div>
  );
}
