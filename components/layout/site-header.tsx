"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Heart, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { HOST_CITIES } from "@/lib/data/hostCities";
import { getMatchHostCityKey } from "@/lib/data/matchLocations";
import { useUserCity } from "@/lib/hooks/useUserCity";
import { worldCup2026Matches } from "@/lib/data/matches";
import { useMembership } from "@/lib/store/membership";
import { useTheme } from "@/lib/store/theme";

const CITY_LOOKUP = new Map(HOST_CITIES.map((city) => [city.key, city]));
const _lucideIcons = { Heart, Search };
void _lucideIcons;

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.8l2.76 5.59 6.17.9-4.46 4.35 1.05 6.15L12 16.9l-5.52 2.89 1.05-6.15L3.07 9.29l6.17-.9L12 2.8z" />
    </svg>
  );
}

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
  const tier = useMembership((state) => state.tier);
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
  const tonightHref = "/tonight";
  const searchHref = `/search?city=${activeCity}`;
  const currentPath = pathname ?? "/";

  function navClass(active: boolean) {
    return `inline-flex h-12 items-center rounded-full border px-5 font-semibold transition ${
      active
        ? "border-[#f4b942] bg-[#f4b942] text-[#0a1628]"
        : "border-[#d8e3f5] bg-[#f8fbff] text-[#0a1628] dark:border-white/10 dark:bg-white/5 dark:text-white"
    }`;
  }

  useEffect(() => {
    function handleOpenCitySwitcher() {
      setOpen(true);
    }

    window.addEventListener("gameday:open-city-switcher", handleOpenCitySwitcher);
    return () => window.removeEventListener("gameday:open-city-switcher", handleOpenCitySwitcher);
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
    <header
      className="sticky top-0 z-40 border-b border-[#d8e3f5] bg-white/92 backdrop-blur-xl dark:border-white/8 dark:bg-[#0d1117]/92"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      <div className="container-shell flex min-h-[56px] items-center justify-between gap-2 py-0 lg:h-auto lg:gap-3 lg:py-4">
        <Link href="/" className="flex min-w-0 shrink-0 items-center gap-2.5 lg:flex-1 lg:gap-3">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl text-sm font-black shadow-sm lg:h-12 lg:w-12 lg:rounded-[1.2rem] lg:text-lg"
            style={{ backgroundColor: "#f4b942", color: "#0a1628" }}
          >
            GM
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold tracking-tight text-[#0a1628] dark:text-white sm:text-base lg:text-xl">GameDay Map</div>
            <div className="hidden truncate text-xs text-[#0a1628]/55 dark:text-white/55 lg:block">World Cup 2026 fan experience</div>
          </div>
        </Link>
        <nav className="hidden items-center gap-2 lg:flex">
          <Link href="/" className={`${navClass(currentPath === "/")} whitespace-nowrap`}>Home</Link>
          <Link href={tonightHref} className={`${navClass(currentPath === "/tonight")} whitespace-nowrap`}>Tonight</Link>
          <Link href={mapHref} className={`${navClass(currentPath.includes("/map"))} whitespace-nowrap`}>Map</Link>
          <Link href={matchesHref} className={`${navClass(currentPath.includes("/matches"))} whitespace-nowrap`}>Matches</Link>
          <Link href="/membership" className={`${navClass(currentPath.startsWith("/membership"))} hidden whitespace-nowrap xl:inline-flex`}>Membership</Link>
          <Link href="/account" className={`${navClass(currentPath.startsWith("/account"))} hidden whitespace-nowrap xl:inline-flex`}>Account</Link>
        </nav>
        <div className="flex min-w-0 flex-wrap items-center justify-end gap-1.5 lg:flex-nowrap lg:gap-2">
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            className="inline-flex h-9 max-w-[140px] min-w-0 items-center gap-1.5 rounded-full border border-[#d8e3f5] bg-[#f8fbff] px-2.5 text-sm font-semibold text-[#0a1628] shadow-sm transition hover:bg-[#eef4ff] dark:border-white/10 dark:bg-white/8 dark:text-white dark:hover:bg-white/10 lg:h-12 lg:max-w-none lg:gap-2 lg:px-3"
          >
            <span className="hidden h-7 w-7 items-center justify-center rounded-full bg-white/80 text-[11px] font-bold text-[#0a1628] dark:bg-white/12 dark:text-white xl:inline-flex">
              {activeCityData.shortLabel}
            </span>
            <span className="truncate whitespace-nowrap text-sm">{activeCityData.label}</span>
            <span className="shrink-0 text-xs text-[#0a1628]/55 dark:text-white/55">▾</span>
          </button>
          <Link
            href="/saved"
            className="hidden h-12 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-[#d8e3f5] bg-[#f8fbff] px-4 text-sm font-semibold text-[#0a1628] shadow-sm transition hover:bg-[#eef4ff] dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 xl:inline-flex"
          >
            <HeartIcon />
            Saved
          </Link>
          <Link
            href={tier === "free" ? `/membership?return=${encodeURIComponent(currentPath)}` : "/account"}
            className={`hidden h-12 shrink-0 items-center rounded-full px-4 text-sm font-semibold transition xl:inline-flex ${
              tier === "free"
                ? "border border-[#f4b942] text-[#c98a00] hover:bg-[#fff8e7]"
                : tier === "fan"
                  ? "bg-[#f4b942] text-[#0a1628] hover:bg-[#f0c86b]"
                  : "border border-[#f4b942] bg-[#0a1628] text-[#f4b942] hover:bg-[#13203a]"
            }`}
          >
            {tier === "free" ? "⭐ Go Pro" : tier === "fan" ? "⭐ Fan Pass" : "👑 Elite"}
          </Link>
          <Link
            href={tier === "free" ? `/membership?return=${encodeURIComponent(currentPath)}` : "/account"}
            aria-label={tier === "free" ? "Go Pro" : tier === "fan" ? "Fan Pass" : "Elite"}
            className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition sm:hidden ${
              tier === "free"
                ? "border-[#f4b942] bg-[#fff8e7] text-[#c98a00]"
                : tier === "fan"
                  ? "border-[#f4b942] bg-[#f4b942] text-[#0a1628]"
                  : "border-[#f4b942] bg-[#0a1628] text-[#f4b942]"
            }`}
          >
            <StarIcon />
          </Link>
          <Link
            href={searchHref}
            aria-label="Search venues"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#d8e3f5] bg-[#f8fbff] text-[#0a1628] transition hover:bg-[#eef4ff] dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 lg:h-12 lg:w-12"
          >
            <SearchIcon />
          </Link>
          <Link
            href="/account"
            aria-label="Open account"
            className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#d8e3f5] bg-[#f8fbff] text-sm font-bold text-[#0a1628] transition hover:bg-[#eef4ff] dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 xl:inline-flex xl:h-12 xl:w-12"
          >
            👤
          </Link>
          <Link href="/submit" className="hidden xl:block">
            <Button className="h-12 px-5">Submit a venue</Button>
          </Link>
          <button
            type="button"
            onClick={toggle}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#d8e3f5] bg-[#f8fbff] text-[#0a1628] transition hover:bg-[#eef4ff] dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10 xl:inline-flex"
          >
            {isDark ? "☀️" : "🌙"}
          </button>
        </div>
      </div>

      <div className="container-shell mt-0 border-t border-[#d8e3f5]/50 pb-3 dark:border-white/8 lg:hidden">
        <nav className="grid grid-cols-4 gap-2 pt-3">
          <Link
            href="/"
            className={`inline-flex h-12 items-center justify-center whitespace-nowrap rounded-full border px-2 text-sm font-semibold transition ${
              pathname === "/"
                ? "border-[#f4b942] bg-[#f4b942] text-[#0a1628]"
                : "border-[#d8e3f5] bg-[#f8fbff] text-[#0a1628] dark:border-white/10 dark:bg-white/5 dark:text-white"
            }`}
          >
            Home
          </Link>
          <Link
            href={mapHref}
            className={`inline-flex h-12 items-center justify-center whitespace-nowrap rounded-full border px-2 text-sm font-semibold transition ${
              pathname?.includes("/map")
                ? "border-[#f4b942] bg-[#f4b942] text-[#0a1628]"
                : "border-[#d8e3f5] bg-[#f8fbff] text-[#0a1628] dark:border-white/10 dark:bg-white/5 dark:text-white"
            }`}
          >
            Map
          </Link>
          <Link
            href={matchesHref}
            className={`inline-flex h-12 items-center justify-center whitespace-nowrap rounded-full border px-2 text-sm font-semibold transition ${
              pathname?.includes("/matches")
                ? "border-[#f4b942] bg-[#f4b942] text-[#0a1628]"
                : "border-[#d8e3f5] bg-[#f8fbff] text-[#0a1628] dark:border-white/10 dark:bg-white/5 dark:text-white"
            }`}
          >
            Matches
          </Link>
          <Link
            href="/saved"
            className={`inline-flex h-12 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border px-2 text-sm font-semibold transition ${
              pathname === "/saved"
                ? "border-[#f4b942] bg-[#f4b942] text-[#0a1628]"
                : "border-[#d8e3f5] bg-[#f8fbff] text-[#0a1628] dark:border-white/10 dark:bg-white/5 dark:text-white"
            }`}
          >
            <HeartIcon />
            <span className="max-[360px]:hidden">Saved</span>
          </Link>
        </nav>
      </div>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-white/60 md:hidden"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-4 top-[calc(env(safe-area-inset-top,0px)+4rem)] z-50 w-[min(92vw,24rem)] overflow-hidden rounded-[1.5rem] border border-[#d8e3f5] bg-white shadow-2xl dark:border-white/10 dark:bg-[#161b22] md:right-6 md:w-[26rem]">
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
