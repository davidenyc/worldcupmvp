"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Crown,
  Heart,
  MapPin,
  MoonStar,
  Search,
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
    ? "inline-flex h-11 items-center border-b-2 border-gold px-3 text-sm font-semibold text-[color:var(--fg-primary)]"
    : "inline-flex h-11 items-center border-b-2 border-transparent px-3 text-sm font-semibold text-[color:var(--fg-secondary)] transition hover:text-[color:var(--fg-primary)]";
}

function actionButtonClass() {
  return "inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--border-subtle)] bg-[var(--bg-surface)] text-[color:var(--fg-primary)] transition hover:bg-[var(--bg-surface-elevated)]";
}

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { userCity, suggestedCity, hasChosenCity, setUserCity } = useUserCity();
  const { isDark, setTheme } = useTheme();
  const { tier } = useMembership();
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [mobileNavVisible, setMobileNavVisible] = useState(true);
  const [menuMounted, setMenuMounted] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 16 });
  const accountButtonRef = useRef<HTMLButtonElement | null>(null);

  const activeCity = useMemo(() => {
    const fromPath = getActiveCityFromPath(pathname);
    if (fromPath) return fromPath;
    return userCity ?? suggestedCity ?? "nyc";
  }, [pathname, suggestedCity, userCity]);

  const activeCityData = CITY_LOOKUP.get(activeCity) ?? HOST_CITIES[0];
  const nearestCity = suggestedCity ?? null;
  const currentPath = pathname ?? "/";
  const mapHref = `/${activeCity}/map`;
  const promosHref = "/promos";
  const myHref = "/me";
  const searchHref = `/search?city=${activeCity}`;

  useEffect(() => {
    setAccountMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    setMenuMounted(true);
  }, []);

  useEffect(() => {
    if (!accountMenuOpen || !accountButtonRef.current) return;

    const updatePosition = () => {
      const rect = accountButtonRef.current?.getBoundingClientRect();
      if (!rect) return;
      setMenuPosition({
        top: rect.bottom + 8,
        right: Math.max(16, window.innerWidth - rect.right)
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, { passive: true });
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
  }, [accountMenuOpen]);

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;

    const updateNav = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastY;

      if (currentY < 24) {
        setMobileNavVisible(true);
      } else if (delta > 6) {
        setMobileNavVisible(false);
      } else if (delta < -6) {
        setMobileNavVisible(true);
      }

      lastY = currentY;
      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateNav);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function navigateToCity(nextCity: string) {
    setUserCity(nextCity);
    setAccountMenuOpen(false);

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
        <div className="container-shell flex min-h-[52px] items-center justify-between gap-3 py-2 lg:min-h-[64px] lg:py-3">
          <div className="flex min-w-0 shrink-0 items-center">
            <Link href="/" className="brand-wordmark flex min-w-0 shrink-0 items-center gap-2 text-[color:var(--fg-primary)] [text-decoration:none] visited:text-[color:var(--fg-primary)] hover:text-[color:var(--fg-primary)]">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-sm font-black"
                style={{ backgroundColor: "#f4b942", color: "#ffffff" }}
              >
                GM
              </div>
              <div className="min-w-0">
                <div className="truncate text-lg font-extrabold tracking-tight text-deep sm:text-xl">
                  GameDay Map<span className="ml-0.5 text-gold">.</span>
                </div>
                <div className="hidden truncate text-xs text-mist lg:block">
                  World Cup 2026 watch parties
                </div>
              </div>
            </Link>
          </div>

          <div className="hidden min-w-0 flex-1 justify-center lg:flex">
            <nav className="flex items-center gap-6">
              <Link href="/" className={primaryNavClass(currentPath === "/")}>Home</Link>
              <Link href={mapHref} className={primaryNavClass(currentPath.includes("/map"))}>Map</Link>
              <Link href={promosHref} className={primaryNavClass(currentPath.startsWith("/promos"))}>Promos</Link>
              <Link href={myHref} className={primaryNavClass(currentPath.startsWith("/me"))}>My Cup</Link>
            </nav>
          </div>

          <div className="flex min-w-0 shrink-0 items-center justify-end gap-2">
            {tier === "free" ? (
              <Link
                href="/membership"
                aria-label="Upgrade"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gold/45 bg-gold/10 text-gold transition hover:bg-gold/20 lg:h-11 lg:w-auto lg:gap-2 lg:px-4 lg:text-sm lg:font-semibold"
              >
                <Crown className="h-4 w-4" />
                <span className="hidden lg:inline">Upgrade</span>
              </Link>
            ) : null}

            <Link href={searchHref} aria-label="Search" className={`${actionButtonClass()} lg:h-11 lg:w-11`}>
              <Search className="h-4 w-4" />
            </Link>

            <button
              ref={accountButtonRef}
              type="button"
              onClick={() => setAccountMenuOpen((current) => !current)}
              aria-label="Account menu"
              className={`${actionButtonClass()} lg:h-11 lg:w-11`}
            >
              <User2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {menuMounted && accountMenuOpen
        ? createPortal(
            <>
              <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setAccountMenuOpen(false)} />
              <div
                className="fixed z-50 w-[min(92vw,18rem)] overflow-hidden rounded-2xl border border-[color:var(--border-subtle)] bg-[var(--bg-surface)] shadow-popover"
                style={{ top: menuPosition.top, right: menuPosition.right }}
              >
                <div className="border-b border-[color:var(--border-subtle)] px-4 py-3">
                  <div className="text-small uppercase tracking-[0.18em] text-[color:var(--fg-muted)]">Account</div>
                </div>
                <div className="grid gap-2 p-3">
                  <button
                    type="button"
                    onClick={() => navigateToCity(activeCityData.key)}
                    className="inline-flex h-11 items-center justify-between rounded-full border border-[color:var(--border-subtle)] px-4 text-sm font-semibold text-[color:var(--fg-primary)] transition hover:bg-[var(--bg-surface-elevated)]"
                  >
                    <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4" /> {activeCityData.label}</span>
                    <span>{activeCityData.shortLabel}</span>
                  </button>
                  <Link href="/account" className="inline-flex h-11 items-center justify-between rounded-full border border-[color:var(--border-subtle)] px-4 text-sm font-semibold text-[color:var(--fg-primary)] transition hover:bg-[var(--bg-surface-elevated)]">
                    <span>Account</span>
                    <span>→</span>
                  </Link>
                  <Link href="/saved" className="inline-flex h-11 items-center justify-between rounded-full border border-[color:var(--border-subtle)] px-4 text-sm font-semibold text-[color:var(--fg-primary)] transition hover:bg-[var(--bg-surface-elevated)]">
                    <span className="inline-flex items-center gap-2"><Heart className="h-4 w-4" /> Saved</span>
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
            </>,
            document.body
          )
        : null}

      <div
        className={`mobile-nav-shell pointer-events-none fixed inset-x-0 bottom-0 z-50 px-4 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] transition-transform duration-200 ease-out min-[600px]:hidden ${
          mobileNavVisible ? "translate-y-0" : "translate-y-[calc(100%+1.5rem)]"
        }`}
      >
        <div className="pointer-events-auto relative mx-auto max-w-md rounded-2xl border border-[color:var(--border-subtle)] bg-[color:color-mix(in_srgb,var(--bg-surface)_96%,transparent)] px-3 py-2 shadow-popover backdrop-blur-xl">
          <nav className="grid grid-cols-4 items-center gap-1">
            <Link href="/" className={`flex min-h-11 flex-col items-center justify-center rounded-2xl px-1 py-2 text-[10px] font-semibold ${currentPath === "/" ? "text-[color:var(--fg-primary)]" : "text-[color:var(--fg-muted)]"}`}>
              <span>🏠</span>
              <span>Home</span>
            </Link>
            <Link href={mapHref} className={`flex min-h-11 flex-col items-center justify-center rounded-2xl px-1 py-2 text-[10px] font-semibold ${currentPath.includes("/map") ? "text-[color:var(--fg-primary)]" : "text-[color:var(--fg-muted)]"}`}>
              <span>🗺️</span>
              <span>Map</span>
            </Link>
            <Link href={promosHref} className={`flex min-h-11 flex-col items-center justify-center rounded-2xl px-1 py-2 text-[10px] font-semibold ${currentPath.startsWith("/promos") ? "text-[color:var(--fg-primary)]" : "text-[color:var(--fg-muted)]"}`}>
              <span>🏷️</span>
              <span>Promos</span>
            </Link>
            <Link href={myHref} className={`flex min-h-11 flex-col items-center justify-center rounded-2xl px-1 py-2 text-[10px] font-semibold ${currentPath.startsWith("/me") ? "text-[color:var(--fg-primary)]" : "text-[color:var(--fg-muted)]"}`}>
              <span>⭐</span>
              <span>My Cup</span>
            </Link>
          </nav>
        </div>
      </div>
    </>
  );
}
