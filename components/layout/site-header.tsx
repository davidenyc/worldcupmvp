"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Crown,
  Heart,
  Home,
  Map as MapIcon,
  MapPin,
  MoonStar,
  Search,
  SunMedium,
  Tag,
  Trophy,
  User2
} from "lucide-react";

import { HOST_CITIES, getHostCity } from "@/lib/data/hostCities";
import { useUserCity } from "@/lib/hooks/useUserCity";
import { useMembership } from "@/lib/store/membership";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { NotificationDrawer } from "@/components/notifications/NotificationDrawer";
import { useTheme } from "@/lib/store/theme";
import { useSession } from "@/lib/hooks/useSession";
import { useUser } from "@/lib/store/user";

const CITY_LOOKUP = new Map(HOST_CITIES.map((city) => [city.key, city] as const));

function getActiveCityFromPath(pathname: string | null) {
  if (!pathname) return null;
  const segment = pathname.split("/").filter(Boolean)[0];
  return segment ? getHostCity(segment)?.key ?? null : null;
}

function primaryNavClass(active: boolean) {
  return active
    ? "inline-flex h-11 items-center border-b-2 border-gold px-3 text-sm font-semibold text-[color:var(--fg-primary)]"
    : "inline-flex h-11 items-center border-b-2 border-transparent px-3 text-sm font-semibold text-[color:var(--fg-secondary)] transition hover:text-[color:var(--fg-primary)]";
}

function actionButtonClass() {
  return "inline-flex min-h-11 w-11 items-center justify-center rounded-full border border-[color:var(--border-subtle)] bg-[var(--bg-surface)] text-[color:var(--fg-primary)] transition hover:bg-[var(--bg-surface-elevated)] max-[359px]:min-h-10 max-[359px]:w-10";
}

const PRIMARY_NAV_ITEMS = [
  { label: "Home", key: "home", matches: (path: string) => path === "/" || path === "/app" },
  { label: "Today", key: "today", matches: (path: string) => path.startsWith("/today") },
  { label: "Matches", key: "matches", matches: (path: string) => path.includes("/matches") },
  { label: "Map", key: "map", matches: (path: string) => path.includes("/map") },
  { label: "Promos", key: "promos", matches: (path: string) => path.startsWith("/promos") },
  { label: "My Cup", key: "me", matches: (path: string) => path.startsWith("/me") }
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { activeCity: userCity, suggestedCity, setUserCity, isExplicit } = useUserCity();
  const { isDark, setTheme } = useTheme();
  const { tier } = useMembership();
  const { user: authUser } = useSession();
  const localUser = useUser();
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [cityMenuOpen, setCityMenuOpen] = useState(false);
  const [mobileNavVisible, setMobileNavVisible] = useState(true);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [menuMounted, setMenuMounted] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 16 });
  const accountButtonRef = useRef<HTMLButtonElement | null>(null);
  const lastScrollYRef = useRef(0);

  const activeCity = useMemo(() => {
    const fromPath = getActiveCityFromPath(pathname);
    if (fromPath) return fromPath;
    return userCity ?? suggestedCity ?? "nyc";
  }, [pathname, suggestedCity, userCity]);

  const activeCityData = CITY_LOOKUP.get(activeCity) ?? HOST_CITIES[0];
  const currentPath = pathname ?? "/";
  const mapHref = `/${activeCity}/map`;
  const todayHref = `/today?city=${activeCity}`;
  const matchesHref = `/${activeCity}/matches`;
  const promosHref = "/promos";
  const myHref = "/me";
  const homeHref = "/?home=1";
  const searchHref = `/search?city=${activeCity}`;
  const hideMobileNav = currentPath === "/welcome";
  const isHomeSurface = currentPath === "/" || currentPath === "/app";
  const hideHeaderUpgrade = isHomeSurface || currentPath === "/welcome";
  const showHeaderUpgrade = tier === "free" && !hideHeaderUpgrade;
  const navHrefByKey = {
    home: homeHref,
    today: todayHref,
    matches: matchesHref,
    map: mapHref,
    promos: promosHref,
    me: myHref
  } as const;
  const primaryNavItems = PRIMARY_NAV_ITEMS.map((item) => ({
    href: navHrefByKey[item.key],
    label: item.label,
    active: item.matches(currentPath)
  }));

  useEffect(() => {
    setAccountMenuOpen(false);
    setNotificationsOpen(false);
  }, [pathname]);

  useEffect(() => {
    const openCitySwitcher = () => {
      setAccountMenuOpen(false);
      setCityMenuOpen(true);
    };

    window.addEventListener("gameday:open-city-switcher", openCitySwitcher);
    return () => window.removeEventListener("gameday:open-city-switcher", openCitySwitcher);
  }, []);

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
    const updateNav = () => {
      const currentY = window.scrollY;
      const previousY = lastScrollYRef.current;
      const nearTop = currentY < 12;
      const scrollingUp = currentY < previousY - 4;
      const nextVisible = nearTop || scrollingUp;

      setMobileNavVisible((current) => (current === nextVisible ? current : nextVisible));

      lastScrollYRef.current = currentY;
    };

    lastScrollYRef.current = window.scrollY;
    setMobileNavVisible(true);
    window.addEventListener("scroll", updateNav, { passive: true });
    document.addEventListener("scroll", updateNav, { passive: true, capture: true });
    const onPageShow = () => setMobileNavVisible(true);
    window.addEventListener("pageshow", onPageShow);
    return () => {
      window.removeEventListener("scroll", updateNav);
      document.removeEventListener("scroll", updateNav, true);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, []);

  useEffect(() => {
    if (hideMobileNav) {
      setMobileNavVisible(false);
      return;
    }

    setMobileNavVisible(true);
  }, [hideMobileNav, pathname]);

  function navigateToCity(nextCity: string) {
    setUserCity(nextCity);
    setAccountMenuOpen(false);
    setCityMenuOpen(false);

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
        className="sticky top-0 z-40 border-b border-[color:var(--border-subtle)] bg-[color:color-mix(in_srgb,var(--bg-surface)_94%,transparent)] backdrop-blur-xl"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <div className="container-shell flex min-h-[52px] items-center justify-between gap-2 py-2 lg:grid lg:min-h-[64px] lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-center lg:py-3">
          <div className="flex min-w-0 shrink-0 items-center lg:justify-self-start">
            <Link href={homeHref} className="brand-wordmark flex min-w-0 shrink-0 items-center gap-2 text-[color:var(--fg-primary)] [text-decoration:none] visited:text-[color:var(--fg-primary)] hover:text-[color:var(--fg-primary)]">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl text-xs font-black sm:h-9 sm:w-9 sm:text-sm"
                style={{ backgroundColor: "var(--gold)", color: "var(--fg-on-strong)" }}
              >
                GM
              </div>
              <div className="min-w-0">
                <div className="truncate text-[1.3rem] font-extrabold tracking-tight text-[color:var(--fg-primary)] sm:text-xl">
                  GameDay Maps<span className="ml-0.5 font-black text-gold">.</span>
                </div>
                <div className="hidden truncate text-xs text-[color:var(--fg-secondary)] lg:block">
                  World Cup 2026 watch parties
                </div>
              </div>
            </Link>
          </div>

          <div className="hidden min-w-0 justify-center lg:flex lg:justify-self-center">
            <nav className="flex items-center gap-6">
              {primaryNavItems.map((item) => (
                <Link key={item.label} href={item.href} className={primaryNavClass(item.active)}>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex min-w-0 shrink-0 items-center justify-end gap-1.5 sm:gap-2 lg:justify-self-end">
            <div className="flex flex-col items-end gap-1">
              <button
                type="button"
                onClick={() => {
                  setAccountMenuOpen(false);
                  setCityMenuOpen(true);
                }}
                aria-label={`Switch city from ${activeCityData.label}`}
                className="inline-flex min-h-11 min-w-[4.5rem] items-center justify-center gap-1 rounded-full border border-[color:var(--border-subtle)] bg-[var(--bg-surface)] px-2 text-sm font-semibold text-[color:var(--fg-primary)] transition hover:bg-[var(--bg-surface-elevated)] sm:gap-2 sm:px-3 max-[359px]:min-h-10"
              >
                <MapPin className="h-4 w-4" />
                <span className={`max-w-[3rem] truncate sm:max-w-[5.5rem] ${isExplicit ? "" : "italic text-[color:var(--fg-secondary)]"}`}>
                  {activeCityData.shortLabel}
                </span>
                {!isExplicit ? (
                  <span className="hidden text-[10px] uppercase tracking-[0.18em] text-mist md:inline">
                    detected
                  </span>
                ) : null}
              </button>
            </div>

            {showHeaderUpgrade ? (
              <Link
                href="/membership"
                aria-label="Upgrade"
                className="hidden min-h-11 w-11 items-center justify-center rounded-full border border-gold/45 bg-gold/10 text-gold transition hover:bg-gold/20 lg:inline-flex lg:w-auto lg:gap-2 lg:px-4 lg:text-sm lg:font-semibold"
              >
                <Crown className="h-4 w-4" />
                <span className="hidden lg:inline">Upgrade</span>
              </Link>
            ) : null}

            {authUser ? (
              <NotificationBell
                onClick={() => {
                  setAccountMenuOpen(false);
                  setNotificationsOpen(true);
                }}
                className={`${actionButtonClass()} lg:h-11 lg:w-11`}
              />
            ) : null}

            <Link href={searchHref} aria-label="Search" className={`${actionButtonClass()} hidden lg:inline-flex lg:h-11 lg:w-11`}>
              <Search className="h-4 w-4" />
            </Link>

            <Link
              href={myHref}
              aria-label="My Cup"
              className={`${actionButtonClass()} lg:hidden`}
            >
              <User2 className="h-4 w-4" />
            </Link>

            <button
              ref={accountButtonRef}
              type="button"
              onClick={() => setAccountMenuOpen((current) => !current)}
              aria-label="Account menu"
              className={`${actionButtonClass()} hidden lg:inline-flex lg:h-11 lg:w-11`}
            >
              <User2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {menuMounted && accountMenuOpen
        ? createPortal(
            <>
              <div className="fixed inset-0 z-[75] bg-black/20" onClick={() => setAccountMenuOpen(false)} />
              <div
                className="fixed z-[80] w-[min(92vw,18rem)] overflow-hidden rounded-2xl border border-[color:var(--border-subtle)] bg-[var(--bg-surface)] shadow-popover"
                style={{ top: menuPosition.top, right: menuPosition.right }}
              >
                <div className="border-b border-[color:var(--border-subtle)] px-4 py-3">
                  {authUser ? (
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent-soft-bg)] text-xl text-[color:var(--accent-soft-fg)]">
                        {localUser.avatarEmoji || "⚽"}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-[color:var(--fg-primary)]">
                          {localUser.firstName || localUser.displayName || "Fan"}
                        </div>
                        <div className="truncate text-xs text-[color:var(--fg-secondary)]">
                          {authUser.email}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="text-sm font-semibold text-[color:var(--fg-primary)]">
                        Sign in to sync
                      </div>
                      <div className="mt-1 text-xs leading-5 text-[color:var(--fg-secondary)]">
                        Keep your saved venues, watched matches, and promos across devices.
                      </div>
                      <Link
                        href="/auth/sign-in"
                        className="mt-3 inline-flex min-h-11 items-center justify-center rounded-full bg-gold px-4 text-sm font-semibold text-[color:var(--fg-on-accent)]"
                      >
                        Sign in →
                      </Link>
                    </>
                  )}
                </div>
                <div className="grid gap-2 p-3">
                  <button
                    type="button"
                    onClick={() => {
                      setAccountMenuOpen(false);
                      setCityMenuOpen(true);
                    }}
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
                  {authUser ? (
                    <form action="/auth/sign-out" method="post">
                      <button
                        type="submit"
                        className="inline-flex h-11 w-full items-center justify-between rounded-full border border-[color:var(--border-subtle)] px-4 text-sm font-semibold text-[color:var(--fg-primary)] transition hover:bg-[var(--bg-surface-elevated)]"
                      >
                        <span>Sign out</span>
                        <span>→</span>
                      </button>
                    </form>
                  ) : null}
                </div>
              </div>
            </>,
            document.body
          )
        : null}

      {menuMounted && cityMenuOpen
        ? createPortal(
            <>
              <div className="fixed inset-0 z-[75] bg-black/20" onClick={() => setCityMenuOpen(false)} />
              <div className="fixed inset-x-4 top-[calc(env(safe-area-inset-top,0px)+4.75rem)] z-[80] mx-auto w-full max-w-md overflow-hidden rounded-3xl border border-[color:var(--border-subtle)] bg-[var(--bg-surface)] shadow-popover">
                <div className="border-b border-[color:var(--border-subtle)] px-4 py-3">
                  <div className="text-small uppercase tracking-[0.18em] text-[color:var(--fg-muted)]">Switch city</div>
                  <div className="mt-1 text-sm text-[color:var(--fg-secondary)]">Choose the host city you want to browse.</div>
                </div>
                <div className="grid max-h-[min(60vh,28rem)] gap-2 overflow-y-auto p-3">
                  {HOST_CITIES.map((city) => (
                    <button
                      key={city.key}
                      type="button"
                      onClick={() => navigateToCity(city.key)}
                      className={`inline-flex min-h-11 items-center justify-between rounded-full border px-4 text-sm font-semibold transition ${
                        city.key === activeCity
                          ? "border-gold bg-gold/10 text-deep"
                          : "border-[color:var(--border-subtle)] bg-[var(--bg-surface)] text-[color:var(--fg-primary)] hover:bg-[var(--bg-surface-elevated)]"
                      }`}
                    >
                      <span>{city.label}</span>
                      <span className="text-[color:var(--fg-muted)]">{city.shortLabel}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>,
            document.body
          )
        : null}

      {authUser ? (
        <NotificationDrawer open={notificationsOpen} onOpenChange={setNotificationsOpen} />
      ) : null}

      {hideMobileNav ? null : (
        <div
          className={`mobile-nav-shell pointer-events-none fixed inset-x-0 bottom-0 z-[70] px-4 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] transition-all duration-200 ease-out lg:hidden ${
            mobileNavVisible
              ? "translate-y-0 opacity-100"
              : "translate-y-[calc(100%+7rem)] opacity-0"
          }`}
        >
          <div className="pointer-events-auto relative mx-auto max-w-md rounded-2xl border border-[color:var(--border-subtle)] bg-[color:color-mix(in_srgb,var(--bg-surface)_96%,transparent)] px-3 py-2 shadow-popover backdrop-blur-xl">
            <nav className="flex items-stretch justify-between gap-1">
              <Link href={homeHref} className={`touch-manipulation flex min-h-11 flex-1 flex-col items-center justify-center rounded-2xl px-1 py-2.5 text-[11px] font-semibold ${currentPath === "/" ? "text-gold" : "text-[color:var(--fg-muted)]"}`}>
                <Home className="h-5 w-5" />
                <span>Home</span>
              </Link>
              <Link href={todayHref} className={`touch-manipulation flex min-h-11 flex-1 flex-col items-center justify-center rounded-2xl px-1 py-2.5 text-[11px] font-semibold ${currentPath.startsWith("/today") ? "text-gold" : "text-[color:var(--fg-muted)]"}`}>
                <SunMedium className="h-5 w-5" />
                <span>Today</span>
              </Link>
              <Link href={mapHref} className={`touch-manipulation flex min-h-11 flex-1 flex-col items-center justify-center rounded-2xl px-1 py-2.5 text-[11px] font-semibold ${currentPath.includes("/map") ? "text-gold" : "text-[color:var(--fg-muted)]"}`}>
                <MapIcon className="h-5 w-5" />
                <span>Map</span>
              </Link>
              <Link href={matchesHref} className={`touch-manipulation flex min-h-11 flex-1 flex-col items-center justify-center rounded-2xl px-1 py-2.5 text-[11px] font-semibold ${currentPath.includes("/matches") ? "text-gold" : "text-[color:var(--fg-muted)]"}`}>
                <Trophy className="h-5 w-5" />
                <span>Matches</span>
              </Link>
              <Link href={myHref} className={`touch-manipulation flex min-h-11 flex-1 flex-col items-center justify-center rounded-2xl px-1 py-2.5 text-[11px] font-semibold ${currentPath.startsWith("/me") ? "text-gold" : "text-[color:var(--fg-muted)]"}`}>
                <Heart className="h-5 w-5" />
                <span>My Cup</span>
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
