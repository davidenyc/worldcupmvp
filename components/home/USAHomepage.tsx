import Link from "next/link";

import { HOST_CITIES } from "@/lib/data/hostCities";
import { getMatchHostCityKey } from "@/lib/data/matchLocations";
import { worldCup2026Matches } from "@/lib/data/matches";
import { getAllCountries, getMapPageData } from "@/lib/data/repository";
import { HomeCountryPicker } from "./HomeCountryPicker";
import { HomeHeroActions } from "./HomeHeroActions";
import { NorthAmericaMap } from "./NorthAmericaMap";

const COUNTRY_GROUPS = [
  { key: "usa", label: "United States", flag: "🇺🇸" },
  { key: "canada", label: "Canada", flag: "🇨🇦" },
  { key: "mexico", label: "Mexico", flag: "🇲🇽" }
] as const;

async function getCityVenueCount(cityKey: string) {
  const data = await getMapPageData(cityKey);
  return data.venues.length;
}

function getMatchCount(cityKey: string) {
  return worldCup2026Matches.filter((match) => getMatchHostCityKey(match) === cityKey).length;
}

export async function USAHomepage() {
  const allCountries = await getAllCountries();
  const cityCards = await Promise.all(
    HOST_CITIES.map(async (city) => ({
      ...city,
      matchCount: getMatchCount(city.key),
      venueCount: await getCityVenueCount(city.key)
    }))
  );

  const groupedCities = COUNTRY_GROUPS.map((group) => ({
    ...group,
    cities: cityCards.filter((city) => city.country === group.key)
  }));

  return (
    <main className="bg-bg text-deep">
      <section className="min-h-[calc(100vh-88px)] bg-bg">
        <div className="mx-auto grid min-h-[calc(100vh-88px)] w-full max-w-7xl items-center gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-10 lg:px-8">
          <div className="order-1 flex flex-col justify-center gap-6 lg:pr-4">
            <div className="text-xs font-semibold uppercase tracking-[0.35em] text-mist">
              GAMEDAY MAP
            </div>
            <div className="max-w-2xl">
              <h1 className="text-4xl font-semibold tracking-tight text-deep sm:text-5xl lg:text-6xl">
                Find your World Cup watch spot
              </h1>
              <p className="mt-5 max-w-xl text-sm leading-7 text-mist sm:text-base">
                17 host cities across the US, Canada, and Mexico · 48 nations · Every bar and restaurant
              </p>
            </div>

            <HomeHeroActions />
          </div>

          <div className="order-2 -mx-4 w-auto self-center sm:mx-0 sm:w-full">
            <NorthAmericaMap cityCards={cityCards} />
          </div>
        </div>
      </section>

      <section className="bg-bg px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-12">
          {groupedCities.map((group) => (
            <div key={group.key} className="space-y-6">
              <div>
                <div className="text-sm uppercase tracking-[0.24em] text-mist">
                  {group.flag} {group.label}
                </div>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-deep sm:text-4xl">
                  {group.label}
                </h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {group.cities.map((city) => (
                  <Link
                    key={city.key}
                    href={`/${city.key}/map`}
                    className="cursor-pointer rounded-2xl border p-5 transition hover:-translate-y-0.5 hover:shadow-lg dark:!border-white/10 dark:!bg-[#161b22] dark:!shadow-none"
                    style={countryCardStyle(city.country, city.key)}
                  >
                    <div className="flex h-full flex-col justify-between gap-6">
                      <div>
                        <div className="text-2xl font-semibold text-deep dark:!text-white">{city.label}</div>
                        <div className="mt-2 text-sm text-mist dark:!text-white/55">{city.stadiumName}</div>
                      </div>
                      <div className="space-y-2 text-sm text-navy/80 dark:!text-white/70">
                        <div>🏟 {city.matchCount} matches</div>
                        <div>📍 {city.venueCount} venues</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-bg px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-sm uppercase tracking-[0.24em] text-mist">
            🏳 Find your team&apos;s spots
          </div>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-deep sm:text-4xl">
            Which team are you watching?
          </h2>
          <p className="mt-3 max-w-xl text-sm text-mist">
            Tap your country to find every bar and restaurant in NYC catering to your nation&apos;s supporters.
          </p>
          <div className="mt-6">
            <HomeCountryPicker countries={allCountries} />
          </div>
        </div>
      </section>
    </main>
  );
}

function countryCardStyle(country: "usa" | "canada" | "mexico", cityKey: string) {
  const palettes: Record<"usa" | "canada" | "mexico", { backgroundColor: string; borderColor: string; boxShadow: string }> = {
    usa: {
      backgroundColor: "#eef3ff",
      borderColor: "#c8d6f8",
      boxShadow: "0 16px 34px rgba(22, 36, 66, 0.08)"
    },
    canada: {
      backgroundColor: "#fdecef",
      borderColor: "#f0b6c0",
      boxShadow: "0 16px 34px rgba(230, 57, 70, 0.08)"
    },
    mexico: {
      backgroundColor: "#e9f8ef",
      borderColor: "#b8e2c8",
      boxShadow: "0 16px 34px rgba(34, 197, 94, 0.08)"
    }
  };

  const palette = palettes[country];
  const hueOffset = cityKey.length % 2;
  return {
    ...palette,
    filter: hueOffset ? "saturate(1.02)" : "saturate(0.98)"
  };
}
