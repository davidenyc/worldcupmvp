"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";

import type { HostCity } from "@/lib/data/hostCities";
import { useUser } from "@/lib/store/user";

const GEO_URL = "/maps/countries-110m.json";

const COUNTRY_FILL: Record<HostCity["country"], string> = {
  usa: "#c7dafc",
  canada: "#fcc9c4",
  mexico: "#bfe7ba"
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

type LabelDir =
  | "right"
  | "left"
  | "top"
  | "bottom"
  | "top-right"
  | "bottom-right"
  | "top-left"
  | "bottom-left";

const LABEL_DIR: Record<string, LabelDir> = {
  vancouver: "left",
  seattle: "left",
  toronto: "top-left",
  boston: "top-right",
  nyc: "top-right",
  philadelphia: "bottom-right",
  "kansas-city": "top",
  "san-francisco": "left",
  "las-vegas": "top",
  "los-angeles": "bottom-left",
  dallas: "bottom",
  houston: "right",
  atlanta: "right",
  miami: "right",
  monterrey: "right",
  guadalajara: "left",
  "mexico-city": "bottom"
};

const CLUSTER_LABELS = new Set(["nyc", "boston", "philadelphia", "toronto", "san-francisco", "las-vegas", "los-angeles"]);

const LABEL_PAD_BY_CITY: Partial<Record<string, number>> = {
  nyc: 1,
  boston: 1,
  philadelphia: 1,
  toronto: 1,
  "san-francisco": 1,
  "las-vegas": 1,
  "los-angeles": 1
};

const LABEL_FONT_SIZE_BY_CITY: Partial<Record<string, number>> = {
  toronto: 8.5,
  boston: 8.5,
  nyc: 8.5,
  philadelphia: 8.5,
  "san-francisco": 8.5,
  "las-vegas": 8.5,
  "los-angeles": 8.5
};

interface NorthAmericaMapProps {
  cityCards: Array<HostCity & { venueCount: number; matchCount: number }>;
}

export function NorthAmericaMap({ cityCards }: NorthAmericaMapProps) {
  const router = useRouter();
  const user = useUser();
  const [hovered, setHovered] = useState<string | null>(null);
  const [compactLabels, setCompactLabels] = useState(false);
  const [revealedLabel, setRevealedLabel] = useState<string | null>(null);
  const revealTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sortedCities = [...cityCards].sort((a, b) => (a.venueCount ?? 0) - (b.venueCount ?? 0));

  const goTo = (key: string) => router.push(`/${key}/map`);

  useEffect(() => {
    const updateLabelMode = () => {
      setCompactLabels(window.innerWidth < 640);
    };

    updateLabelMode();
    window.addEventListener("resize", updateLabelMode);
    return () => window.removeEventListener("resize", updateLabelMode);
  }, []);

  useEffect(() => {
    return () => {
      if (revealTimeoutRef.current) {
        clearTimeout(revealTimeoutRef.current);
      }
    };
  }, []);

  const revealCityLabel = (cityKey: string) => {
    setRevealedLabel(cityKey);
    if (revealTimeoutRef.current) {
      clearTimeout(revealTimeoutRef.current);
    }
    revealTimeoutRef.current = setTimeout(() => {
      setRevealedLabel((current) => (current === cityKey ? null : current));
    }, 3000);
  };

  const handleCityActivate = (cityKey: string) => {
    if (compactLabels && revealedLabel !== cityKey) {
      revealCityLabel(cityKey);
      return;
    }
    goTo(cityKey);
  };

  return (
    <div className="rounded-3xl border border-line bg-surface-2 p-3 shadow-card sm:p-4">
      <header className="mb-3 flex items-center justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.22em] text-mist">North America host map</div>
          <h3 className="mt-1 text-base font-semibold text-deep sm:text-lg">Tap a city</h3>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-mist">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: DOT_FILL.usa }} />
              USA 11
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: DOT_FILL.canada }} />
              Canada 2
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: DOT_FILL.mexico }} />
              Mexico 3
            </span>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <span className="shrink-0 rounded-full bg-surface px-3 py-1 text-xs font-semibold text-deep">
            17 cities
          </span>
          <Link
            href={user.favoriteCountrySlug ? "/me" : "/welcome"}
            className="inline-flex min-h-11 items-center rounded-full border border-line bg-surface px-4 text-sm font-semibold text-deep transition hover:bg-surface-2"
          >
            {user.favoriteCountrySlug ? "Open my Cup →" : "Personalize my Cup →"}
          </Link>
        </div>
      </header>

      <div className="relative w-full overflow-hidden rounded-2xl bg-bg">
        <div className="aspect-[16/10] sm:aspect-[2.2/1]">
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{ scale: 720, center: [-96, 39] }}
            style={{ width: "100%", height: "100%" }}
          >
            <Geographies geography={GEO_URL}>
              {({ geographies }) => {
                const matchedGeographies = geographies.filter((geo) => {
                  const name = String(geo.properties.name ?? "");
                  const id = String((geo as { id?: string | number }).id ?? "");
                  return Boolean(NAME_TO_COUNTRY[name] || ID_TO_COUNTRY[id]);
                });

                if (process.env.NODE_ENV === "development" && matchedGeographies.length === 0 && geographies[0]) {
                  console.warn("[NorthAmericaMap] No host-country matches found in geography file", {
                    id: (geographies[0] as { id?: string | number }).id,
                    properties: geographies[0].properties
                  });
                }

                return matchedGeographies.map((geo) => {
                  const name = String(geo.properties.name ?? "");
                  const id = String((geo as { id?: string | number }).id ?? "");
                  const country = NAME_TO_COUNTRY[name] ?? ID_TO_COUNTRY[id];
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      style={{
                        default: { fill: COUNTRY_FILL[country], stroke: "#9fc5e4", strokeWidth: 0.6, outline: "none" },
                        hover: { fill: COUNTRY_FILL[country], outline: "none" },
                        pressed: { fill: COUNTRY_FILL[country], outline: "none" }
                      }}
                    />
                  );
                });
              }}
            </Geographies>

            {sortedCities.map((city) => {
              const isHovered = hovered === city.key;
              const isRevealed = revealedLabel === city.key;
              const showLabel = compactLabels ? isRevealed : true;
              const dotR = 8 + Math.min((city.venueCount ?? 0) / 60, 6);
              const labelFontSize = LABEL_FONT_SIZE_BY_CITY[city.key] ?? (CLUSTER_LABELS.has(city.key) ? 9 : 10);
              const labelText = isHovered && !compactLabels ? `${city.label} · ${city.venueCount.toLocaleString()}` : city.shortLabel;
              const labelW = labelText.length * (labelFontSize < 9 ? 5.8 : labelFontSize < 10 ? 6.1 : 6.6) + 18;
              const dir = LABEL_DIR[city.key] ?? "right";
              const labelOffset = computeLabelOffset(dir, dotR, labelW, LABEL_PAD_BY_CITY[city.key]);

              return (
                <Marker key={city.key} coordinates={[city.lng, city.lat]}>
                  <g
                    role="button"
                    tabIndex={0}
                    aria-label={`${city.label} — ${city.venueCount} venues, ${city.matchCount} matches`}
                    onMouseEnter={() => setHovered(city.key)}
                    onMouseLeave={() => setHovered(null)}
                    onFocus={() => setHovered(city.key)}
                    onBlur={() => setHovered(null)}
                    onClick={() => handleCityActivate(city.key)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleCityActivate(city.key);
                      }
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <circle r={32} fill="transparent" />

                    {isHovered ? (
                      <circle r={dotR + 7} fill={DOT_FILL[city.country]} opacity={0.2} />
                    ) : null}

                    <circle
                      r={dotR}
                      fill={DOT_FILL[city.country]}
                      stroke="white"
                      strokeWidth={2.2}
                    />

                    {showLabel ? (
                      <g
                        transform={`translate(${labelOffset.x}, ${labelOffset.y})`}
                        style={{
                          pointerEvents: "none"
                        }}
                      >
                        <rect
                          width={labelW}
                          height={20}
                          rx={10}
                          fill="white"
                          stroke="rgba(10,22,40,0.14)"
                          strokeWidth={1.5}
                          style={{ filter: "drop-shadow(0 1px 2px rgba(15,23,42,0.18))" }}
                        />
                        <text
                          x={labelW / 2}
                          y={13}
                          textAnchor="middle"
                          style={{ fontSize: labelFontSize, fontWeight: 700, fill: "#0a1628", letterSpacing: "0.02em" }}
                        >
                          {labelText}
                        </text>
                      </g>
                    ) : null}
                  </g>
                </Marker>
              );
            })}
          </ComposableMap>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-mist">
        <span>{compactLabels ? "Tap once to reveal a label, then tap again to open its venue list" : "Tap any city to open its venue list"}</span>
        <span className="sm:ml-auto">All 17 host cities fit inside the map view</span>
      </div>
    </div>
  );
}

function computeLabelOffset(dir: LabelDir, dotR: number, labelW: number, pad = 4) {
  const labelH = 20;
  const offsets: Record<LabelDir, { x: number; y: number }> = {
    right: { x: dotR + pad, y: -labelH / 2 },
    left: { x: -dotR - pad - labelW, y: -labelH / 2 },
    top: { x: -labelW / 2, y: -dotR - pad - labelH },
    bottom: { x: -labelW / 2, y: dotR + pad },
    "top-right": { x: dotR + pad, y: -dotR - pad - labelH },
    "bottom-right": { x: dotR + pad, y: dotR + pad },
    "top-left": { x: -dotR - pad - labelW, y: -dotR - pad - labelH },
    "bottom-left": { x: -dotR - pad - labelW, y: dotR + pad }
  };
  return offsets[dir];
}
