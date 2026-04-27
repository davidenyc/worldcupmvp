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
            <div className="mt-1 text-xl font-semibold text-[#0a1628] dark:text-white sm:text-base">Tap a city to jump straight to its watch spots</div>
          </div>
          <div className="rounded-full border border-[#cfe0ff] bg-white px-3 py-1.5 text-xs font-semibold text-[#0a1628]/75 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-white/75">
            17 host cities
          </div>
        </div>

        <div className="sm:hidden flex gap-2 overflow-x-auto pb-2 px-4 pt-2">
          {cityCards.map((card) => (
            <Link
              key={card.key}
              href={`/${card.key}/map`}
              className="shrink-0 whitespace-nowrap rounded-full border border-[#d8e3f5] bg-white px-3 py-2 text-xs font-semibold text-[#0a1628]"
            >
              {card.label}
            </Link>
          ))}
        </div>

        <div className="hidden sm:block overflow-hidden bg-[linear-gradient(180deg,#f8fbff_0%,#eef4ff_100%)] dark:bg-[#111827] sm:rounded-[1.5rem] sm:border sm:border-[#cfe0ff] sm:dark:border-white/10">
          <div style={{ overflow: "hidden", width: "100%", maxWidth: "100%" }}>
            <ComposableMap
              projection="geoMercator"
              projectionConfig={{ scale: 640, center: [-98, 38] }}
              style={{ width: "100%", height: "100%" }}
              className="h-[420px] w-full sm:h-[540px] md:h-[720px]"
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

              {cityCards.map((card) => (
                <Marker key={card.key} coordinates={[card.lng, card.lat]}>
                  <Link
                    href={`/${card.key}/map`}
                    aria-label={`${card.label} · ${card.stadiumName} · ${card.matchCount} matches`}
                    title={`${card.label} · ${card.stadiumName} · ${card.matchCount} matches`}
                  >
                    <circle
                      r={activeCityKey === card.key ? 10 : 7}
                      fill={COUNTRY_COLORS[card.country]}
                      stroke="white"
                      strokeWidth={2}
                      style={{ cursor: "pointer" }}
                    />
                    <text
                      textAnchor="middle"
                      y={20}
                      fontSize={9}
                      fill="#0a1628"
                      fontWeight="600"
                      style={{ pointerEvents: "none" }}
                    >
                      {card.shortLabel}
                    </text>
                  </Link>
                </Marker>
              ))}
            </ComposableMap>
          </div>
        </div>
      </div>
    </div>
  );
}
