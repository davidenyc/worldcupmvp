"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Heart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { HOST_CITIES } from "@/lib/data/hostCities";
import { getMatchHostCityKey } from "@/lib/data/matchLocations";
import { useUserCity } from "@/lib/hooks/useUserCity";
import { worldCup2026Matches } from "@/lib/data/matches";
import { useTheme } from "@/lib/store/theme";

const CITY_LOOKUP = new Map(HOST_CITIES.map((city) => [city.key, city]));

function getMatchCountForCity(cityKey: string) {
  return worldCup2026Matches.filter((match) => getMatchHostCityKey(match) === cityKey).length;
}

function getActiveCityFromPath(pathname: string | null) {
  if (!pathname) return null;
  const segment = pathname.split("/").filter(Boolean)[0];
  return segment && CITY_LOOKUP.has(segment) ? segment : null;
}

export function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { userCity, suggestedCity, hasChosenCity, setUserCity } = useUserCity();
  const { toggle, isDark } = useTheme();
  const [open, setOpen] = useState(false);

  const activeCity = useMemo(() => {
    const fromPath = getActiveCityFromPath(pathname);
    if (fromPath) return fromPath;
    return userCity ?? "nyc";
  }, [pathname, userCity]);

  const activeCityData = CITY_LOOKUP.get(activeCity) ?? HOST_CITIES[0];
  const nearestCity = suggestedCity ?? null;
  const mapHref = `/${activeCity}/map`;
  const matchesHref = `/${activeCity}/matches`;

  useEffect(() => {
    function handleOpenCitySwitcher() {
      setOpen(true);
    }

    window.addEventListener("watchparty:open-city-switcher", handleOpenCitySwitcher);
    return () => window.removeEventListener("watchparty:open-city-switcher", handleOpenCitySwitcher);
  }, []);

  function navigateToCity(nextCity: string) {
    setUserCity(nextCity);
    setOpen(false);

    if (pathname === "/" || !pathname) {
      router.push(`/${nextCity}/map`);
      return;
    }

    const segments = pathname.split("/").filter(Boolean);
    const currentCity = getActiveCityFromPath(pathname);
    if (currentCity && segments[1] === "matches") {
      router.push(`/${nextCity}/matches`);
      return;
    }
    if (currentCity && segments[1] === "map") {
      router.push(`/${nextCity}/map`);
      return;
    }

    router.push(`/${nextCity}/map`);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[#d8e3f5] bg-white/90 backdrop-blur-xl dark:border-white/8 dark:bg-[#0d1117]/90">
      <div className="container-shell flex h-18 items-center justify-between gap-4 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-lg font-black text-deep shadow-card">
            GM
          </div>
          <div>
            <div className="text-lg font-semibold tracking-tight text-[#0a1628] dark:text-white">GameDay Map</div>
            <div className="text-xs text-[#0a1628]/55 dark:text-white/55">World Cup 2026 fan experience</div>
          </div>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/" className="text-sm text-[#0a1628]/70 transition hover:text-[#0a1628] dark:text-white/60 dark:hover:text-white">
            Home
          </Link>
          <Link href={mapHref} className="text-sm text-[#0a1628]/70 transition hover:text-[#0a1628] dark:text-white/60 dark:hover:text-white">
            Map
          </Link>
          <Link href={matchesHref} className="text-sm text-[#0a1628]/70 transition hover:text-[#0a1628] dark:text-white/60 dark:hover:text-white">
            Matches
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            className="inline-flex items-center gap-2 rounded-full border border-[#d8e3f5] bg-[#f8fbff] px-4 py-2 text-sm font-semibold text-[#0a1628] shadow-sm transition hover:bg-[#eef4ff] dark:border-white/10 dark:bg-white/8 dark:text-white dark:hover:bg-white/10"
          >
            <span className="text-base">📍</span>
            <span>{activeCityData.label}</span>
            <span className="text-xs text-[#0a1628]/55 dark:text-white/55">▾</span>
          </button>
          <Link
            href="/saved"
            className="hidden sm:inline-flex items-center gap-2 rounded-full border border-[#d8e3f5] bg-[#f8fbff] px-3 py-2 text-sm font-semibold text-[#0a1628] shadow-sm transition hover:bg-[#eef4ff] dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          >
            <Heart className="h-4 w-4" />
            Saved
          </Link>
          <Link href="/submit" className="hidden sm:block">
            <Button>Submit a venue</Button>
          </Link>
          <button
            type="button"
            onClick={toggle}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#d8e3f5] bg-[#f8fbff] text-[#0a1628] transition hover:bg-[#eef4ff] dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10"
          >
            {isDark ? "☀️" : "🌙"}
          </button>
        </div>
      </div>

      <div className="container-shell pb-3 md:hidden">
        <nav className="flex items-center gap-2 overflow-x-auto">
          <Link
            href="/"
            className={`inline-flex shrink-0 items-center rounded-full border px-3 py-2 text-xs font-semibold transition ${
              pathname === "/"
                ? "border-[#f4b942] bg-[#f4b942] text-[#0a1628]"
                : "border-[#d8e3f5] bg-[#f8fbff] text-[#0a1628] dark:border-white/10 dark:bg-white/5 dark:text-white"
            }`}
          >
            Home
          </Link>
          <Link
            href={mapHref}
            className={`inline-flex shrink-0 items-center rounded-full border px-3 py-2 text-xs font-semibold transition ${
              pathname?.includes("/map")
                ? "border-[#f4b942] bg-[#f4b942] text-[#0a1628]"
                : "border-[#d8e3f5] bg-[#f8fbff] text-[#0a1628] dark:border-white/10 dark:bg-white/5 dark:text-white"
            }`}
          >
            Map
          </Link>
          <Link
            href={matchesHref}
            className={`inline-flex shrink-0 items-center rounded-full border px-3 py-2 text-xs font-semibold transition ${
              pathname?.includes("/matches")
                ? "border-[#f4b942] bg-[#f4b942] text-[#0a1628]"
                : "border-[#d8e3f5] bg-[#f8fbff] text-[#0a1628] dark:border-white/10 dark:bg-white/5 dark:text-white"
            }`}
          >
            Matches
          </Link>
          <Link
            href="/saved"
            className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-3 py-2 text-xs font-semibold transition ${
              pathname === "/saved"
                ? "border-[#f4b942] bg-[#f4b942] text-[#0a1628]"
                : "border-[#d8e3f5] bg-[#f8fbff] text-[#0a1628] dark:border-white/10 dark:bg-white/5 dark:text-white"
            }`}
          >
            <Heart className="h-3.5 w-3.5" />
            Saved
          </Link>
        </nav>
      </div>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-white/60 md:hidden"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-4 top-[4.75rem] z-50 w-[min(92vw,24rem)] overflow-hidden rounded-[1.5rem] border border-[#d8e3f5] bg-white shadow-2xl dark:border-white/10 dark:bg-[#161b22] md:right-6 md:w-[26rem]">
            <div className="border-b border-[#eef4ff] px-4 py-3 dark:border-white/8">
              <div className="text-xs uppercase tracking-[0.24em] text-[#0a1628]/45 dark:text-white/45">Switch city</div>
              <div className="mt-1 text-sm text-[#0a1628]/60 dark:text-white/60">Choose where you want to watch the matches.</div>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-3">
              <div className="grid gap-2 sm:grid-cols-2">
                {HOST_CITIES.map((city) => {
                  const active = city.key === activeCity;
                  const isNearest = city.key === nearestCity;
                  const matchCount = getMatchCountForCity(city.key);

                  return (
                    <button
                      key={city.key}
                      type="button"
                    onClick={() => navigateToCity(city.key)}
                      className={`rounded-2xl border px-3 py-3 text-left transition ${
                        active ? "border-[#f4b942] bg-[#f4b942] text-[#0a1628]" : "border-[#d8e3f5] bg-white text-[#0a1628] hover:bg-[#f8fbff] dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-semibold">{city.label}</div>
                          <div className={`mt-1 text-xs ${active ? "text-[#0a1628]/70" : "text-[#0a1628]/55 dark:text-white/55"}`}>
                            {city.label} · {city.state}
                          </div>
                          <div className={`mt-2 text-xs ${active ? "text-[#0a1628]/65" : "text-[#0a1628]/60 dark:text-white/60"}`}>
                            {matchCount} matches
                          </div>
                        </div>
                        {isNearest && (
                          <span className="rounded-full bg-orange-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-orange-700">
                            📍 Nearest
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            {!hasChosenCity && (
          <div className="border-t border-[#eef4ff] px-4 py-3 text-xs text-[#0a1628]/60 dark:border-white/8 dark:text-white/60">
            We&apos;ll remember your selected city on this device.
          </div>
            )}
          </div>
        </>
      )}
    </header>
  );
}
