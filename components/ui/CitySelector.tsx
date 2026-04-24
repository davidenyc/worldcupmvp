"use client";

import { useMemo } from "react";

import { HOST_CITIES } from "@/lib/data/hostCities";
import { worldCup2026Matches } from "@/lib/data/matches";

type CitySelectorProps = {
  selectedCity: string;
  onSelectCity: (city: string) => void;
};

const CITY_ORDER = [
  "nyc",
  "los-angeles",
  "dallas",
  "miami",
  "atlanta",
  "houston",
  "san-francisco",
  "seattle",
  "boston",
  "philadelphia",
  "kansas-city",
  "las-vegas",
  "toronto",
  "vancouver",
  "mexico-city",
  "guadalajara",
  "monterrey"
] as const;

const COUNTRY_GROUPS = [
  { key: "usa", label: "United States", flag: "🇺🇸", cityKeys: CITY_ORDER.slice(0, 12) },
  { key: "canada", label: "Canada", flag: "🇨🇦", cityKeys: ["toronto", "vancouver"] },
  { key: "mexico", label: "Mexico", flag: "🇲🇽", cityKeys: ["mexico-city", "guadalajara", "monterrey"] }
] as const;

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function cityHasMatch(cityKey: string) {
  const key = cityKey.toLowerCase();
  return worldCup2026Matches.some((match) => {
    const city = normalize(match.city);
    const stadium = normalize(match.stadiumName);
    if (key === "nyc") return city.includes("east rutherford") || stadium.includes("metlife");
    if (key === "los-angeles") return city.includes("inglewood") || city.includes("losangeles");
    if (key === "dallas") return city.includes("arlington");
    if (key === "miami") return city.includes("miamigardens");
    if (key === "atlanta") return city.includes("atlanta");
    if (key === "houston") return city.includes("houston");
    if (key === "san-francisco") return city.includes("santaclara") || stadium.includes("levi");
    if (key === "seattle") return city.includes("seattle");
    if (key === "boston") return city.includes("foxborough");
    if (key === "philadelphia") return city.includes("philadelphia");
    if (key === "kansas-city") return city.includes("kansascity");
    if (key === "las-vegas") return city.includes("lasvegas") || city.includes("paradise");
    if (key === "toronto") return match.isCanada && (city.includes("toronto") || stadium.includes("bmo"));
    if (key === "vancouver") return match.isCanada && (city.includes("vancouver") || stadium.includes("bcplace"));
    if (key === "mexico-city") return match.isMexico && (city.includes("mexicocity") || stadium.includes("azteca"));
    if (key === "guadalajara") return match.isMexico && (city.includes("guadalajara") || stadium.includes("akron"));
    if (key === "monterrey") return match.isMexico && (city.includes("monterrey") || stadium.includes("universitario"));
    return false;
  });
}

export function CitySelector({ selectedCity, onSelectCity }: CitySelectorProps) {
  const cityOptions = useMemo(
    () =>
      CITY_ORDER.map((key) => {
        const city = HOST_CITIES.find((item) => item.key === key);
        if (!city) return null;

        return {
          key: city.key,
          label: city.shortLabel,
          fullLabel: city.label,
          hasMatch: cityHasMatch(city.key)
        };
      }).filter(Boolean) as Array<{ key: string; label: string; fullLabel: string; hasMatch: boolean }>,
    []
  );

  return (
    <div className="w-full space-y-2 overflow-x-auto pb-1">
      {COUNTRY_GROUPS.map((group) => (
        <div key={group.key} className="mb-2 flex items-center gap-2">
          <div className="mr-1 flex items-center gap-1.5 whitespace-nowrap text-lg font-semibold text-[#0a1628]/70">
            <span>{group.flag}</span>
            <span className="text-sm uppercase tracking-[0.24em]">{group.label}</span>
          </div>
          <div className="flex min-w-max items-center gap-2">
            {group.cityKeys.map((key) => {
              const city = cityOptions.find((item) => item.key === key);
              if (!city) return null;
              const active = selectedCity === city.key;
              return (
                <button
                  key={city.key}
                  type="button"
                  onClick={() => onSelectCity(city.key)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                    active
                    ? "bg-[#f4b942] text-[#0a1628] shadow-sm"
                      : "border border-[#d7e4f8] bg-white text-[#0a1628] hover:bg-[#eef4ff]"
                  }`}
                >
                  <span>{city.label}</span>
                  {city.hasMatch && <span className={`text-xs ${active ? "text-[#0a1628]" : "text-rose-500"}`}>📍</span>}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
