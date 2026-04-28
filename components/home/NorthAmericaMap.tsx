"use client";

import Link from "next/link";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";

import { useUserCity } from "@/lib/hooks/useUserCity";

const geoUrl = "/maps/countries-110m.json";

const COUNTRY_COLORS: Record<"usa" | "canada" | "mexico", string> = {
  usa: "#f4b942",
  canada: "#e63946",
  mexico: "#22c55e"
};

const COUNTRY_FILLS: Record<"840" | "124" | "484", string> = {
  "840": "#d7e6ff",
  "124": "#ffe1e7",
  "484": "#daf4e2"
};

const COUNTRY_STROKES: Record<"840" | "124" | "484", string> = {
  "840": "#9ebce8",
  "124": "#e7a8b5",
  "484": "#8fc7a0"
};

const LABEL_OFFSETS: Record<string, { x: number; y: number; anchor: "start" | "middle" | "end" }> = {
  nyc: { x: -24, y: -16, anchor: "end" },
  boston: { x: 10, y: -10, anchor: "start" },
  philadelphia: { x: 25, y: 27, anchor: "start" },
  toronto: { x: 10, y: -10, anchor: "start" },
  vancouver: { x: -10, y: -10, anchor: "end" },
  "san-francisco": { x: -10, y: -10, anchor: "end" },
  "los-angeles": { x: -10, y: 18, anchor: "end" },
  seattle: { x: -10, y: -10, anchor: "end" },
  "mexico-city": { x: 0, y: 22, anchor: "middle" },
  guadalajara: { x: -10, y: -10, anchor: "end" },
  monterrey: { x: 10, y: -10, anchor: "start" }
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
    <div className="min-w-0 overflow-hidden border-y border-[#cfe0ff] bg-[#eef4ff] shadow-2xl shadow-[0_20px_60px_rgba(10,22,40,0.1)] dark:border-white/10 dark:bg-[#161b22] dark:shadow-none sm:rounded-[2rem] sm:border sm:p-4">
      <div className="min-w-0 bg-white dark:bg-[#1c2330] sm:rounded-[1.5rem] sm:border sm:border-[#cfe0ff] sm:p-4 sm:dark:border-white/10">
        <div className="mb-4 flex flex-col items-start gap-3 px-4 pt-4 sm:flex-row sm:items-center sm:justify-between sm:px-2 sm:pt-0">
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-[0.24em] text-[#0a1628]/45 dark:text-white/45">North America host map</div>
            <div className="mt-1 text-xl font-semibold text-[#0a1628] dark:text-white sm:text-base">Tap a city to jump straight to its watch spots</div>
          </div>
          <div className="shrink-0 rounded-full border border-[#cfe0ff] bg-white px-3 py-1.5 text-xs font-semibold text-[#0a1628]/75 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-white/75">
            17 host cities
          </div>
        </div>

        <div className="overflow-hidden border-y border-[#cfe0ff] bg-[radial-gradient(circle_at_top,#ffffff_0%,#f3f8ff_42%,#e8f0ff_100%)] sm:hidden">
          <div style={{ overflow: "hidden", width: "100%", maxWidth: "100%" }}>
            <ComposableMap
              projection="geoMercator"
              projectionConfig={{ scale: 520, center: [-98, 35.5] }}
              style={{ width: "100%", height: "100%" }}
              className="h-[320px] w-full"
            >
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const id = String((geo as { id?: string | number }).id ?? "");
                    const isTarget = id === "840" || id === "124" || id === "484";
                    const fill = isTarget ? COUNTRY_FILLS[id as keyof typeof COUNTRY_FILLS] : "#f7faff";
                    const stroke = isTarget ? COUNTRY_STROKES[id as keyof typeof COUNTRY_STROKES] : "#d7e3f7";

                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        style={{
                          default: { fill, stroke, strokeWidth: isTarget ? 1 : 0.45, outline: "none" },
                          hover: { fill, stroke, strokeWidth: isTarget ? 1 : 0.45, outline: "none" },
                          pressed: { fill, stroke, strokeWidth: isTarget ? 1 : 0.45, outline: "none" }
                        }}
                      />
                    );
                  })
                }
              </Geographies>

              {cityCards.map((card) => {
                const labelOffset = LABEL_OFFSETS[card.key] ?? { x: 0, y: 22, anchor: "middle" as const };
                return (
                  <Marker key={card.key} coordinates={[card.lng, card.lat]}>
                    <Link
                      href={`/${card.key}/map`}
                      aria-label={`${card.label} · ${card.stadiumName} · ${card.matchCount} matches`}
                      title={`${card.label} · ${card.stadiumName} · ${card.matchCount} matches`}
                    >
                      <circle
                        r={activeCityKey === card.key ? 12 : 9}
                        fill={COUNTRY_COLORS[card.country]}
                        stroke="white"
                        strokeWidth={2.5}
                        style={{ cursor: "pointer" }}
                      />
                      <text
                        textAnchor={labelOffset.anchor}
                        x={labelOffset.x}
                        y={labelOffset.y}
                        fontSize={10}
                        fill="#0a1628"
                        fontWeight="700"
                        style={{ pointerEvents: "none" }}
                      >
                        {card.shortLabel}
                      </text>
                    </Link>
                  </Marker>
                );
              })}
            </ComposableMap>
          </div>
        </div>

        <div className="sm:hidden flex min-w-0 gap-2 overflow-x-auto pb-3 px-4 pt-3">
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

        <div className="hidden min-w-0 overflow-hidden bg-[radial-gradient(circle_at_top,#ffffff_0%,#f4f8ff_40%,#e7eefc_100%)] dark:bg-[#111827] sm:block sm:rounded-[1.5rem] sm:border sm:border-[#cfe0ff] sm:dark:border-white/10">
          <div style={{ overflow: "hidden", width: "100%", maxWidth: "100%" }}>
            <ComposableMap
              projection="geoMercator"
              projectionConfig={{ scale: 760, center: [-98, 36.5] }}
              style={{ width: "100%", height: "100%" }}
              className="h-[360px] w-full sm:h-[420px] md:h-[500px] lg:h-[560px]"
            >
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const id = String((geo as { id?: string | number }).id ?? "");
                    const isTarget = id === "840" || id === "124" || id === "484";
                    const fill = isTarget ? COUNTRY_FILLS[id as keyof typeof COUNTRY_FILLS] : "#f7faff";
                    const stroke = isTarget ? COUNTRY_STROKES[id as keyof typeof COUNTRY_STROKES] : "#d7e3f7";

                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        style={{
                          default: { fill, stroke, strokeWidth: isTarget ? 1.05 : 0.5, outline: "none" },
                          hover: { fill, stroke, strokeWidth: isTarget ? 1.05 : 0.5, outline: "none" },
                          pressed: { fill, stroke, strokeWidth: isTarget ? 1.05 : 0.5, outline: "none" }
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
                    {(() => {
                      const labelOffset = LABEL_OFFSETS[card.key] ?? { x: 0, y: 20, anchor: "middle" as const };
                      return (
                        <>
                          <circle
                            r={activeCityKey === card.key ? 10 : 7}
                            fill={COUNTRY_COLORS[card.country]}
                            stroke="white"
                            strokeWidth={2}
                            style={{ cursor: "pointer" }}
                          />
                          <text
                            textAnchor={labelOffset.anchor}
                            x={labelOffset.x}
                            y={labelOffset.y}
                            fontSize={9}
                            fill="#0a1628"
                            fontWeight="600"
                            style={{ pointerEvents: "none" }}
                          >
                            {card.shortLabel}
                          </text>
                        </>
                      );
                    })()}
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
