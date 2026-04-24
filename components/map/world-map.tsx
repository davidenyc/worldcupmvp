"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";

import { CountrySummary } from "@/lib/types";

// world-atlas@2/countries-110m.json exposes only `name` (and a numeric `id` for
// ISO 3166-1 numeric). It does NOT expose `iso_a2`, so we match on name with a
// slug override for mismatches (e.g. "United States of America" vs "USA").
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Normalise strings for resilient name comparison ("Côte d'Ivoire" ↔ "Cote d'Ivoire").
function normaliseName(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

// Canonical TopoJSON-name → our country slug. Covers every case where the
// TopoJSON's "name" field differs from our demo country slug.
const NAME_TO_SLUG: Record<string, string> = {
  "united states of america": "usa",
  "united states": "usa",
  "south korea": "korea-republic",
  "korea republic of": "korea-republic",
  "republic of korea": "korea-republic",
  "north korea": "korea-dpr",
  "iran": "ir-iran",
  "iran islamic republic of": "ir-iran",
  "czech republic": "czechia",
  "ivory coast": "cote-d-ivoire",
  "cote d ivoire": "cote-d-ivoire",
  "dr congo": "congo-dr",
  "democratic republic of the congo": "congo-dr",
  "cape verde": "cabo-verde",
  "turkey": "turkiye",
  "turkiye": "turkiye",
  "bosnia and herz": "bosnia-and-herzegovina",
  "bosnia and herzegovina": "bosnia-and-herzegovina",
  "united kingdom": "england" // Fallback: treat UK polygon as England entry point
};

// USA marker coordinates for the host-city indicator.
const NYC_COORDS: [number, number] = [-74.006, 40.7128];
const US_NAME = "united states of america";

export function WorldMap({
  countries,
  selectedCountrySlug,
  onCountryFocus,
  onCountrySelect,
  highlightNYC = true,
  className
}: {
  countries: CountrySummary[];
  selectedCountrySlug?: string;
  /** Called on hover/focus. */
  onCountryFocus?: (country: CountrySummary) => void;
  /**
   * Called on click. When provided, the map does NOT navigate — the caller
   * decides what happens (e.g. open a side panel, filter venues).
   * When omitted, the map falls back to router.push(`/nyc/map?country=:slug`).
   */
  onCountrySelect?: (country: CountrySummary) => void;
  /** Dim the US polygon and add a USA pin to signal host-city coverage. */
  highlightNYC?: boolean;
  className?: string;
}) {
  const router = useRouter();

  // Build lookups by normalised name AND iso2 so we match whichever the
  // TopoJSON exposes.
  const { byName, byIso } = useMemo(() => {
    const name = new Map<string, CountrySummary>();
    const iso = new Map<string, CountrySummary>();
    for (const country of countries) {
      name.set(normaliseName(country.name), country);
      if (country.iso2) iso.set(country.iso2.toUpperCase(), country);
    }
    return { byName: name, byIso: iso };
  }, [countries]);

  function lookupCountry(geo: any): CountrySummary | undefined {
    const rawName: string = geo?.properties?.name ?? "";
    const normalised = normaliseName(rawName);
    const override = NAME_TO_SLUG[normalised];
    if (override) {
      const match = countries.find((c) => c.slug === override);
      if (match) return match;
    }
    const iso = String(geo?.properties?.iso_a2 ?? "").toUpperCase();
    if (iso && byIso.has(iso)) return byIso.get(iso);
    return byName.get(normalised);
  }

  function handleCountry(country: CountrySummary) {
    onCountryFocus?.(country);
    if (onCountrySelect) {
      onCountrySelect(country);
    } else {
      router.push(`/country/${country.slug}`);
    }
  }

  return (
    <div className={`surface-strong overflow-hidden p-4 md:p-6 ${className ?? ""}`}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-sm uppercase tracking-[0.24em] text-mist">Interactive world map</div>
          <h2 className="text-2xl font-semibold tracking-tight text-deep">Choose a supporter path into the USA</h2>
        </div>
        <div className="hidden text-sm text-navy/60 md:block">Tap a country to see its watch spots</div>
      </div>
      <ComposableMap
        projectionConfig={{ scale: 150 }}
        style={{ width: "100%", height: "auto" }}
        className="touch-pan-y rounded-[32px] border border-white/80 bg-[radial-gradient(circle_at_top,rgba(94,182,255,0.18),rgba(255,255,255,0.8)_45%,rgba(223,242,255,0.95))]"
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const country = lookupCountry(geo);
              const isActive = !!country && country.slug === selectedCountrySlug;
              const rawName = normaliseName(String(geo?.properties?.name ?? ""));
              const isUS = rawName === US_NAME;
              const dimUS = isUS && highlightNYC;

              let fill = "#edf7ff"; // non-participant
              if (country) fill = isActive ? "#2d87d4" : "#8dcdfd";
              if (dimUS) fill = isActive ? "#5a7795" : "#c8d3df"; // dimmed US

              const hoverFill = country
                ? dimUS
                  ? "#8aa1bd"
                  : "#5eb6ff"
                : "#e1f0fb";

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onClick={() => {
                    if (country) handleCountry(country);
                  }}
                  onMouseEnter={() => {
                    if (country) onCountryFocus?.(country);
                  }}
                  tabIndex={country ? 0 : -1}
                  aria-label={country ? `${country.name} — view watch spots` : String(geo?.properties?.name ?? "")}
                  style={{
                    default: {
                      fill,
                      stroke: "#9fc5e4",
                      strokeWidth: 0.8,
                      outline: "none"
                    },
                    hover: {
                      fill: hoverFill,
                      stroke: "#7eb3df",
                      strokeWidth: 0.9,
                      outline: "none",
                      cursor: country ? "pointer" : "default"
                    },
                    pressed: {
                      fill: country ? "#2d87d4" : "#e1f0fb",
                      outline: "none"
                    }
                  }}
                />
              );
            })
          }
        </Geographies>

        {/* Host-city indicator: signals that within the US we only serve the selected city. */}
        {highlightNYC ? (
          <Marker coordinates={NYC_COORDS}>
            <g pointerEvents="none">
              <circle r={4.5} fill="#ef4f61" stroke="#ffffff" strokeWidth={1.2} />
              <circle r={10} fill="#ef4f61" opacity={0.18} />
              <text
                y={-12}
                textAnchor="middle"
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  fill: "#1a2b4a",
                  paintOrder: "stroke",
                  stroke: "#ffffff",
                  strokeWidth: 2
                }}
              >
                USA
              </text>
            </g>
          </Marker>
        ) : null}
      </ComposableMap>
    </div>
  );
}
