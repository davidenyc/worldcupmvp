# Codex Final Sprint — Dark Mode + Flag Fix + Matchday + Deploy-Ready

**Read this entire file before writing any code. This is a 1-2 hour sprint. Execute every section in order.**

This sprint is additive to `CODEX_UI_SPRINT.md`. Complete any unfinished work from that file first if you haven't already (the map must fill >70% of viewport with a floating ⚙ Filters button before this sprint begins). Then execute the sections below.

---

## Hard rules (unchanged from prior brief)

- Do NOT modify `components/map/world-map.tsx` NAME_TO_SLUG or name-matching logic.
- Do NOT install `@types/react-simple-maps`.
- Do NOT re-introduce non-NYC service areas.
- Keep `"use client"` boundaries clean — Leaflet never renders server-side.
- Run `npx tsc --noEmit` after each section before moving on.

---

## SECTION A — Fix the matchday/matches page (~20 min)

Several bugs make the matches page broken or look "off the board":

### A1 — "Watch Locally" tab shows all matches (logic bug)

**File:** `components/matches/MatchesPageClient.tsx`

The `filtered` memo falls through to `allMatches` when `tab === "local"` instead of filtering. Fix:

```tsx
const filtered = useMemo(() => {
  if (tab === "stadium") return stadiumMatches;
  if (tab === "local") {
    // Show all matches — user can see watch spots for any match from their local city.
    // Filter to matches where their selected city has venue data.
    const effectiveCity = userCity ?? cityKey;
    return allMatches.filter((match) => {
      const hostKey = getMatchHostCityKey(match);
      return hostKey === effectiveCity || Boolean(venueCacheByCity[effectiveCity]?.length);
    });
  }
  return allMatches;
}, [allMatches, stadiumMatches, tab, userCity, cityKey, venueCacheByCity]);
```

If the resulting `filtered` list is empty for "local", show a helpful empty state:
```tsx
{tab === "local" && grouped.length === 0 && (
  <div className="rounded-2xl border border-[#d8e3f5] bg-white p-8 text-center text-[#0a1628]">
    <div className="text-4xl">📍</div>
    <div className="mt-4 text-lg font-semibold">Set your city to see local watch spots</div>
    <p className="mt-2 text-sm text-[#0a1628]/55">
      Every match can be watched from your nearest host city. Set your city in the header to get started.
    </p>
    <button type="button" onClick={openCitySwitcher}
      className="mt-4 rounded-full bg-[#f4b942] px-5 py-2.5 text-sm font-semibold text-[#0a1628]">
      Set my city
    </button>
  </div>
)}
```

### A2 — MatchCard badge colours are invisible on light background

**File:** `components/matches/MatchCard.tsx`

The "Today" and "Tomorrow" inline badges use `text-red-300` and `text-amber-300` — almost invisible on white:

```tsx
// Fix the top-right status pills:
{isToday && (
  <span className="rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-red-600 ring-1 ring-red-200">
    🔴 Today
  </span>
)}
{isTomorrow && (
  <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-600 ring-1 ring-amber-200">
    ⚡ Tomorrow
  </span>
)}

// Fix the bottom Badge components too:
{isToday && <Badge className="bg-red-50 text-red-700 ring-1 ring-red-200">Today</Badge>}
{isTomorrow && <Badge className="bg-amber-50 text-amber-700 ring-1 ring-amber-200">Tomorrow</Badge>}
```

### A3 — Matches page sticky header covers first match card

**File:** `components/matches/MatchesPageClient.tsx`

The sticky header is `top-[73px]` (below the site header). The tab pills add ~56px more. Total sticky height is ~129px. The `container-shell py-8` content div below doesn't account for this and the first date group is partially hidden on load.

Add `scroll-mt-[140px]` to each date `<section>` element so anchor-scrolling works correctly. More importantly, wrap the entire page in a layout that prevents the content from starting behind the sticky bar:

```tsx
// The main content div:
// Before:
<div className="container-shell py-8">
// After:
<div className="container-shell py-8 pt-6">
```

And add padding-top compensation on the sticky bar wrapper to avoid flash of covered content:
```tsx
// After the sticky header closing </div>, add a spacer only on mobile:
<div className="h-1" aria-hidden />
```

### A4 — "Watch spots" drawer on mobile is clipped

**File:** `components/matches/WatchSpotsDrawer.tsx`

The drawer on mobile uses `max-h-[88vh]` but doesn't have `overflow-y-auto` on the inner content. Add it:

```tsx
// Find the venue list section and ensure it scrolls:
<div className="flex-1 overflow-y-auto p-4 pb-safe">
  {/* venue list content */}
</div>
```

Also the `md:top-20` on desktop puts the drawer partially behind the header. Fix to `md:top-[81px]` (just below 73px header + 8px gap).

---

## SECTION B — England, Scotland, Wales flag images (~15 min)

The sub-regional Unicode flag emojis (🏴󠁧󠁢󠁥󠁮󠁧󠁿 England, 🏴󠁧󠁢󠁳󠁣󠁴󠁿 Scotland, 🏴󠁧󠁢󠁷󠁬󠁳󠁿 Wales) render as blank boxes on Chrome/Windows. The fix is to use `flagcdn.com` image fallbacks for these specific countries.

### B1 — Create a flag image utility

Create **`lib/utils/flagImage.ts`**:

```ts
// Countries that need image-based flag rendering because their emoji
// uses Unicode sub-regional tag sequences not supported on Chrome/Windows.
const FLAG_IMAGE_OVERRIDES: Record<string, string> = {
  "england":  "https://flagcdn.com/h24/gb-eng.png",
  "scotland": "https://flagcdn.com/h24/gb-sct.png",
  "wales":    "https://flagcdn.com/h24/gb-wls.png",
};

// FIFA code → flagcdn code map for the same overrides
const FIFA_CODE_OVERRIDES: Record<string, string> = {
  "ENG": "https://flagcdn.com/h24/gb-eng.png",
  "SCO": "https://flagcdn.com/h24/gb-sct.png",
  "WAL": "https://flagcdn.com/h24/gb-wls.png",
};

export function getFlagImageUrl(slug: string | null | undefined): string | null {
  if (!slug) return null;
  return FLAG_IMAGE_OVERRIDES[slug.toLowerCase()] ?? null;
}

export function getFlagImageUrlByCode(fifaCode: string | null | undefined): string | null {
  if (!fifaCode) return null;
  return FIFA_CODE_OVERRIDES[fifaCode.toUpperCase()] ?? null;
}

export function needsFlagImageOverride(slug: string | null | undefined): boolean {
  return !!getFlagImageUrl(slug);
}
```

### B2 — Create a reusable `<CountryFlag>` component

Create **`components/ui/CountryFlag.tsx`**:

```tsx
import Image from "next/image";
import { getFlagImageUrl } from "@/lib/utils/flagImage";
import { CountrySummary } from "@/lib/types";

interface Props {
  country: CountrySummary | null | undefined;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: { text: "text-base",  img: 20 },
  md: { text: "text-2xl",   img: 28 },
  lg: { text: "text-5xl",   img: 48 },
};

export function CountryFlag({ country, size = "md", className = "" }: Props) {
  if (!country) return <span className={`${sizes[size].text} ${className}`}>🏁</span>;

  const imageUrl = getFlagImageUrl(country.slug);
  const s = sizes[size];

  if (imageUrl) {
    return (
      <Image
        src={imageUrl}
        alt={`${country.name} flag`}
        width={s.img}
        height={Math.round(s.img * 0.67)}
        className={`inline-block rounded-sm object-cover shadow-sm ${className}`}
        unoptimized
      />
    );
  }

  // Normal emoji flag or FIFA code fallback
  const useCode = country.flagEmoji.length > 4 || country.flagEmoji.includes(" ");
  if (useCode) {
    return (
      <span className={`inline-flex items-center justify-center rounded bg-[#eef4ff] px-1 text-[10px] font-black tracking-[0.1em] text-[#0a1628] ${className}`}>
        {country.fifaCode}
      </span>
    );
  }

  return <span className={`${s.text} leading-none ${className}`}>{country.flagEmoji}</span>;
}
```

### B3 — Use `<CountryFlag>` in MatchCard

**File:** `components/matches/MatchCard.tsx`

Replace raw `{home?.flagEmoji ?? "🏁"}` / `{away?.flagEmoji ?? "🏁"}` with `<CountryFlag country={home} size="md" />` and `<CountryFlag country={away} size="md" />`.

Import `CountryFlag` from `@/components/ui/CountryFlag`.

### B4 — Use `<CountryFlag>` in MapResultsPanel and VenuePreviewCard

**Files:** `components/map/MapResultsPanel.tsx`, `components/map/VenuePreviewCard.tsx`

Replace the flag circle `div` (the one with `renderCountryChip`) with `<CountryFlag>`:

```tsx
// In MapResultsPanel, the flag avatar:
<div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f8fbff] shadow-[0_1px_3px_rgba(10,22,40,0.12)]">
  <CountryFlag country={countryLookup.get(venue.likelySupporterCountry ?? "") ?? null} size="sm" />
</div>
```

Build a `countryLookup` map at the top of the component (same as MapPageClient):
```tsx
const countryLookup = useMemo(
  () => new Map(countries.map((c) => [c.slug, c])),
  [countries]
);
```

### B5 — Use `<CountryFlag>` in country page hero and FlagFilterBar cards

**File:** `app/country/[slug]/page.tsx` — the `{data.country.flagEmoji}` hero element:
```tsx
// Before:
<div className="text-6xl">{data.country.flagEmoji}</div>
// After:
<CountryFlag country={data.country} size="lg" />
```

**File:** `components/map/FlagFilterBar.tsx` — the flag inside each country grid card:
```tsx
// Replace the renderCountryFlag call with:
<CountryFlag country={country} size="sm" />
```

### B6 — Add flagcdn.com to next.config.mjs allowed image domains

**File:** `next.config.mjs`

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "flagcdn.com" },
      // ... any existing entries
    ],
  },
};
export default nextConfig;
```

---

## SECTION C — Dark / light mode toggle (~30 min)

### C1 — Enable Tailwind dark mode

**File:** `tailwind.config.ts`

Add `darkMode: "class"` to the config:

```ts
const config: Config = {
  darkMode: "class",
  content: [...],
  theme: { ... },
  plugins: []
};
```

### C2 — Add dark mode CSS variables

**File:** `app/globals.css`

Add a `.dark` class block that overrides all surface colours. Insert after the `:root` block:

```css
.dark {
  color-scheme: dark;
  --color-bg:        #0d1117;
  --color-surface:   #161b22;
  --color-surface-2: #1c2330;
  --color-border:    rgba(255,255,255,0.08);
  --color-ink:       #e6edf3;
  --color-muted:     rgba(230,237,243,0.55);
  --color-subtle:    rgba(230,237,243,0.25);
}

.dark body {
  background: linear-gradient(180deg, #0d1117 0%, #111827 100%);
  color: #e6edf3;
}

.dark .surface {
  background: #161b22;
  border-color: rgba(255,255,255,0.08);
}

.dark .surface-strong {
  background: #1c2330;
  border-color: rgba(255,255,255,0.08);
}

.dark .leaflet-container {
  background: #1c2330;
  filter: invert(92%) hue-rotate(180deg) brightness(0.85) saturate(0.9);
}

.dark .leaflet-popup-content-wrapper {
  background: #161b22 !important;
  border-color: rgba(255,255,255,0.1) !important;
  color: #e6edf3 !important;
}

.dark .leaflet-popup-tip {
  background: #161b22 !important;
}
```

> The `filter: invert(92%) hue-rotate(180deg)` on `.dark .leaflet-container` is the standard "dark map" trick — it inverts the OpenStreetMap tile colours to produce a dark map without needing a separate tile provider or API key.

### C3 — Create the theme store

Create **`lib/store/theme.ts`**:

```ts
"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "gameday-theme";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
  if (stored === "dark" || stored === "light") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const initial = getInitialTheme();
    setTheme(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);

  function toggle() {
    setTheme((current) => {
      const next: Theme = current === "dark" ? "light" : "dark";
      document.documentElement.classList.toggle("dark", next === "dark");
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }

  return { theme, toggle, isDark: theme === "dark" };
}
```

### C4 — Add theme toggle button to site header

**File:** `components/layout/site-header.tsx`

Import `useTheme` and add the toggle button:

```tsx
import { useTheme } from "@/lib/store/theme";

// Inside SiteHeader():
const { toggle, isDark } = useTheme();

// Add button in the right actions area (between city pill and Submit button):
<button
  type="button"
  onClick={toggle}
  aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#d8e3f5] bg-[#f8fbff] text-[#0a1628] transition hover:bg-[#eef4ff] dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10"
>
  {isDark ? "☀️" : "🌙"}
</button>
```

### C5 — Apply dark mode classes throughout key components

Add `dark:` variants to these key areas. Work file by file:

**`components/layout/site-header.tsx`**
```tsx
// header element:
className="sticky top-0 z-40 border-b border-[#d8e3f5] bg-white/90 backdrop-blur-xl dark:border-white/8 dark:bg-[#0d1117]/90"

// Logo text:
className="text-lg font-semibold tracking-tight text-[#0a1628] dark:text-white"

// Nav links:
className="text-sm text-[#0a1628]/70 transition hover:text-[#0a1628] dark:text-white/60 dark:hover:text-white"

// City pill:
className="... bg-[#f8fbff] text-[#0a1628] ... dark:bg-white/8 dark:text-white dark:border-white/10"
```

**`components/map/MapShell.tsx`** — results panel:
```tsx
// Panel wrapper:
className="... bg-[#f8fbff]/95 ... dark:bg-[#161b22]/95 dark:border-white/8"

// Mobile sheets:
className="... bg-[#f8fbff]/95 ... dark:bg-[#161b22]/95"
```

**`components/map/MapResultsPanel.tsx`** — venue cards:
```tsx
// Card button:
className={`... bg-white ... dark:bg-[#1c2330] dark:border-white/8 ${selected ? "... dark:bg-[#1c2330] dark:border-[#f4b942]" : "..."}`}

// Venue name:
className="font-semibold text-[#0a1628] dark:text-white"

// Neighbourhood:
className="mt-1 text-sm text-[#0a1628]/55 dark:text-white/55"
```

**`app/globals.css`** — add dark body background already done in C2. Also add:
```css
.dark .map-shell-frame {
  background: #0d1117;
}
```

**`components/map/FilterDrawer.tsx`** (if created in the UI sprint):
```tsx
// Drawer panel:
className="... bg-white ... dark:bg-[#161b22] dark:border-white/8 dark:text-white"

// Filter chips (inactive):
className="... border-[#d8e3f5] bg-white text-[#0a1628] ... dark:border-white/10 dark:bg-white/5 dark:text-white"

// Filter chips (active):
className="... bg-[#f4b942] text-[#0a1628] ..." // gold accent stays same in dark mode
```

**`components/matches/MatchCard.tsx`**:
```tsx
// Card article:
className="rounded-2xl border border-[#d8e3f5] bg-white ... dark:border-white/8 dark:bg-[#161b22] dark:text-white"

// Team names:
className="... text-[#0a1628] dark:text-white"

// Date/stadium text:
className="... text-[#0a1628]/60 dark:text-white/55"
```

**`components/home/USAHomepage.tsx`** — overall page:
```tsx
<main className="bg-[#f7fafc] text-[#0a1628] dark:bg-[#0d1117] dark:text-white">
```

> Note: You do NOT need to apply dark variants to every single element — the CSS variables added in C2 handle the `surface` / `surface-strong` utility classes. Focus on any element with a hardcoded `bg-white`, `text-[#0a1628]`, or `border-[#d8e3f5]` that isn't already using those utility classes.

---

## SECTION D — Deploy-readiness audit (~15 min)

### D1 — Confirm .env.example exists and is complete

**File:** `.env.example` (create if missing)

```env
# Mode: "mock" uses seeded demo data, no database required
DATA_PROVIDER=mock
NEXT_PUBLIC_APP_URL=https://your-vercel-domain.vercel.app

# Map
NEXT_PUBLIC_MAP_PROVIDER=osm
NEXT_PUBLIC_MAPBOX_TOKEN=

# Auth (not required in mock mode)
CLERK_SECRET_KEY=
NEXTAUTH_SECRET=

# Database (required only when DATA_PROVIDER=prisma)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/gameday_map?schema=public

# Third-party API stubs (not used in mock mode)
GOOGLE_PLACES_API_KEY=
YELP_API_KEY=
GOOGLE_PLACES_TEXT_SEARCH_URL=https://places.googleapis.com/v1/places:searchText
YELP_API_BASE_URL=https://api.yelp.com/v3
```

### D2 — Ensure flagcdn.com images aren't blocked in production

**File:** `next.config.mjs`

Already handled in B6. Confirm the final `next.config.mjs` has both `images.remotePatterns` and no conflicting settings.

### D3 — Add a `/api/health` route for uptime monitoring

Create **`app/api/health/route.ts`**:
```ts
export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({
    status: "ok",
    provider: process.env.DATA_PROVIDER ?? "mock",
    ts: new Date().toISOString(),
  });
}
```

### D4 — Confirm `npm run build` passes with zero errors

Run `npm run build`. Fix every error. Common pitfalls:
- `useTheme` uses `localStorage` — it's already guarded by `typeof window === "undefined"` check ✓
- `CountryFlag` uses `next/image` with `unoptimized` — make sure `flagcdn.com` is in remotePatterns ✓
- Any new `"use client"` component that accidentally imports server-only code

---

## SECTION E — Navigation & site-wide polish (~10 min)

### E1 — Fix site footer

**File:** `components/layout/site-footer.tsx`

Replace the current bare footer with a fuller one:

```tsx
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[#d8e3f5] bg-white py-10 dark:border-white/8 dark:bg-[#0d1117]">
      <div className="container-shell">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#f4b942] text-sm font-black text-[#0a1628]">
                GM
              </div>
              <span className="font-semibold text-[#0a1628] dark:text-white">GameDay Map</span>
            </div>
            <p className="mt-3 text-sm text-[#0a1628]/60 dark:text-white/55">
              World Cup 2026 fan experience across 17 host cities. Find bars, restaurants, and supporter hubs for all 48 nations.
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-[#0a1628]/70 dark:text-white/60">
            <Link href="/" className="hover:text-[#0a1628] dark:hover:text-white">Home</Link>
            <Link href="/nyc/map" className="hover:text-[#0a1628] dark:hover:text-white">Explore map</Link>
            <Link href="/nyc/matches" className="hover:text-[#0a1628] dark:hover:text-white">Matches</Link>
            <Link href="/submit" className="hover:text-[#0a1628] dark:hover:text-white">Submit a venue</Link>
            <Link href="/about" className="hover:text-[#0a1628] dark:hover:text-white">About</Link>
          </nav>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[#eef4ff] pt-6 text-xs text-[#0a1628]/40 dark:border-white/6 dark:text-white/30">
          <span>© 2026 GameDay Map. Built for discovery, not scraping.</span>
          <span>Data: demo/mock · Provider: {process.env.DATA_PROVIDER ?? "mock"} mode</span>
        </div>
      </div>
    </footer>
  );
}
```

Note: `process.env.DATA_PROVIDER` is a server value — if this is a client component, remove that line or use a `NEXT_PUBLIC_` variable. Check if `site-footer.tsx` has `"use client"` — if it does, remove the `process.env` reference and just say "mock mode".

### E2 — Add `not-found.tsx` polish

**File:** `app/not-found.tsx` — read it. If it's a bare placeholder, replace:

```tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="container-shell flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <div className="text-6xl">🏟️</div>
      <h1 className="mt-6 text-4xl font-semibold text-[#0a1628] dark:text-white">Page not found</h1>
      <p className="mt-3 max-w-sm text-sm text-[#0a1628]/55 dark:text-white/55">
        This page doesn't exist or was moved. Head back to find your watch spot.
      </p>
      <Link href="/" className="mt-6 rounded-full bg-[#f4b942] px-5 py-2.5 text-sm font-semibold text-[#0a1628]">
        Back to home
      </Link>
    </main>
  );
}
```

### E3 — City landing page (`/[city]`) is a blank stub

**File:** `app/[city]/page.tsx`

Currently shows just a surface card with the city name. Redirect it to the city map:

```tsx
import { redirect } from "next/navigation";

export default function CityLandingPage({ params }: { params: { city: string } }) {
  redirect(`/${params.city}/map`);
}
```

---

## SECTION F — Final TypeScript and build verification

1. Run `npx tsc --noEmit` — fix every error.
2. Run `npm run build` — fix every error.
3. Run `npm run dev` and manually verify:
   - `/` — homepage loads in light mode, toggle button in header switches to dark (dark navy background, white text, dark map)
   - `/nyc/map` — map fills viewport, filter drawer works, England/Scotland show flag images not broken emojis
   - `/nyc/matches` — match cards visible with correct colours, "Today"/"Tomorrow" badges are legible, "Watch Locally" tab shows appropriate content or empty state
   - `/about` — no trailing period on H1 ✓
   - `/venue/[slug]` — venue page loads, no dead links, Borough label correct

---

## Files changed in this sprint (summary)

| File | What changes |
|------|-------------|
| `lib/utils/flagImage.ts` | NEW — flag image URL helpers |
| `components/ui/CountryFlag.tsx` | NEW — reusable flag component with image fallback |
| `lib/store/theme.ts` | NEW — theme toggle hook |
| `next.config.mjs` | Add flagcdn.com to image remotePatterns |
| `tailwind.config.ts` | Add `darkMode: "class"` |
| `app/globals.css` | Add `.dark` CSS variables + dark map filter |
| `components/layout/site-header.tsx` | Dark mode classes + theme toggle button |
| `components/layout/site-footer.tsx` | Full footer replacement + dark mode |
| `components/matches/MatchCard.tsx` | Badge colours fix + CountryFlag |
| `components/matches/MatchesPageClient.tsx` | "Watch Locally" tab logic fix |
| `components/matches/WatchSpotsDrawer.tsx` | Scroll fix + desktop top position |
| `components/map/MapResultsPanel.tsx` | Dark mode classes + CountryFlag |
| `components/map/VenuePreviewCard.tsx` | CountryFlag |
| `components/map/FilterDrawer.tsx` | Dark mode classes |
| `components/map/MapShell.tsx` | Dark mode classes |
| `components/home/USAHomepage.tsx` | Dark mode bg |
| `app/country/[slug]/page.tsx` | CountryFlag in hero |
| `components/map/FlagFilterBar.tsx` | CountryFlag in grid |
| `app/[city]/page.tsx` | Redirect to /{city}/map |
| `app/not-found.tsx` | Polished 404 page |
| `app/api/health/route.ts` | NEW — health endpoint |
| `.env.example` | Complete env template |

---

---

## SECTION G — IP-based city detection (replace browser geolocation) (~20 min)

**The problem:** `useUserCity` calls `navigator.geolocation.getCurrentPosition()` — a browser GPS API that requires the user to click "Allow", often shows the wrong city on laptops (WiFi triangulation), and defaults to whatever city the device thinks it is (e.g. Philadelphia when the network routes through a Philadelphia ISP node). The user should never see a permission prompt and the city should just be correct from their IP.

**The fix:** Create a server-side API route that reads Vercel's automatic IP geo headers and returns the nearest host city. The client calls this once on load — no permission needed, no API key, works on Vercel automatically.

### G1 — Create `/api/detect-city` route

Create **`app/api/detect-city/route.ts`**:

```ts
import { NextRequest, NextResponse } from "next/server";
import { HOST_CITIES } from "@/lib/data/hostCities";

export const dynamic = "force-dynamic";

function toRadians(deg: number) {
  return (deg * Math.PI) / 180;
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getNearestCity(lat: number, lng: number) {
  return HOST_CITIES.reduce<{ city: typeof HOST_CITIES[number]; distance: number } | null>(
    (closest, city) => {
      const dist = haversineDistance(lat, lng, city.lat, city.lng);
      return !closest || dist < closest.distance ? { city, distance: dist } : closest;
    },
    null
  )?.city ?? null;
}

export async function GET(request: NextRequest) {
  // Vercel sets these headers automatically on all edge/serverless requests.
  // They reflect the visitor's IP geolocation — no API key or permission needed.
  const latHeader = request.headers.get("x-vercel-ip-latitude");
  const lngHeader = request.headers.get("x-vercel-ip-longitude");

  if (latHeader && lngHeader) {
    const lat = parseFloat(latHeader);
    const lng = parseFloat(lngHeader);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      const nearest = getNearestCity(lat, lng);
      return NextResponse.json({
        cityKey: nearest?.key ?? "nyc",
        cityLabel: nearest?.label ?? "New York",
        lat,
        lng,
        source: "vercel-ip",
      });
    }
  }

  // Fallback for local dev (Vercel headers won't be present on localhost).
  // Try ipapi.co — free, no key needed, 1000 req/day limit.
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const url = ip && ip !== "::1" && ip !== "127.0.0.1"
      ? `https://ipapi.co/${ip}/json/`
      : `https://ipapi.co/json/`;

    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json();
      const lat = parseFloat(data.latitude);
      const lng = parseFloat(data.longitude);
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        const nearest = getNearestCity(lat, lng);
        return NextResponse.json({
          cityKey: nearest?.key ?? "nyc",
          cityLabel: nearest?.label ?? "New York",
          lat,
          lng,
          source: "ipapi-fallback",
        });
      }
    }
  } catch {
    // silently fall through
  }

  // Final fallback — default to NYC (the only fully seeded city).
  return NextResponse.json({ cityKey: "nyc", cityLabel: "New York", source: "default" });
}
```

### G2 — Update `useUserCity` to call the API instead of browser geolocation

**File:** `lib/hooks/useUserCity.ts`

Replace the entire hook with this version. Key changes: removes `navigator.geolocation`, calls `/api/detect-city` instead, still respects a manually stored city in localStorage:

```ts
"use client";

import { useEffect, useMemo, useState } from "react";
import { getHostCity, HOST_CITIES } from "@/lib/data/hostCities";

const STORAGE_KEY = "userCity";

export function useUserCity() {
  const [userCity, setUserCityState] = useState<string | null>(null);
  const [hasChosenCity, setHasChosenCity] = useState(false);
  const [suggestedCity, setSuggestedCity] = useState<string | null>(null);
  const [geolocationAttempted, setGeolocationAttempted] = useState(false);

  useEffect(() => {
    // 1. If the user previously picked a city manually, use it.
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setUserCityState(stored);
      setHasChosenCity(true);
      setGeolocationAttempted(true);
      return;
    }

    // 2. Otherwise, ask our server-side route (uses Vercel IP geo, no permission prompt).
    fetch("/api/detect-city")
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data?.cityKey) {
          setSuggestedCity(data.cityKey);
        }
      })
      .catch(() => {
        // Silently ignore — user can pick city manually.
      })
      .finally(() => {
        setGeolocationAttempted(true);
      });
  }, []);

  const currentCity = useMemo(() => {
    if (userCity) return getHostCity(userCity)?.key ?? userCity;
    return null;
  }, [userCity]);

  function setUserCity(cityKey: string) {
    window.localStorage.setItem(STORAGE_KEY, cityKey);
    setUserCityState(cityKey);
    setHasChosenCity(true);
  }

  return {
    userCity: currentCity,
    hasChosenCity,
    suggestedCity,
    geolocationAttempted,
    setUserCity,
  };
}
```

### G3 — Update `HomeHeroActions` message copy

**File:** `components/home/HomeHeroActions.tsx`

The fallback message currently says "Allow location access so we can open your nearest host city automatically." — remove that since we no longer ask for permission. Replace with:

```tsx
const locationMessage = userCity
  ? `Showing spots in ${activeCity?.label ?? "your city"}`
  : suggestedCity
    ? `Nearest host city: ${activeCity?.label ?? "your city"}`
    : geolocationAttempted
      ? "We couldn't detect your city. You can still pick one manually."
      : "Finding your nearest host city…";
```

### G4 — Clear any stale Philadelphia (or wrong city) from localStorage

**Important note for testing:** If you've previously clicked Philadelphia in the city picker during development, `localStorage` will have `userCity = "philadelphia"` which overrides everything. The fix is already in the code (step 1 of the hook respects stored choice). To test IP detection: open an incognito window OR run `localStorage.removeItem("userCity")` in DevTools console, then refresh.

No code change needed — just document this in a comment in the hook:
```ts
// NOTE: To test IP detection locally, run:
//   localStorage.removeItem("userCity")
// in your browser console, then refresh.
```

---

## SECTION H — Dark mode: comprehensive text & colour fix (~25 min)

**The problem:** Section C applied dark variants to a handful of components, but the app has hardcoded `text-[#0a1628]`, `bg-white`, and `border-[#d8e3f5]` on hundreds of elements. Adding `dark:` variants to every line is error-prone and bloated.

**The proper fix:** Use CSS custom properties (`var(--color-ink)` etc.) defined in `:root` and `.dark` so that a single definition cascades everywhere — no per-element dark variants needed on text and border.

### H1 — Expand CSS variables in globals.css

**File:** `app/globals.css`

Replace the existing `:root` and `.dark` blocks with this comprehensive set:

```css
:root {
  color-scheme: light;

  /* Core palette tokens — use these everywhere instead of hardcoded hex */
  --ink:        #0a1628;
  --ink-55:     rgba(10, 22, 40, 0.55);
  --ink-45:     rgba(10, 22, 40, 0.45);
  --ink-40:     rgba(10, 22, 40, 0.40);
  --ink-30:     rgba(10, 22, 40, 0.30);

  --surface:    #ffffff;
  --surface-2:  #f4f8ff;
  --surface-3:  #eef4ff;
  --bg:         #f7fafc;

  --border:     #d8e3f5;
  --border-2:   rgba(10, 22, 40, 0.12);

  --gold:       #f4b942;
  --red:        #e63946;
}

.dark {
  color-scheme: dark;

  --ink:        #e6edf3;
  --ink-55:     rgba(230, 237, 243, 0.60);
  --ink-45:     rgba(230, 237, 243, 0.50);
  --ink-40:     rgba(230, 237, 243, 0.45);
  --ink-30:     rgba(230, 237, 243, 0.35);

  --surface:    #161b22;
  --surface-2:  #1c2330;
  --surface-3:  #1a2332;
  --bg:         #0d1117;

  --border:     rgba(255, 255, 255, 0.10);
  --border-2:   rgba(255, 255, 255, 0.07);

  --gold:       #f4b942;   /* gold stays the same — it's the brand accent */
  --red:        #e63946;
}

/* Apply the tokens to the body */
body {
  background-color: var(--bg);
  color: var(--ink);
  -webkit-font-smoothing: antialiased;
}

.dark body {
  background: linear-gradient(180deg, #0d1117 0%, #111827 100%);
}
```

### H2 — Add Tailwind utility shims for the CSS variables

**File:** `tailwind.config.ts`

Extend the theme with CSS variable references so you can write `text-ink`, `bg-surface`, `border-border` in Tailwind classes and they automatically switch in dark mode:

```ts
theme: {
  extend: {
    colors: {
      // CSS variable tokens (auto-switch light/dark via :root / .dark)
      ink:       "var(--ink)",
      "ink-55":  "var(--ink-55)",
      "ink-45":  "var(--ink-45)",
      surface:   "var(--surface)",
      "surface-2": "var(--surface-2)",
      "surface-3": "var(--surface-3)",
      bg:        "var(--bg)",
      border:    "var(--border)",
      gold:      "var(--gold)",

      // Keep existing aliases
      field: "#f7fafc",
      accent: "#f4b942",
      navy: "#0a1628",
      deep: "#0a1628",
      sky: "#eef4ff",
      mist: "rgba(10,22,40,0.55)",
      line: "rgba(10,22,40,0.12)"
    },
    ...
  }
}
```

### H3 — Global element rules that cascade without per-component changes

Add these rules to `globals.css` — they cover the most common elements without needing to touch every component file:

```css
/* Cards and panels — anything with white bg should use var(--surface) */
.dark [class*="bg-white"] {
  background-color: var(--surface) !important;
}

/* Any sticky/header bars with bg-white/90 or bg-white/95 */
.dark [class*="bg-white/"] {
  background-color: color-mix(in srgb, var(--surface) 95%, transparent) !important;
}

/* All border-[#d8e3f5] elements */
.dark [class*="border-\\[\\#d8e3f5\\]"],
.dark [class*="border-\\[\\#d7e4f8\\]"],
.dark [class*="border-\\[\\#eef4ff\\]"] {
  border-color: var(--border) !important;
}

/* Body text — hardcoded #0a1628 */
.dark [class*="text-\\[\\#0a1628\\]"] {
  color: var(--ink) !important;
}

/* Muted text — text-[#0a1628]/55, /45, /40 etc */
.dark [class*="text-\\[\\#0a1628\\]/"] {
  color: var(--ink-55) !important;
}

/* Background blues */
.dark [class*="bg-\\[\\#f4f8ff\\]"],
.dark [class*="bg-\\[\\#f8fbff\\]"],
.dark [class*="bg-\\[\\#eef4ff\\]"],
.dark [class*="bg-\\[\\#f7fafc\\]"] {
  background-color: var(--surface-2) !important;
}

/* Leaflet map dark inversion */
.dark .leaflet-container {
  filter: invert(92%) hue-rotate(180deg) brightness(0.82) saturate(0.85);
}

/* Leaflet popup */
.dark .leaflet-popup-content-wrapper {
  background: var(--surface) !important;
  border-color: var(--border) !important;
  color: var(--ink) !important;
}
.dark .leaflet-popup-tip {
  background: var(--surface) !important;
}
.dark .leaflet-control-zoom a {
  background: var(--surface) !important;
  color: var(--ink) !important;
  border-color: var(--border) !important;
}
```

> **Why this approach:** CSS attribute selectors like `[class*="bg-white"]` catch every element that uses those Tailwind classes without needing to edit each file. This is not ideal for large production apps but is the pragmatic solution for a codebase with hundreds of hardcoded colour values. The `!important` overrides only apply inside `.dark` so they don't affect light mode at all.

### H4 — Manual dark overrides for components the CSS selectors can't reach

These elements use inline styles or dynamic class construction that the CSS selectors above won't catch. Fix them explicitly:

**`components/map/MapShell.tsx`** — results panel and mobile sheets. These use `bg-[#f8fbff]/95` which is a background-with-opacity class the selector may miss. Add explicit dark variants:

```tsx
// Desktop results panel wrapper:
"... bg-[#f8fbff]/95 backdrop-blur-md dark:bg-[#161b22]/95 dark:border-white/10 ..."

// Mobile filter sheet:
"... bg-[#f8fbff]/95 ... dark:bg-[#161b22]/95 ..."

// Mobile results sheet:  
"... bg-[#f8fbff]/95 ... dark:bg-[#161b22]/95 ..."

// Results panel header text:
"text-xs uppercase tracking-[0.22em] text-[#0a1628]/45 dark:text-white/45"
"text-sm font-semibold text-[#0a1628] dark:text-white"
```

**`components/map/MatchdayBanner.tsx`** — the red banner is fine in dark mode (it has its own `bg-red-600` background). No change needed.

**`components/layout/site-header.tsx`** — the city switcher dropdown appears over the map and needs dark treatment:
```tsx
// Dropdown panel:
"... rounded-[1.5rem] border border-[#d8e3f5] bg-white shadow-2xl dark:bg-[#161b22] dark:border-white/10"

// City button (inactive):
"border-[#d8e3f5] bg-white text-[#0a1628] hover:bg-[#f8fbff] dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"

// City button (active):
"border-[#f4b942] bg-[#f4b942] text-[#0a1628]" // gold — fine in dark mode, no change
```

**`components/map/FlagFilterBar.tsx`** — country grid cards (inside FilterDrawer):
```tsx
// Card inactive:
"border-[#e8eef8] bg-white hover:bg-[#f4f8ff] dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"

// Country name text:
"text-[10px] font-semibold text-[#0a1628] dark:text-white"

// Search input:
"border-[#d8e3f5] bg-white text-[#0a1628] dark:border-white/10 dark:bg-white/8 dark:text-white dark:placeholder:text-white/30"
```

**`components/matches/MatchCard.tsx`** — article card:
```tsx
"rounded-2xl border border-[#d8e3f5] bg-white ... dark:border-white/10 dark:bg-[#161b22]"
// All text-[#0a1628] → add dark:text-white
// All text-[#0a1628]/60 → add dark:text-white/55
```

**`components/venue/venue-card.tsx`** — stats grid:
```tsx
// The inner stats grid:
"... border border-line bg-white/80 ... dark:border-white/10 dark:bg-white/5"
// Label text (text-mist, text-navy) — these use the Tailwind aliases which resolve
// to #0a1628 values. Add:
// text-mist → dark:text-white/55
// text-navy → dark:text-white
// text-deep → dark:text-white
```

**`app/about/page.tsx`**, **`app/submit/page.tsx`**, **`app/admin/page.tsx`** — these use `text-deep`, `text-navy`, `text-mist` Tailwind aliases. Add to `tailwind.config.ts` dark mode versions using CSS variables:
Since these are semantic aliases, update the Tailwind config so `text-deep` resolves to `var(--ink)` instead of hardcoded `#0a1628`:
```ts
colors: {
  deep:  "var(--ink)",       // was "#0a1628"
  navy:  "var(--ink)",       // was "#0a1628"
  mist:  "var(--ink-55)",    // was "rgba(10,22,40,0.55)"
  line:  "var(--border-2)",  // was "rgba(10,22,40,0.12)"
  sky:   "var(--surface-3)", // was "#eef4ff"
  // Keep other colours as-is
}
```

> This single change in `tailwind.config.ts` makes every element that uses `text-deep`, `text-navy`, `text-mist`, `bg-sky`, `border-line` automatically switch to dark values — covering the About, Submit, Admin, Country, and Venue detail pages in one shot.

### H5 — Verify dark mode visually

After all changes, run `npm run dev` and toggle dark mode on these pages:
- `/` — background should be near-black (`#0d1117`), all text white/light, city cards should have dark surfaces
- `/nyc/map` — map inverted to dark tiles, filter drawer dark, results panel dark, all text readable (white/light)
- `/nyc/matches` — match cards dark with white text, gold buttons unchanged
- `/venue/[some-slug]` — all sections readable in dark
- `/about` — body text white, no dark text on dark background

Acceptance: **No dark-background + dark-text combinations visible anywhere.**

---

## Updated files summary (Sections G + H additions)

| File | What changes |
|------|-------------|
| `app/api/detect-city/route.ts` | NEW — IP geo city detection using Vercel headers + ipapi.co fallback |
| `lib/hooks/useUserCity.ts` | Replace `navigator.geolocation` with `/api/detect-city` fetch |
| `components/home/HomeHeroActions.tsx` | Update location message copy (no "allow permission" text) |
| `app/globals.css` | Full CSS variable system for light/dark + global dark selectors |
| `tailwind.config.ts` | Remap `deep`/`navy`/`mist`/`sky`/`line` to CSS variables; add `ink`/`surface`/`bg`/`border` tokens |
| `components/map/MapShell.tsx` | Explicit dark variants on opacity-background elements |
| `components/layout/site-header.tsx` | Dark variants on city dropdown panel |
| `components/map/FlagFilterBar.tsx` | Dark variants on country grid cards and search input |
| `components/matches/MatchCard.tsx` | Dark variants on card + all text |
| `components/venue/venue-card.tsx` | Dark variants on stats grid |

---

## When you're done

Report back with:
1. All files changed
2. `npx tsc --noEmit` output
3. Last 20 lines of `npm run build`
4. Describe: open an incognito tab at `/`, which city is suggested? (Should reflect IP, not Philadelphia)
5. Describe: dark mode toggled on at `/nyc/map` and `/nyc/matches` — is all text readable?
6. Describe: England and Scotland flags — images showing correctly?
7. Any sections skipped and why

Do NOT commit — just report back.
