import Link from "next/link";

import { HOST_CITIES } from "@/lib/data/hostCities";
import { getMatchHostCityKey } from "@/lib/data/matchLocations";
import { worldCup2026Matches } from "@/lib/data/matches";
import { getAllCountries, getMapPageData } from "@/lib/data/repository";
import { EmailCaptureBanner } from "@/components/marketing/EmailCaptureBanner";
import { HomeCountryPicker } from "./HomeCountryPicker";
import { HomeHeroActions } from "./HomeHeroActions";
import { InstallAppBanner } from "./InstallAppBanner";
import { KickoffCountdown } from "./KickoffCountdown";
import { NorthAmericaMap } from "./NorthAmericaMap";
import { PremiumUpsellBanner } from "./PremiumUpsellBanner";

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

function getCityUpcomingMatches(cityKey: string) {
  return worldCup2026Matches
    .filter((match) => getMatchHostCityKey(match) === cityKey)
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))
    .slice(0, 2);
}

function formatMatchPreviewTime(startsAt: string) {
  return new Date(startsAt).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

export async function USAHomepage() {
  const allCountries = await getAllCountries();
  const countryLookup = new Map(allCountries.map((country) => [country.slug, country] as const));
  const cityCards = await Promise.all(
    HOST_CITIES.map(async (city) => ({
      ...city,
      matchCount: getMatchCount(city.key),
      venueCount: await getCityVenueCount(city.key),
      upcomingMatches: getCityUpcomingMatches(city.key)
    }))
  );

  const groupedCities = COUNTRY_GROUPS.map((group) => ({
    ...group,
    cities: cityCards.filter((city) => city.country === group.key)
  }));

  return (
    <main className="bg-bg text-deep">
      <section className="bg-bg lg:min-h-[calc(100vh-88px)]">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-4 px-4 py-8 sm:px-6 lg:min-h-[calc(100vh-88px)] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-10 lg:px-8">
          <div className="order-1 flex flex-col justify-center gap-4 lg:pr-4 lg:gap-6">
            <div className="text-xs font-semibold uppercase tracking-[0.35em] text-mist">
              GAMEDAY MAP
            </div>
            <div className="max-w-2xl">
              <h1 className="text-4xl font-semibold tracking-tight text-deep sm:text-5xl lg:text-6xl">
                Find your World Cup watch party
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-7 text-mist sm:text-base lg:mt-5">
                17 host cities · 48 nations · Every bar and restaurant that matters
              </p>
            </div>

            <KickoffCountdown />
            <HomeHeroActions />
          </div>

          <div className="order-2 -mx-4 w-auto self-center sm:mx-0 sm:w-full">
            <NorthAmericaMap cityCards={cityCards} />
          </div>
        </div>
      </section>

      <section className="bg-bg px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-12">
          <InstallAppBanner />
          <EmailCaptureBanner />

          <section className="grid gap-4 md:grid-cols-3">
            {[
              {
                title: "🏙 Choose your city",
                body: "Pick from 17 World Cup host cities"
              },
              {
                title: "🏳 Find your country's bars",
                body: "Filter by any of 48 nations"
              },
              {
                title: "🍺 Go watch",
                body: "Get directions and reserve your spot"
              }
            ].map((step) => (
              <div key={step.title} className="rounded-[1.75rem] bg-[#0a1628] p-6 text-white shadow-lg">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#f4b942] text-xl text-[#0a1628]">
                  {step.title.split(" ")[0]}
                </div>
                <h2 className="text-xl font-semibold">{step.title.replace(/^[^ ]+ /, "")}</h2>
                <p className="mt-3 text-sm leading-6 text-white/72">{step.body}</p>
              </div>
            ))}
          </section>

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
                    className="group cursor-pointer overflow-hidden rounded-[1.75rem] border p-5 transition hover:-translate-y-0.5 hover:shadow-lg dark:!border-white/10 dark:!bg-[#161b22] dark:!shadow-none"
                    style={countryCardStyle(city.country, city.key)}
                  >
                    <div className="flex h-full flex-col justify-between gap-6">
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-2xl font-semibold text-deep dark:!text-white">{city.label}</div>
                            <div className="mt-2 text-sm text-mist dark:!text-white/55">{city.stadiumName}</div>
                          </div>
                          <div className="rounded-full border border-white/70 bg-white/75 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#0a1628] dark:border-white/10 dark:bg-white/10 dark:text-white/80">
                            {city.shortLabel}
                          </div>
                        </div>
                      </div>

                      <div className="rounded-[1.35rem] border border-white/70 bg-white/72 p-4 shadow-[0_10px_30px_rgba(10,22,40,0.06)] backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.04]">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#0a1628]/55 dark:text-white/45">
                            Upcoming
                          </div>
                          <div className="text-[11px] font-semibold text-[#0a1628]/55 dark:text-white/45">
                            {city.matchCount} matches
                          </div>
                        </div>

                        {city.upcomingMatches.length ? (
                          <div className="mt-3 space-y-2.5">
                            {city.upcomingMatches.map((match) => {
                              const home = countryLookup.get(match.homeCountry);
                              const away = countryLookup.get(match.awayCountry);

                              return (
                                <div
                                  key={match.id}
                                  className="rounded-2xl border border-white/80 bg-white/80 px-3 py-2.5 dark:border-white/10 dark:bg-[#0f1724]"
                                >
                                  <div className="flex items-center gap-2 text-sm font-semibold text-[#0a1628] dark:text-white">
                                    <span>{home?.flagEmoji ?? "🏳"}</span>
                                    <span className="truncate">{home?.fifaCode ?? match.homeCountry.toUpperCase()}</span>
                                    <span className="text-[#0a1628]/35 dark:text-white/35">vs</span>
                                    <span>{away?.flagEmoji ?? "🏳"}</span>
                                    <span className="truncate">{away?.fifaCode ?? match.awayCountry.toUpperCase()}</span>
                                  </div>
                                  <div className="mt-1 text-[11px] font-medium text-[#0a1628]/58 dark:text-white/55">
                                    {formatMatchPreviewTime(match.startsAt)}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="mt-3 rounded-2xl border border-white/80 bg-white/80 px-3 py-3 text-sm text-[#0a1628]/58 dark:border-white/10 dark:bg-[#0f1724] dark:text-white/55">
                            Full schedule preview coming soon
                          </div>
                        )}

                        <div className="mt-3 flex items-center justify-between gap-3 text-sm text-navy/80 dark:!text-white/70">
                          <div className="inline-flex items-center gap-2">
                            <span>📍</span>
                            <span>{city.venueCount} venues</span>
                          </div>
                          <div className="text-xs font-semibold text-[#0a1628]/55 transition group-hover:text-[#0a1628] dark:text-white/45 dark:group-hover:text-white/75">
                            Open city →
                          </div>
                        </div>
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
          <PremiumUpsellBanner />
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
