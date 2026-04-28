"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  Heart,
  MapPin,
  Menu,
  MoonStar,
  Search,
  Star,
  SunMedium,
  User2
} from "lucide-react";

import { HOST_CITIES, getHostCity } from "@/lib/data/hostCities";
import { getMatchHostCityKey } from "@/lib/data/matchLocations";
import { worldCup2026Matches } from "@/lib/data/matches";
import { useUserCity } from "@/lib/hooks/useUserCity";
import { useMembership } from "@/lib/store/membership";
import { useTheme } from "@/lib/store/theme";

const CITY_LOOKUP = new Map(HOST_CITIES.map((city) => [city.key, city] as const));

function getActiveCityFromPath(pathname: string | null) {
  if (!pathname) return null;
  const segment = pathname.split("/").filter(Boolean)[0];
  return segment ? getHostCity(segment)?.key ?? null : null;
}

function getMatchCountForCity(cityKey: string) {
  return worldCup2026Matches.filter((match) => getMatchHostCityKey(match) === cityKey).length;
}

function primaryNavClass(active: boolean) {
  return active
    ? "inline-flex h-11 items-center rounded-full bg-gold px-4 text-sm font-semibold text-[color:var(--fg-on-accent)]"
    : "inline-flex h-11 items-center rounded-full px-4 text-sm font-semibold text-[color:var(--fg-secondary)] transition hover:bg-[var(--bg-surface-elevated)] hover:text-[color:var(--fg-primary)]";
}

function actionButtonClass() {
  return "inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--border-subtle)] bg-[var(--bg-surface)] text-[color:var(--fg-primary)] transition hover:bg-[var(--bg-surface-elevated)]";
}

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { userCity, suggestedCity, hasChosenCity, setUserCity } = useUserCity();
  const { isDark, setTheme } = useTheme();
  const tier = useMembership((state) => state.tier);
  const [cityOpen, setCityOpen] = useState(false);
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSubmitOpen, setMobileSubmitOpen] = useState(false);

  const activeCity = useMemo(() => {
    const fromPath = getActiveCityFromPath(pathname);
    if (fromPath) return fromPath;
    return userCity ?? suggestedCity ?? "nyc";
  }, [pathname, suggestedCity, userCity]);

  const activeCityData = CITY_LOOKUP.get(activeCity) ?? HOST_CITIES[0];
  const nearestCity = suggestedCity ?? null;
  const currentPath = pathname ?? "/";
  const mapHref = `/${activeCity}/map`;
  const matchesHref = `/${activeCity}/matches`;
  const todayHref = "/today";
  const promosHref = `/today#deals-today`;
  const searchHref = `/search?city=${activeCity}`;
  const membershipHref = tier === "free" ? `/membership?return=${encodeURIComponent(currentPath)}` : "/membership";
  const hasMatchesToday = useMemo(() => {
    const today = new Date();
    const dateKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    return worldCup2026Matches.some((match) => match.startsAt.slice(0, 10) === dateKey);
  }, []);

  useEffect(() => {
    const handleOpenCitySwitcher = () => setCityOpen(true);
    window.addEventListener("gameday:open-city-switcher", handleOpenCitySwitcher);
    return () => window.removeEventListener("gameday:open-city-switcher", handleOpenCitySwitcher);
  }, []);

  useEffect(() => {
    setDesktopMenuOpen(false);
    setMobileMenuOpen(false);
    setMobileSubmitOpen(false);
  }, [pathname]);

  function navigateToCity(nextCity: string) {
    setUserCity(nextCity);
    setCityOpen(false);

    const segments = (pathname ?? "/").split("/").filter(Boolean);
    const currentCity = getActiveCityFromPath(pathname);

    if (pathname === "/" || !pathname) {
      router.push(`/${nextCity}/map`);
      return;
    }

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
    <>
      <header
        className="sticky top-0 z-40 border-b border-[color:var(--border-subtle)] bg-[color:color-mix(in_srgb,var(--bg-surface)_92%,transparent)] backdrop-blur-xl"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <div className="container-shell flex min-h-[64px] items-center justify-between gap-3 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/" className="flex min-w-0 shrink-0 items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gold text-base font-black text-[color:var(--fg-on-accent)] shadow-card">
                GM
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold tracking-tight text-[color:var(--fg-primary)] sm:text-base">
                  GameDay Map
                </div>
                <div className="hidden text-small text-[color:var(--fg-muted)] lg:block">
                  World Cup 2026 watch parties
                </div>
              </div>
            </Link>

            <nav className="hidden items-center gap-1 lg:flex">
              <Link href="/" className={primaryNavClass(currentPath === "/")}>Home</Link>
              <Link href={todayHref} className={primaryNavClass(currentPath === "/today")}>Today</Link>
              <Link href={mapHref} className={primaryNavClass(currentPath.includes("/map"))}>Map</Link>
              <Link href={matchesHref} className={primaryNavClass(currentPath.includes("/matches"))}>Matches</Link>
            </nav>
          </div>

          <div className="flex min-w-0 items-center justify-end gap-2">
            <Link
              href={promosHref}
              className="hidden h-11 items-center rounded-full border border-gold bg-[var(--accent-soft-bg)] px-4 text-sm font-semibold text-gold transition hover:bg-gold hover:text-[color:var(--fg-on-accent)] lg:inline-flex"
            >
              Promos
            </Link>

            <button
              type="button"
              onClick={() => setCityOpen((current) => !current)}
              className="inline-flex h-10 max-w-[8rem] min-w-0 items-center gap-2 rounded-full border border-[color:var(--border-subtle)] bg-[var(--bg-surface)] px-3 text-sm font-semibold text-[color:var(--fg-primary)] transition hover:bg-[var(--bg-surface-elevated)] lg:h-11 lg:max-w-[11rem]"
            >
              <span className="truncate">{activeCityData.label}</span>
              <ChevronDown className="h-4 w-4 shrink-0 text-[color:var(--fg-muted)]" />
            </button>

            <Link href={searchHref} aria-label="Search" className={`${actionButtonClass()} lg:h-11 lg:w-11`}>
              <Search className="h-4 w-4" />
            </Link>

            <Link
              href={membershipHref}
              aria-label={tier === "free" ? "Go Pro" : tier === "fan" ? "Fan Pass" : "Supporter Elite"}
              className={`${actionButtonClass()} border-gold text-gold lg:h-11 lg:w-11`}
            >
              <Star className={`h-4 w-4 ${tier === "free" ? "" : "fill-current"}`} />
            </Link>

            <button
              type="button"
              onClick={() => (window.innerWidth >= 1024 ? setDesktopMenuOpen((current) => !current) : setMobileMenuOpen(true))}
              aria-label="Open menu"
              className={`${actionButtonClass()} lg:hidden`}
            >
              <Menu className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => setDesktopMenuOpen((current) => !current)}
              aria-label="Account menu"
              className={`${actionButtonClass()} hidden lg:inline-flex lg:h-11 lg:w-11`}
            >
              <User2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {desktopMenuOpen ? (
          <div className="container-shell relative hidden lg:block">
            <div className="absolute right-0 top-2 z-50 w-72 overflow-hidden rounded-2xl border border-[color:var(--border-subtle)] bg-[var(--bg-surface)] shadow-popover">
              <div className="border-b border-[color:var(--border-subtle)] px-4 py-3">
                <div className="text-small uppercase tracking-[0.18em] text-[color:var(--fg-muted)]">Account</div>
              </div>
              <div className="grid gap-2 p-3">
                <Link href="/account" className="inline-flex h-11 items-center justify-between rounded-full border border-[color:var(--border-subtle)] px-4 text-sm font-semibold text-[color:var(--fg-primary)] transition hover:bg-[var(--bg-surface-elevated)]">
                  <span>Account</span>
                  <span>→</span>
                </Link>
                <Link href="/saved" className="inline-flex h-11 items-center justify-between rounded-full border border-[color:var(--border-subtle)] px-4 text-sm font-semibold text-[color:var(--fg-primary)] transition hover:bg-[var(--bg-surface-elevated)]">
                  <span className="inline-flex items-center gap-2"><Heart className="h-4 w-4" /> Saved</span>
                  <span>→</span>
                </Link>
                <Link href={promosHref} className="inline-flex h-11 items-center justify-between rounded-full border border-[color:var(--border-subtle)] px-4 text-sm font-semibold text-[color:var(--fg-primary)] transition hover:bg-[var(--bg-surface-elevated)]">
                  <span>Promos</span>
                  <span>→</span>
                </Link>
                <Link href="/submit" className="inline-flex h-11 items-center justify-between rounded-full border border-[color:var(--border-subtle)] px-4 text-sm font-semibold text-[color:var(--fg-primary)] transition hover:bg-[var(--bg-surface-elevated)]">
                  <span>Submit a venue</span>
                  <span>→</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setTheme(isDark ? "light" : "dark")}
                  className="inline-flex h-11 items-center justify-between rounded-full border border-[color:var(--border-subtle)] px-4 text-sm font-semibold text-[color:var(--fg-primary)] transition hover:bg-[var(--bg-surface-elevated)]"
                >
                  <span className="inline-flex items-center gap-2">
                    {isDark ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
                    {isDark ? "Light mode" : "Dark mode"}
                  </span>
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </header>

      {cityOpen ? (
        <>
          <div className="fixed inset-0 z-40 bg-black/25" onClick={() => setCityOpen(false)} />
          <div className="fixed left-1/2 top-[calc(env(safe-area-inset-top,0px)+5rem)] z-50 w-[min(92vw,26rem)] -translate-x-1/2 overflow-hidden rounded-2xl border border-[color:var(--border-subtle)] bg-[var(--bg-surface)] shadow-popover">
            <div className="border-b border-[color:var(--border-subtle)] px-4 py-3">
              <div className="text-small uppercase tracking-[0.18em] text-[color:var(--fg-muted)]">Switch city</div>
              <div className="mt-1 text-sm text-[color:var(--fg-secondary)]">Pick your host city for watch spots, matches, and venue guides.</div>
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
                        active
                          ? "border-gold bg-[var(--accent-soft-bg)] text-[color:var(--fg-primary)]"
                          : "border-[color:var(--border-subtle)] bg-[var(--bg-surface)] text-[color:var(--fg-primary)] hover:bg-[var(--bg-surface-elevated)]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-semibold">{city.label}</div>
                          <div className="mt-1 text-xs text-[color:var(--fg-muted)]">
                            {city.state} · {matchCount} matches
                          </div>
                        </div>
                        {isNearest ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--accent-soft-bg)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:var(--accent-soft-fg)]">
                            <MapPin className="h-3 w-3" />
                            Nearest
                          </span>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            {!hasChosenCity ? (
              <div className="border-t border-[color:var(--border-subtle)] px-4 py-3 text-small text-[color:var(--fg-muted)]">
                We&apos;ll remember your city on this device.
              </div>
            ) : null}
          </div>
        </>
      ) : null}

      {mobileMenuOpen ? (
        <>
          <div className="fixed inset-0 z-[60] bg-black/35 min-[1024px]:hidden" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed inset-x-0 bottom-0 z-[61] rounded-t-[2rem] border-t border-[color:var(--border-subtle)] bg-[var(--bg-surface)] px-5 pb-[calc(env(safe-area-inset-bottom,0px)+1.5rem)] pt-5 shadow-popover min-[1024px]:hidden">
            <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-[var(--border-subtle)]" />
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-small uppercase tracking-[0.18em] text-[color:var(--fg-muted)]">Menu</div>
                <div className="mt-1 text-sm text-[color:var(--fg-secondary)]">Everything else lives here on mobile.</div>
              </div>
              <button type="button" onClick={() => setMobileMenuOpen(false)} className="text-2xl text-[color:var(--fg-muted)]">×</button>
            </div>
            <div className="mt-5 grid gap-3">
              <Link href="/account" className="inline-flex h-12 items-center justify-between rounded-full border border-[color:var(--border-subtle)] px-4 text-sm font-semibold text-[color:var(--fg-primary)]">
                <span>Account</span>
                <span>→</span>
              </Link>
              <Link href={membershipHref} className="inline-flex h-12 items-center justify-between rounded-full border border-[color:var(--border-subtle)] px-4 text-sm font-semibold text-[color:var(--fg-primary)]">
                <span>{tier === "free" ? "Membership" : tier === "fan" ? "Fan Pass" : "Supporter Elite"}</span>
                <span>→</span>
              </Link>
              <Link href="/saved" className="inline-flex h-12 items-center justify-between rounded-full border border-[color:var(--border-subtle)] px-4 text-sm font-semibold text-[color:var(--fg-primary)]">
                <span>Saved venues</span>
                <span>→</span>
              </Link>
              <Link href={promosHref} className="inline-flex h-12 items-center justify-between rounded-full border border-[color:var(--border-subtle)] px-4 text-sm font-semibold text-[color:var(--fg-primary)]">
                <span>Promos</span>
                <span>→</span>
              </Link>
              <Link href="/submit" className="inline-flex h-12 items-center justify-between rounded-full border border-[color:var(--border-subtle)] px-4 text-sm font-semibold text-[color:var(--fg-primary)]">
                <span>Submit a venue</span>
                <span>→</span>
              </Link>
              <button
                type="button"
                onClick={() => setTheme(isDark ? "light" : "dark")}
                className="inline-flex h-12 items-center justify-between rounded-full border border-[color:var(--border-subtle)] px-4 text-sm font-semibold text-[color:var(--fg-primary)]"
              >
                <span>{isDark ? "Switch to light mode" : "Switch to dark mode"}</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </>
      ) : null}

      {mobileSubmitOpen ? (
        <>
          <div className="fixed inset-0 z-[60] bg-black/35 min-[600px]:hidden" onClick={() => setMobileSubmitOpen(false)} />
          <div className="fixed inset-x-0 bottom-0 z-[61] rounded-t-[2rem] border-t border-[color:var(--border-subtle)] bg-[var(--bg-surface)] px-5 pb-[calc(env(safe-area-inset-bottom,0px)+1.5rem)] pt-5 shadow-popover min-[600px]:hidden">
            <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-[var(--border-subtle)]" />
            <div className="text-small uppercase tracking-[0.18em] text-[color:var(--fg-muted)]">Submit a venue</div>
            <h3 className="mt-2 text-h2 text-[color:var(--fg-primary)]">Know a room we should add?</h3>
            <p className="mt-2 text-sm leading-6 text-[color:var(--fg-secondary)]">
              Send us the bar, restaurant, or supporter club and we&apos;ll review it for match-day coverage.
            </p>
            <div className="mt-5 grid gap-3">
              <Link href="/submit" className="inline-flex h-12 items-center justify-center rounded-full bg-gold px-4 text-sm font-semibold text-[color:var(--fg-on-accent)]">
                Open submit form
              </Link>
              <button type="button" onClick={() => setMobileSubmitOpen(false)} className="inline-flex h-12 items-center justify-center rounded-full border border-[color:var(--border-subtle)] px-4 text-sm font-semibold text-[color:var(--fg-primary)]">
                Maybe later
              </button>
            </div>
          </div>
        </>
      ) : null}

      <div className="mobile-nav-shell pointer-events-none fixed inset-x-0 bottom-0 z-50 px-4 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] min-[600px]:hidden">
        <div className="pointer-events-auto relative mx-auto max-w-md rounded-2xl border border-[color:var(--border-subtle)] bg-[color:color-mix(in_srgb,var(--bg-surface)_96%,transparent)] px-3 py-2 shadow-popover backdrop-blur-xl">
          <nav className="grid grid-cols-6 items-center gap-1">
            <Link href="/" className={`flex min-h-11 flex-col items-center justify-center rounded-2xl px-1 py-2 text-[10px] font-semibold ${currentPath === "/" ? "text-[color:var(--fg-primary)]" : "text-[color:var(--fg-muted)]"}`}>
              <span>🏠</span>
              <span>Home</span>
            </Link>
            <Link href={todayHref} className={`flex min-h-11 flex-col items-center justify-center rounded-2xl px-1 py-2 text-[10px] font-semibold ${currentPath === "/today" ? "text-[color:var(--fg-primary)]" : "text-[color:var(--fg-muted)]"}`}>
              <span className={hasMatchesToday ? "mobile-tonight-pulse" : ""}>⚽</span>
              <span>Today</span>
            </Link>
            <Link href={mapHref} className={`flex min-h-11 flex-col items-center justify-center rounded-2xl px-1 py-2 text-[10px] font-semibold ${currentPath.includes("/map") ? "text-[color:var(--fg-primary)]" : "text-[color:var(--fg-muted)]"}`}>
              <span>🗺️</span>
              <span>Map</span>
            </Link>
            <Link href={matchesHref} className={`flex min-h-11 flex-col items-center justify-center rounded-2xl px-1 py-2 text-[10px] font-semibold ${currentPath.includes("/matches") ? "text-[color:var(--fg-primary)]" : "text-[color:var(--fg-muted)]"}`}>
              <span>📅</span>
              <span>Matches</span>
            </Link>
            <Link href={promosHref} className={`flex min-h-11 flex-col items-center justify-center rounded-2xl px-1 py-2 text-[10px] font-semibold ${currentPath === "/today" ? "text-[color:var(--fg-primary)]" : "text-[color:var(--fg-muted)]"}`}>
              <span>🏷️</span>
              <span>Promos</span>
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className={`flex min-h-11 flex-col items-center justify-center rounded-2xl px-1 py-2 text-[10px] font-semibold ${currentPath === "/account" ? "text-[color:var(--fg-primary)]" : "text-[color:var(--fg-muted)]"}`}
            >
              <span>👤</span>
              <span>Account</span>
            </button>
          </nav>
        </div>
      </div>
    </>
  );
}
