# /today — Matchday Promo Page (Codex Brief)

Build a new page at `/today` (route file: `app/today/page.tsx`) that
doubles as a marketing landing page AND a functional matchday utility. The
deep NYC scrape is done; this page consumes the new venue data. Read the
existing UX brief `CODEX_BRIEF.md` for the operating principles — this page
applies all of them.

## URL contract

- `/today` — defaults to `?mode=all`
- `/today?mode=bar` — only shows bars + sports bars
- `/today?mode=restaurant` — only shows cultural restaurants
- `/today?match=<matchId>` — pre-selects a match, filters venues to its
  two countries
- `/today?city=<cityKey>` — overrides the auto-detected/saved city

## Page sections (top → bottom)

### 1. Hero
- Eyebrow: "WATCHING TODAY"
- Headline: dynamic. "3 matches today in New York" or "Next matches Saturday".
- Subhead: max 80 chars.
- Primary CTA: "Find your spot →" scrolls to venue list.
- Live counters: "X venues · Y reservations open · Z hosting tonight" —
  all computed.

### 2. Mode toggle
- Three pills full-width on mobile, centered desktop: `All` `Bars`
  `Restaurants`. Active = gold; inactive = outlined.
- Each shows count: `Bars (147)`, `Restaurants (89)`, `All (236)`.
- Updates `?mode=` via `router.replace`; client-side re-filter only.

### 3. Today's matches strip
- Horizontal scroll mobile, `md:grid-cols-2 lg:grid-cols-3` desktop.
- Card: two flags + country names, kickoff time local TZ, stage
  ("Group A · Match 3"), "Tap to find watch spots →".
- Click → updates `?match=id`.
- Active card: gold border accent.

### 4. Venue list
- Section header adapts: "USA-Mexico bars in New York" / "Cultural
  restaurants for today's matches" / "All watch spots in New York today".
- Sort by `gameDayScore` desc, country-match boost.
- Card content: flag + country, name, neighborhood, rating, status,
  badges (Has TV / No TVs, Reservations, Outdoor), distance.
- 12 cards initial, "Show more" reveals 12 each click. After 36, swap for
  "See all on the map →" link.
- Empty state with friendly illustration + `/submit` CTA.

### 5. Trust strip
- One row, three stats: `833 venues mapped` / `48 nations` /
  `17 host cities`. Real data where possible.

### 6. Final CTAs
- `EmailCaptureBanner` (reuse if exists).
- Secondary CTAs: Add a venue, Browse the map, All matches.

## Component structure

New files only (don't modify existing):
- `app/today/page.tsx` — server component. Fetches data, reads searchParams,
  passes to client.
- `components/today/TodayPageClient.tsx` — client component. Owns mode
  toggle state via `useSearchParams` + `useRouter`.
- `components/today/TodayHero.tsx`
- `components/today/MatchStrip.tsx`
- `components/today/ModeToggle.tsx`
- `components/today/TodayVenueGrid.tsx`
- `components/today/TrustStrip.tsx`

## Data layer

Add to `lib/data/repository.ts`:
```ts
getTodayPageData(cityKey: string, mode: "all"|"bar"|"restaurant", matchId?: string)
  → { venues, matches: WorldCupMatch[], todayMatches: WorldCupMatch[] }
```

Filter logic in helper, not components:
- bar: `venueIntent ∈ ["sports_bar","bar_with_tv","cultural_bar"]`
- restaurant: `venueIntent === "cultural_restaurant"`

Today detection: `Date.now()` + Intl TZ. Server fallback to
`America/New_York`. If `matchId` provided, intersect venues whose
`associatedCountries` include either match country slug.

## Visual / a11y

- Use semantic tokens: `bg-bg`, `text-deep`, `text-mist`, `border-line`,
  `text-gold`. No legacy inline `text-[#0a1628]` hex.
- Mobile: 16px side padding, 24px vertical between sections.
- Tap targets ≥44px.
- `prefers-reduced-motion` respected.
- All interactive controls have `aria-label`.

## Hard rules

- DO NOT touch `scripts/seed-places-nyc-deep.ts`,
  `components/map/world-map.tsx`, the `Venue` type, or
  `lib/cache/places/nyc-*.json`.
- DO NOT add new dependencies.
- DO NOT hardcode counts.
- SSR must produce the venue list (SEO / first paint).
- Mode toggle reflows client-side; no network round-trip.

## Acceptance criteria

1. No horizontal scroll at 375px and 1440px on `/today`.
2. `?mode=bar/restaurant/all` correctly filters.
3. Mode pills update URL via `router.replace`, no refetch.
4. Today's matches surface from `worldCup2026Matches`; clicking a match
   filters venues by both countries.
5. If no matches today, "Next matches in N days" headline + next match-day
   strip with "Coming up" badge.
6. All counts computed at runtime.
7. Empty state when filtered list is empty.
8. `tsc --noEmit` 0 errors, `next build` green.
9. Lighthouse mobile: Perf ≥85, A11y ≥90.

## Report back

1. Files created/modified.
2. tsc + build output.
3. Six screenshots: `/today`, `?mode=bar`, `?mode=restaurant` at 375 and 1440.
4. Lighthouse mobile scores.
5. Vercel preview URL.
