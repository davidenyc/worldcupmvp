# Codex UI/UX Sprint — GameDay Map

**Read this entire document before touching any file. Execute every section in order. Do not skip steps.**

This is a focused UI/UX pass to make the app ship-ready. The core product is working — mock data loads, filters run, the Leaflet map renders. What needs fixing is: (1) critical dead-link bugs, (2) the map being squashed by stacked filter bars, (3) the filter/country-picker UX being clunky, and (4) the venue cards and popups being incomplete.

---

## ⚠️ PROOF THIS IS NOT DONE YET — read before claiming completion

A screenshot was taken of `/nyc/map` at the time this brief was written. It shows the following — **if any of these are still true when you run the app, you have NOT completed the sprint**:

1. There is a "HOST CITY / New York / Change city" sticky bar above the map.
2. There is a row of filter pills (Venue type, Country flags, Match, More) above the map.
3. When any filter pill is active, a large panel opens *above* the map, pushing the map down to roughly 20% of viewport height.
4. The country flag picker is a **horizontal scroll row** with truncated names ("Bosnia a...", "Cabo Ve...").
5. The results panel shows "ENG" (a text code) instead of a flag for England-associated venues.
6. All venue type badges say "SHOWING GAMES" with no distinction between watch party and sports bar.

All six of these must be fixed for the sprint to be complete. Do not report back until a browser visit to `/nyc/map` shows: map filling at least 70% of viewport, no stacked filter bars, a ⚙ Filters button at the bottom-left of the map, and a grid-based country picker inside the filter drawer.

---

## Hard rules (do not violate)

- Do NOT modify `components/map/world-map.tsx` NAME_TO_SLUG logic or name-matching.
- Do NOT re-introduce non-NYC service areas.
- Do NOT install `@types/react-simple-maps`.
- Do NOT change any data layer (providers, repository, demo.ts, mock.ts).
- Keep `"use client"` boundaries clean — nothing with Leaflet renders server-side.
- Run `npx tsc --noEmit` after every section and fix any errors before moving on.

---

## SECTION 1 — Critical Bug Fixes (do these first, ~20 min)

### 1A — Dead `tel:` link in VenuePreviewCard

**File:** `components/map/VenuePreviewCard.tsx`

The "Reserve" anchor has `href={venue.reservationUrl ?? \`tel:${venue.reservationPhone ?? ""}\`}`. When both are null this produces `href="tel:"` — a dead link that opens nothing.

Fix: Only render the Reserve anchor if `venue.reservationUrl` or `venue.reservationPhone` is truthy.

```tsx
// Before (broken):
{venue.acceptsReservations && (
  <a href={venue.reservationUrl ?? `tel:${venue.reservationPhone ?? ""}`} ...>

// After (correct):
{venue.acceptsReservations && (venue.reservationUrl || venue.reservationPhone) && (
  <a href={venue.reservationUrl ?? `tel:${venue.reservationPhone!}`} ...>
```

Same fix applies in `components/venue/venue-card.tsx` — the `Reserve` anchor href has the same pattern.

### 1B — Duplicate "Neighborhood" label in venue detail page

**File:** `app/venue/[slug]/page.tsx`

In the "Quick info" aside there are two items both labelled "Neighborhood:" — one shows `venue.neighborhood`, the next shows `venue.borough`. Fix the second one to say "Borough:".

```tsx
// Change:
<div>Neighborhood: {data.venue.borough}</div>
// To:
<div>Borough: {data.venue.borough}</div>
```

### 1C — Hard-coded `/nyc/map` links in venue detail page

**File:** `app/venue/[slug]/page.tsx`

There are anchor tags pointing to `/nyc/map?country=...`. These break for any non-NYC city. The venue detail page doesn't know the city at render time, but it can use a relative-friendly default. Change all `/nyc/map` hrefs to `/nyc/map` only if you cannot determine city from context — OR better: change the match links in the "Upcoming matches to watch here" section to use `href={\`/nyc/map?country=${match.homeCountry}&vsCountry=${match.awayCountry}\`}` (this is acceptable as NYC is the only active city for now), but also add a city-aware comment so it's obvious to fix later. Keep href as-is for now since NYC is the only seeded city, but add `// TODO: make city-aware when multi-city is live` inline.

### 1D — Fix `priceLevel` type gap in mock provider

**File:** `lib/providers/types.ts`

Add `priceLevel?: number` to the `VenueSearchParams` interface. This is a pre-existing TypeScript error the CODEX_BRIEF flagged.

After all four fixes: run `npx tsc --noEmit` and confirm zero errors.

---

## SECTION 2 — Map height & filter layout overhaul (~45 min)

This is the biggest UX problem. The current layout stacks THREE sticky bars above the map:
- City bar (~66px, `sticky top-[73px]`)
- Quick filter bar (~58px, `sticky top-[139px]`)
- Inline filter panels (variable height, `sticky top-[203px]`)

Result: on a laptop the map is squashed to ~300px or invisible behind filters. The map needs to dominate the viewport. Filters should be accessed via a floating button overlay — not stacked above the map.

### 2A — Redesign `MapPageClient.tsx` filter layout

**File:** `components/map/MapPageClient.tsx`

**Remove** the following from the rendered JSX:
- `{cityBar}` — the sticky "Host city / Change city" bar
- `{quickFilterBar}` — the sticky pill buttons (Venue type / Country flags / Match / More)
- `{inlineFilterPanels}` — the sticky collapsible panels

**Replace** with a single floating filter button row rendered inside `MapShell`'s map area. The new layout is:

```
[Full-height map taking calc(100svh - 73px)]
  Floating over the map (z-50):
    Top-left: City pill button
    Top-right: [nothing - results panel already there on desktop]
    Bottom-left: "⚙ Filters" pill button (opens FilterDrawer)
    Bottom-right: "▸ N spots" pill button (opens results sheet on mobile)
```

**Implementation steps:**

1. Add a `filterDrawerOpen` state (boolean, default false) to `MapPageClient`.

2. Create a new local component `FilterDrawer` inside `MapPageClient.tsx` (or a separate file `components/map/FilterDrawer.tsx` — your choice). It renders as a fixed right-side panel on desktop and a bottom sheet on mobile:
   - Desktop: `fixed right-0 top-[73px] bottom-0 z-50 w-80 bg-white/97 backdrop-blur-md border-l border-[#d7e4f8] shadow-2xl overflow-y-auto` — slides in/out with `translate-x-0` / `translate-x-full` transition
   - Mobile: same bottom-sheet pattern already used by MapShell (max-h-[88vh], rounded-t-[1.75rem])
   - Contains all filter controls (previously in the inline panels): venue type chips, FlagFilterBar country picker, match filter, more filters (search input, sort, borough, neighborhood, capacity, reservations, family, outdoor), clear-all button
   - Has a close button (×) at the top right

3. Replace the three stacked sticky bars with a minimal floating overlay band:

```tsx
// Floating overlay — city pill + active-filter count badge
<div className="absolute top-3 left-3 z-50 flex flex-wrap items-center gap-2">
  {/* City switcher pill */}
  <button
    type="button"
    onClick={() => setCitySelectorOpen(c => !c)}
    className="inline-flex items-center gap-2 rounded-full border border-[#d8e3f5] bg-white/95 px-4 py-2 text-sm font-semibold text-[#0a1628] shadow-lg backdrop-blur"
  >
    📍 {selectedCityConfig.label} ▾
  </button>
  {/* Active filter count badge — only show if filters are active */}
  {hasActiveFilters && (
    <span className="inline-flex items-center rounded-full bg-[#f4b942] px-3 py-2 text-xs font-bold text-[#0a1628] shadow-lg">
      {selectedCountrySlugs.length > 0 ? selectedCountrySlugs.map(s => countryLookup.get(s)?.flagEmoji ?? s).join(" ") : ""}
      {hasActiveFilters ? ` · ${filteredVenues.length} spots` : ""}
    </span>
  )}
</div>

{/* City selector dropdown (shown below the pill when open) */}
{citySelectorOpen && (
  <div className="absolute top-14 left-3 z-50 w-[min(92vw,22rem)] overflow-hidden rounded-2xl border border-[#d8e3f5] bg-white shadow-2xl">
    <CitySelector
      selectedCity={city}
      onSelectCity={(nextCity) => {
        setCitySelectorOpen(false);
        handleSelectCity(nextCity);
      }}
    />
  </div>
)}

{/* Bottom-left Filters button */}
<button
  type="button"
  onClick={() => setFilterDrawerOpen(true)}
  className="absolute bottom-16 left-3 z-50 inline-flex items-center gap-2 rounded-full border border-[#d8e3f5] bg-white/95 px-4 py-2.5 text-sm font-semibold text-[#0a1628] shadow-lg backdrop-blur lg:bottom-4"
>
  ⚙ Filters{hasActiveFilters ? ` · ${activeFilterCount}` : ""}
</button>
```

Where `activeFilterCount` is a computed number counting how many distinct filter categories are active (count selectedCountrySlugs.length > 0 as 1, soccerBarsMode as 1, hasCustomVenueIntentSelection as 1, venueType/borough/neighborhood/etc. each as 1).

4. Wire `FilterDrawer` to receive all the filter state + setters it needs and render it conditionally based on `filterDrawerOpen`.

5. Update `.map-shell-frame` height in `app/globals.css`:
```css
.map-shell-frame {
  height: calc(100svh - 73px); /* was 120px — now just below the fixed header */
}
```

6. The MapShell desktop results panel is `fixed right-4 top-[11.25rem]`. Update it to `top-[81px]` (just below the 73px header + 8px gap) since the stacked bars are gone. Also change `bottom-4` to `bottom-4` (keep). In `components/map/MapShell.tsx`:
```tsx
// Change:
className={`pointer-events-none fixed right-4 top-[11.25rem] bottom-4 z-40 ...`}
// To:
className={`pointer-events-none fixed right-4 top-[81px] bottom-4 z-40 ...`}
```

But! When FilterDrawer is open on desktop, the results panel and filter drawer overlap. Handle this by shifting the results panel left when `filterDrawerOpen` is true, OR just let them both be visible (drawer is on the right edge, results panel is also on the right but narrower — just keep results panel and filter drawer side by side). Actually the simplest approach: on desktop, when `filterDrawerOpen` is true, offset the results panel by `right-[21rem]` instead of `right-4`. Pass `filterDrawerOpen` as a prop to `MapShell` and apply the offset class conditionally.

Updated MapShell signature: add `filterDrawerOpen?: boolean` prop. Apply class: 
```
right-4 lg:right-4 → when filterDrawerOpen: right-4 lg:right-[21rem]
```

---

## SECTION 3 — FlagFilterBar country grid UX (~30 min)

**File:** `components/map/FlagFilterBar.tsx`

The current country picker is a horizontal scroll of cards — it's hard to browse 48 countries. Redesign it as a **searchable flag grid** inside the FilterDrawer.

Changes:
1. Remove the horizontal scroll `div` with `overflow-x-auto` and replace with a CSS grid:
```tsx
<div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
  {visible.map((country) => (
    <button
      key={country.slug}
      type="button"
      onClick={() => onToggleCountry(country.slug)}
      className={`flex flex-col items-center rounded-xl border px-2 py-2.5 text-center transition ${
        active ? "border-[#f4b942] bg-[#fff8e7] shadow-md" : "border-[#e8eef8] bg-white hover:bg-[#f4f8ff]"
      }`}
    >
      <div className="text-2xl leading-none">{renderCountryFlag(country)}</div>
      <div className="mt-1 w-full truncate text-[10px] font-semibold text-[#0a1628]">{country.name}</div>
    </button>
  ))}
</div>
```

2. Keep the search input above the grid (already there, works well).

3. Add a "Selected:" summary row above the search when `selectedCountrySlugs.length > 0`:
```tsx
{selectedCountrySlugs.length > 0 && (
  <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-[#f4f8ff] p-2">
    <span className="text-xs font-semibold text-[#0a1628]/55 mr-1">Watching:</span>
    {selectedCountrySlugs.map(slug => {
      const c = countries.find(x => x.slug === slug);
      return c ? (
        <button key={slug} type="button" onClick={() => onToggleCountry(slug)}
          className="inline-flex items-center gap-1 rounded-full bg-[#f4b942] px-2 py-1 text-xs font-bold text-[#0a1628]">
          {c.flagEmoji} {c.name} ×
        </button>
      ) : null;
    })}
  </div>
)}
```

4. In `compact` mode (used inside the old inline filter panel): since we're removing inline filter panels and moving everything into FilterDrawer, the `compact` mode is no longer needed. But keep the prop so nothing breaks — just ensure `compact={false}` is always passed in the new FilterDrawer.

---

## SECTION 4 — Venue results panel UX (~25 min)

### 4A — Add "View →" link to MapResultsPanel cards

**File:** `components/map/MapResultsPanel.tsx`

Each result card is a `<button>` that selects the venue and flies the map to it. But there's no way to navigate to the venue detail page from the results list. Add a small "View →" link:

Inside each card's bottom area, after the rating/reservations row, add:
```tsx
<div className="mt-2 flex items-center justify-between">
  <Link
    href={`/venue/${venue.slug}`}
    onClick={(e) => e.stopPropagation()}
    className="text-xs font-semibold text-[#0a1628]/60 hover:text-[#0a1628] underline underline-offset-2"
  >
    View details →
  </Link>
</div>
```

Import `Link` from `next/link` at the top of the file.

### 4B — Results panel header shows count and clear button

**File:** `components/map/MapShell.tsx`

In the desktop results panel header, next to the "Hide" button, add a "Clear filters" button that only appears when there are active filters. MapShell needs a new optional prop `onClearFilters?: () => void` and `hasActiveFilters?: boolean`. Pass these from `MapPageClient.tsx`.

```tsx
{hasActiveFilters && onClearFilters && (
  <button type="button" onClick={onClearFilters}
    className="rounded-full border border-[#d8e3f5] bg-[#f8fbff] px-3 py-1.5 text-xs font-semibold text-[#0a1628] transition hover:bg-[#eef4ff]">
    Clear
  </button>
)}
```

### 4C — "Show all" label improvement

**File:** `components/map/MapPageClient.tsx`

The floating "Top 20 spots" button at bottom of map is good. Improve the label slightly:
```tsx
// Change the label to:
`Top 20 spots · Tap to see all ${filteredVenues.length}`
// When showAllVenues is true and all venues are displayed:
`All ${filteredVenues.length} spots in ${selectedCityConfig.label}`
```

---

## SECTION 5 — VenuePreviewCard map popup polish (~20 min)

**File:** `components/map/VenuePreviewCard.tsx`

The popup is a bit cramped and the rating is missing. Improve it:

1. Add rating display:
```tsx
import { Star } from "lucide-react";
// In the card body, add after the neighborhood line:
<div className="flex items-center gap-1 text-sm text-[#0a1628]/65">
  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
  <span>{Number(venue.rating ?? 0).toFixed(1)}</span>
  {venue.reviewCount ? <span className="text-xs text-[#0a1628]/40">({venue.reviewCount.toLocaleString()})</span> : null}
  <span className="mx-2 text-[#0a1628]/20">·</span>
  <span className="text-xs text-[#0a1628]/55">{venue.borough}</span>
</div>
```

2. The "View details →" Link should use `rounded-full` styling to match the rest of the design. Change from `rounded-md` to `rounded-full`:
```tsx
// Change:
className="rounded-md bg-[#f4b942] px-3 py-1.5 text-xs ..."
// To:
className="rounded-full bg-[#f4b942] px-3 py-1.5 text-xs ..."
```

3. Set a max-width on the popup wrapper so it doesn't overflow on mobile: change `min-w-[230px]` to `w-[min(260px,82vw)]`.

4. The popup close behavior: the `closeButton={false}` on `<Popup>` means users can only close by clicking elsewhere. Add a small manual close X in the VenuePreviewCard itself. Since VenuePreviewCard doesn't have access to the Leaflet map, the simplest approach is to remove `closeButton={false}` and instead style the default close button in globals.css:
```css
.leaflet-popup-close-button {
  color: rgba(10, 22, 40, 0.45) !important;
  padding: 8px 10px !important;
  font-size: 16px !important;
  top: 4px !important;
  right: 4px !important;
}
```

---

## SECTION 6 — Country filter: simple tab/chip bar for quick 1-click country selection (~20 min)

**File:** `components/map/MapPageClient.tsx` (FilterDrawer section)

Inside the FilterDrawer, above the full FlagFilterBar grid, add a "Quick pick" row showing the top 8 most-represented countries (sorted by number of associated venues). This gives users a fast one-click path without scrolling the grid.

```tsx
// Compute top countries by venue count:
const topCountries = useMemo(() => {
  const counts = new Map<string, number>();
  data.venues.forEach(v => {
    v.associatedCountries.forEach(slug => {
      counts.set(slug, (counts.get(slug) ?? 0) + 1);
    });
  });
  return data.countries
    .filter(c => counts.has(c.slug))
    .sort((a, b) => (counts.get(b.slug) ?? 0) - (counts.get(a.slug) ?? 0))
    .slice(0, 8);
}, [data.venues, data.countries]);
```

Then render above the FlagFilterBar:
```tsx
<div>
  <div className="text-xs uppercase tracking-[0.18em] text-[#0a1628]/45 mb-2">Popular countries</div>
  <div className="flex flex-wrap gap-2">
    {topCountries.map(country => {
      const active = selectedCountrySlugs.includes(country.slug);
      return (
        <button key={country.slug} type="button"
          onClick={() => handleToggleCountry(country.slug)}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold transition ${
            active ? "bg-[#f4b942] text-[#0a1628]" : "border border-[#e0eaf8] bg-white text-[#0a1628] hover:bg-[#f4f8ff]"
          }`}
        >
          <span>{country.flagEmoji}</span>
          <span>{country.name}</span>
        </button>
      );
    })}
  </div>
</div>
```

---

## SECTION 7 — Mobile UX polish (~15 min)

### 7A — Bottom floating buttons spacing

**File:** `components/map/MapPageClient.tsx` and `components/map/MapShell.tsx`

The MapShell already has mobile Filters and Results buttons at `bottom-4`. With the new layout the Filters button in MapPageClient overlaps with MapShell's own "⚙ Filters" button on mobile.

Decision: Remove the `⚙ Filters` and `▸ Results` buttons from `MapShell` — instead MapPageClient controls both via `filterDrawerOpen` and a new `mobileResultsOpen` state passed to MapShell. 

Add props to MapShell: `onOpenFilters?: () => void` and `onOpenResults?: () => void`. The MapShell renders the floating bottom buttons but calls these callbacks instead of managing its own state. The filter content (desktop side panel + mobile bottom sheet) is then fully owned by FilterDrawer in MapPageClient.

The results bottom sheet can stay in MapShell (it only needs `results` and `resultsCountLabel`), but the trigger button should call `onOpenResults` if provided, else manage its own state.

### 7B — Map touch responsiveness

**File:** `components/map/NYCFlagPinMap.tsx`

Confirm `touchZoom={true}` and `dragging={true}` are set (they already are). Also add:
```tsx
<MapContainer
  ...
  tap={false}  // fixes a Leaflet ghost-click bug on iOS Safari
  zoomControl={false}  // move zoom control to bottom-right to not conflict with our overlays
>
  <ZoomControl position="bottomright" />
```

Import `ZoomControl` from `react-leaflet`.

---

## SECTION 8 — Home page quick wins (~15 min)

**File:** `components/home/USAHomepage.tsx`

### 8A — Fix the city cards link destination

Each city card `<Link href={\`/${city.key}/map\`}>` is correct — leave as is.

### 8B — Add a "Find spots by country" section on homepage

Below the city cards grid, add a simple country quick-pick section that lets users find venues for their national team directly from the homepage:

```tsx
// Add at the bottom of the page, above the closing </main>:
<section className="bg-[#f7fafc] px-4 pb-20 sm:px-6 lg:px-8">
  <div className="mx-auto max-w-7xl">
    <div className="text-sm uppercase tracking-[0.24em] text-[#0a1628]/45">🏳 Find your team's spots</div>
    <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#0a1628] sm:text-4xl">
      Which team are you watching?
    </h2>
    <p className="mt-3 text-sm text-[#0a1628]/55 max-w-xl">
      Tap your country to find every bar and restaurant in NYC catering to your nation's supporters.
    </p>
    <div className="mt-6">
      <HomeCountryPicker />
    </div>
  </div>
</section>
```

Create `components/home/HomeCountryPicker.tsx` as a client component that:
- Loads country list client-side (import from `lib/data/repository` via a fetch or use a static import of the country slugs)
- Actually: since `getAllCountries()` is server-only, the HomeCountryPicker should be a **server component** that receives countries as a prop from `USAHomepage`.

Simplest approach: pass `countries` as a prop from `USAHomepage` (which is already async server component) to a new client component `HomeCountryPicker`:

```tsx
// In USAHomepage.tsx (server):
const allCountries = await getAllCountries(); // already imported
// ... pass to:
<HomeCountryPicker countries={allCountries} />
```

`HomeCountryPicker` renders a horizontal scrollable flag row (similar to FlagFilterBar but simpler — just flags + names, clicking navigates to `/nyc/map?country={slug}`):
```tsx
"use client";
import { useRouter } from "next/navigation";
export function HomeCountryPicker({ countries }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const visible = search ? countries.filter(c => c.name.toLowerCase().includes(search.toLowerCase())) : countries;
  return (
    <div className="space-y-4">
      <input value={search} onChange={e => setSearch(e.target.value)}
        placeholder="Search your country..."
        className="h-11 w-full max-w-sm rounded-full border border-[#d8e3f5] bg-white px-4 text-sm text-[#0a1628] outline-none" />
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
        {visible.map(country => (
          <button key={country.slug} type="button"
            onClick={() => router.push(`/nyc/map?country=${country.slug}`)}
            className="flex flex-col items-center rounded-xl border border-[#e8eef8] bg-white px-2 py-3 text-center transition hover:border-[#f4b942] hover:bg-[#fff8e7]">
            <div className="text-2xl">{country.flagEmoji}</div>
            <div className="mt-1 w-full truncate text-[10px] font-semibold text-[#0a1628]">{country.name}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
```

---

## SECTION 9 — Navigation & dead link audit (~15 min)

Audit every `<a>` and `<Link>` in the following files and fix any that are broken or incomplete:

### 9A — `components/map/VenuePreviewCard.tsx`
- Already fixed in Section 1A (tel: dead link)
- Confirm `href="/venue/${venue.slug}"` works — it does (slug is always set in mock data)

### 9B — `components/venue/venue-card.tsx`
- Already fixed in Section 1A (tel: dead link)
- `href={venue.website}` — only rendered when `venue.website` is truthy ✓
- `href={venue.instagramUrl}` — only rendered when truthy ✓
- `href={venue.reservationUrl ?? tel:...}` — FIXED in 1A ✓

### 9C — `app/venue/[slug]/page.tsx`
- "Reserve a spot" link: `href={data.venue.reservationUrl}` — only rendered when `data.venue.reservationUrl` is truthy ✓
- "Website" link: only rendered when truthy ✓
- "Instagram" link: only rendered when truthy ✓
- Directions link: `https://maps.apple.com/?q=${encodeURIComponent(data.venue.address)}` — always renders even if `address` is empty. Add guard: only render if `data.venue.address`.
- "Call venue": only rendered when `reservationPhone` truthy ✓

### 9D — Site header nav links
**File:** `components/layout/site-header.tsx` (or site-header.tsx depending on path)

The nav includes `/about`, `/submit`, `/admin` links. These pages exist (`app/about/page.tsx`, `app/submit/page.tsx`, `app/admin/page.tsx`) — they are live routes. No dead links here.

### 9E — `app/[city]/matches/page.tsx`
Check this file exists and renders without error. Read it and confirm it doesn't have any hard-coded `/nyc/` paths.

---

## SECTION 10 — Globals CSS cleanup and map pin fix (~10 min)

**File:** `app/globals.css`

1. Add missing flag-pin styles that make the pin look complete (the `.flag-pin__flag-shell` and `.flag-pin__dot` classes need to be present — check they are, and if missing add them):

```css
.flag-pin__flag-shell {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 9999px;
  background: white;
  border: 2px solid var(--flag-pin-accent, #16324f);
  box-shadow: 0 2px 6px rgba(10, 22, 40, 0.18);
  overflow: hidden;
}

.flag-pin__flag {
  font-size: 18px;
  line-height: 1;
}

.flag-pin__code {
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.06em;
  color: #0a1628;
}

.flag-pin__dot {
  display: block;
  width: 8px;
  height: 8px;
  border-radius: 9999px;
  background: var(--flag-pin-accent, #16324f);
  border: 2px solid white;
  margin-top: 2px;
  box-shadow: 0 2px 4px rgba(10, 22, 40, 0.22);
}
```

2. The `.leaflet-popup-content-wrapper` padding is `0` which can clip rounded corners — keep as-is but ensure `overflow: hidden` is set (it already is).

3. Confirm `.map-shell-frame` is now `calc(100svh - 73px)` (updated in Section 2A).

---

## SECTION 11 — TypeScript check and build (~10 min)

1. Run `npx tsc --noEmit`. Fix every error.

2. Run `npm run build`. Fix every build error. Common issues to watch for:
   - Any `import` of server-only code in a client component
   - `Link` imported but used with an `href` that could be undefined — guard them
   - New `HomeCountryPicker` component typed correctly (pass `CountrySummary[]` not `any`)

3. Run `npm run dev` and manually verify in a browser:
   - `/` — homepage loads, city cards show, country picker renders
   - `/nyc/map` — map fills viewport, no stacked filter bars above map, ⚙ Filters button visible at bottom-left of map, clicking it opens FilterDrawer with venue type chips + country search grid + match filters
   - Select Portugal in FilterDrawer — flag chips appear in "Selected:" row, map pins update, results panel updates
   - Click a map pin — popup shows venue name, neighborhood, rating, "View details →" link
   - Click "View details →" — navigates to `/venue/[slug]` and page loads without broken links
   - Mobile (DevTools iPhone SE): map fills screen, Filter and Results buttons at bottom, filter drawer slides up as bottom sheet

---

## Acceptance criteria (all must pass)

- [ ] `npx tsc --noEmit` → 0 errors
- [ ] `npm run build` → exits 0
- [ ] `/` — homepage renders with city cards AND country picker
- [ ] `/nyc/map` — Leaflet map fills >70% of viewport height with NO stacked filter bars blocking it
- [ ] ⚙ Filters button opens a drawer/sheet containing: venue type chips, country flag grid (searchable), match filter, more options
- [ ] Selecting a country filters map pins and results list correctly
- [ ] Clicking a map pin opens a popup with name, neighborhood, rating, View details link (no broken `tel:` link)
- [ ] `/venue/[slug]` — no duplicate "Neighborhood" label, Directions link only renders if address present
- [ ] Mobile pinch-to-zoom works on map
- [ ] No JS console errors on any of the above pages

---

## Files you will touch (summary)

| File | What changes |
|------|-------------|
| `lib/providers/types.ts` | Add `priceLevel?: number` |
| `components/map/VenuePreviewCard.tsx` | Fix dead tel: link, add rating, polish popup |
| `components/venue/venue-card.tsx` | Fix dead tel: link |
| `app/venue/[slug]/page.tsx` | Fix borough label, guard directions link |
| `app/globals.css` | Update map-shell-frame height, add flag-pin subclasses, style popup close button |
| `components/map/MapPageClient.tsx` | Remove stacked filter bars, add FilterDrawer, add topCountries quick pick, floating overlays |
| `components/map/MapShell.tsx` | Update results panel position, add `filterDrawerOpen` / `onClearFilters` / `hasActiveFilters` props, refactor mobile trigger buttons |
| `components/map/FilterDrawer.tsx` | NEW file — all filter controls in a drawer/bottom-sheet |
| `components/map/FlagFilterBar.tsx` | Replace horizontal scroll with CSS grid, add Selected: summary row |
| `components/map/MapResultsPanel.tsx` | Add View details link to each card |
| `components/map/NYCFlagPinMap.tsx` | Add `tap={false}`, move zoom control to bottomright, import ZoomControl |
| `components/home/USAHomepage.tsx` | Add country picker section |
| `components/home/HomeCountryPicker.tsx` | NEW file — client component for homepage country grid |
| `app/[city]/matches/page.tsx` | Audit only — no changes expected |

---

---

## SECTION 12 — Copy, grammar, formatting and consistency pass (~30 min)

Work through every file listed below. The goal is a single consistent voice and casing convention across the entire app. Apply all changes in one pass per file.

### Convention rules to follow throughout

- **Sentence case** for all UI labels, button text, option labels, placeholder text, badge text, section headers, and body copy. Capitalise only the first word and proper nouns (country names, city names, "World Cup", "GameDay Map").
- **Title case** is only used for the app name "GameDay Map" and page `<title>` meta strings.
- **No trailing periods on headings** (`<h1>`, `<h2>`, `<h3>`).
- **Consistent hyphenation:** use "matchday" (one word, no hyphen) everywhere — not "match-day" or "match day". Use "game-day" (hyphenated compound adjective) only when used before a noun (e.g. "game-day venue"). Standalone as a noun: "on matchday".
- **Venue type display:** anywhere `venueType.replace(/_/g, " ")` is called, use `toTitleCase(venueType.replace(/_/g, " "))` instead (see 12A for the helper).
- **Country slug display:** anywhere `country.replace(/-/g, " ")` is called on a slug string, use `toTitleCase(country.replace(/-/g, " "))`.
- **CTA buttons:** use "Submit a venue" (not "Suggest a Venue" or "Submit Venue") everywhere a venue-submission CTA appears.
- **Reservations:** use "Reservations available" (not "Reserve available" or "Reserve a spot" as a badge).
- **"Clear all"** (not "Clear all filters" or just "Clear") for filter-reset buttons.
- **"Find spots →"** for any CTA that goes to the map — keep the arrow.
- **Matchday banner pill:** "Matchday" (not "Match day").

---

### 12A — Add `toTitleCase` helper

**File:** `lib/utils.ts`

Add at the bottom of the file:

```ts
export function toTitleCase(value: string): string {
  return value
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function formatCapacityBucket(bucket: string): string {
  switch (bucket) {
    case "under_30": return "Under 30";
    case "30_60":    return "30–60";
    case "60_100":   return "60–100";
    case "100_200":  return "100–200";
    case "200_plus": return "200+";
    default:         return toTitleCase(bucket.replace(/_/g, " "));
  }
}
```

Import `toTitleCase` and `formatCapacityBucket` wherever needed below.

---

### 12B — Fix intent badge labels (2 files)

Both `MapResultsPanel.tsx` and `VenuePreviewCard.tsx` have an `intentBadge` function that maps `watch_party` and `sports_bar` both to "📺 Showing games". Differentiate them:

```ts
function intentBadge(venueIntent: RankedVenue["venueIntent"]) {
  switch (venueIntent) {
    case "watch_party":     return { label: "📺 Watch party",       className: "..." };
    case "sports_bar":      return { label: "⚽ Sports bar",         className: "..." };
    case "cultural_dining": return { label: "🍽️ Authentic dining",  className: "..." };
    case "both":            return { label: "🏆 Both",              className: "..." };
    default:                return { label: "📺 Watch party",       className: "..." };
  }
}
```

Keep the existing `className` values — only fix the `label` strings.

---

### 12C — Fix venue type display (3 files)

**Files:** `components/map/MapResultsPanel.tsx`, `components/venue/venue-card.tsx`, `app/venue/[slug]/page.tsx`

Every instance of `type.replace(/_/g, " ")` or `venueType.replace(/_/g, " ")` should become `toTitleCase(type.replace(/_/g, " "))`. Import `toTitleCase` from `@/lib/utils`.

---

### 12D — Fix associated country slug display (2 files)

**Files:** `components/venue/venue-card.tsx`, `components/map/VenuePreviewCard.tsx`

Every instance of `country.replace(/-/g, " ")` on a slug string should become `toTitleCase(country.replace(/-/g, " "))`.

---

### 12E — Fix capacity bucket display (1 file)

**File:** `components/venue/venue-card.tsx`

In the `capacityLabel` function:
```ts
// Before:
return venue.capacityBucket.replace(/_/g, " ");
// After:
import { formatCapacityBucket } from "@/lib/utils";
return formatCapacityBucket(venue.capacityBucket);
```

---

### 12F — Fix select option labels (1 file)

**File:** `components/map/MapPageClient.tsx`

Fix these option labels inside the "More filters" panel:

| Element | Current label | Correct label |
|---------|--------------|---------------|
| Borough select first option | "All Neighborhoods" | "All boroughs" |
| Neighborhood select first option | "Neighborhood" | "All neighborhoods" |
| Venue type select first option | "Venue type" | "All venue types" |
| Capacity select first option | "Capacity" | "All capacities" |
| Sort select option | "Best match-day vibe" | "Best matchday vibe" |

Also fix the capacity bucket option labels inside the select to use proper en-dashes:
```tsx
<option value="30_60">30–60</option>
<option value="60_100">60–100</option>
<option value="100_200">100–200</option>
<option value="200_plus">200+</option>
```

Same fix for the capacity select in `components/map/FlagFilterBar.tsx` if it has one.

---

### 12G — Fix filter section headings and button labels (1 file)

**File:** `components/map/MapPageClient.tsx`

Update these inline filter panel labels:

| Current | Correct |
|---------|---------|
| `🍻 Venue type` (panel heading) | `🏠 Venue type` |
| `🏳️ Country flags` (quick filter pill) | `🌍 Countries` |
| `🏟 Match` (quick filter pill) | `📅 Match` |
| `⚙ More` (quick filter pill) | `⚙️ More` |
| `🍻 Venue type` (quick filter pill) | `🏠 Venue type` |
| `⚽ Soccer Bars` (button label) | `⚽ Soccer bars` |
| Any "Clear all filters" button | "Clear all" |
| Any "Clear" button | "Clear all" |

In the **match filter panel**, change the no-matches fallback text:
```tsx
// Before:
"No city-hosted matches loaded for this host city yet."
// After:
"No matches loaded for this city yet."
```

---

### 12H — Fix MatchdayBanner pill label (1 file)

**File:** `components/map/MatchdayBanner.tsx`

```tsx
// Before:
"🔴 Match day"
// After:
"🔴 Matchday"
```

---

### 12I — Fix About page H1 (1 file)

**File:** `app/about/page.tsx`

Remove the trailing period from the H1:
```tsx
// Before:
<h1 ...>Built for game-day discovery, not scraping hacks.</h1>
// After:
<h1 ...>Built for game-day discovery, not scraping hacks</h1>
```

---

### 12J — Standardise CTA button text (2 files)

**File:** `components/layout/site-header.tsx`

```tsx
// Nav link:
// Before: Submit Venue
// After: Submit a venue

// CTA button:
// Before: Suggest a Venue
// After: Submit a venue
```

**File:** `app/submit/page.tsx`

The H1 "Submit a new game-day venue" — change to "Submit a venue" (shorter, cleaner).

---

### 12K — Fix VenueHero badge text (1 file)

**File:** `components/venue/venue-hero.tsx`

```tsx
// Before:
{venue.acceptsReservations && <Badge>Reserve a spot</Badge>}
// After:
{venue.acceptsReservations && <Badge>Reservations available</Badge>}
```

---

### 12L — Fix VenueCard badge text (1 file)

**File:** `components/venue/venue-card.tsx`

```tsx
// Before:
{venue.acceptsReservations && <Badge>Reserve available</Badge>}
// After:
{venue.acceptsReservations && <Badge>Reservations available</Badge>}
```

---

### 12M — Fix FlagFilterBar placeholder text (1 file)

**File:** `components/map/FlagFilterBar.tsx`

```tsx
// Before:
placeholder="Search country flags"
// After:
placeholder="Search countries"
```

---

### 12N — Fix MapResultsPanel empty state copy (1 file)

**File:** `components/map/MapResultsPanel.tsx`

```tsx
// Before:
<h3 ...>No spots found</h3>
<p ...>Try a different city or remove a filter</p>
// After:
<h3 ...>No spots found</h3>
<p ...>Try a different city or clear a filter to see results.</p>
```

---

### 12O — Verify site footer copy

**File:** `components/layout/site-footer.tsx` (read it, fix any casing/grammar issues you find — apply sentence case to all labels and links; fix any trailing periods on headings; ensure "GameDay Map" is always written as two words capitalised exactly this way, never "Gameday map" or "GAMEDAY MAP" outside of the `uppercase tracking` CSS treatment).

---

### 12P — Fix sub-regional flag emoji rendering (England, Scotland, Wales)

The England (`🏴󠁧󠁢󠁥󠁮󠁧󠁿`), Scotland (`🏴󠁧󠁢󠁳󠁣󠁴󠁿`), and Wales (`🏴󠁧󠁢󠁷󠁬󠁳󠁿`) flag emojis use Unicode tag sequences that do not render on Chrome/Windows. Instead of showing a blank box or falling back to "ENG", improve the fallback rendering everywhere the `renderFlagPinInner`, `renderCountryFlag`, and `renderCountryChip` functions are called.

The existing fallback logic checks `flagEmoji.length > 4 || flagEmoji.includes(" ")` to detect bad emojis. Sub-regional tag emojis are much longer (they contain invisible tag characters). The check `flagEmoji.length > 4` already catches them correctly — the `fifaCode` fallback renders instead. So the fallback IS working — "ENG" is correct fallback behaviour.

What needs fixing is how the **fallback code is styled** in the results panel. Currently "ENG" appears in a tiny circle that looks broken. Improve it:

**File:** `components/map/MapResultsPanel.tsx`

In the flag circle `div`, instead of the tiny 8px font for the code, use a slightly larger and bolder style:
```tsx
// Before:
<span className={flagEmoji.length > 4 || flagEmoji.includes(" ") ? "text-[10px] font-extrabold tracking-[0.08em]" : ""}>
  {renderCountryChip(flagEmoji, countryCode)}
</span>
// After:
{flagEmoji.length > 4 || flagEmoji.includes(" ") ? (
  <span className="text-[9px] font-black tracking-[0.1em] text-[#0a1628]">{countryCode ?? "FC"}</span>
) : (
  <span className="text-lg leading-none">{flagEmoji}</span>
)}
```

Apply the same pattern in `VenuePreviewCard.tsx` and `FlagFilterBar.tsx` — anywhere a flag emoji is rendered with a code fallback.

Also in `NYCFlagPinMap.tsx`, the `renderFlagPinInner` function already handles this with `.flag-pin__code` CSS class — confirm the CSS in `globals.css` makes `.flag-pin__code` render as a small bold white label on the coloured pin background. If not, add:
```css
.flag-pin__code {
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: white;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
}
```

---

### Updated file list additions for Section 12

| File | What changes |
|------|-------------|
| `lib/utils.ts` | Add `toTitleCase`, `formatCapacityBucket` |
| `components/map/MapResultsPanel.tsx` | Intent badge labels, venue type title case, empty state copy |
| `components/map/VenuePreviewCard.tsx` | Intent badge labels, country slug title case |
| `components/venue/venue-card.tsx` | Venue type title case, country slug title case, capacity bucket, badge text |
| `app/venue/[slug]/page.tsx` | Venue type title case |
| `components/map/MapPageClient.tsx` | Select option labels, filter heading labels, button labels, sort option |
| `components/map/FlagFilterBar.tsx` | Placeholder text, capacity option labels |
| `components/map/MatchdayBanner.tsx` | "Matchday" pill label |
| `app/about/page.tsx` | Remove H1 trailing period |
| `components/layout/site-header.tsx` | Nav link text, CTA button text |
| `app/submit/page.tsx` | H1 text |
| `components/venue/venue-hero.tsx` | Badge text |
| `components/layout/site-footer.tsx` | General copy audit |

---

## When you're done

Report back:
1. List of all files changed
2. Output of `npx tsc --noEmit`
3. Output of `npm run build` (last 20 lines)
4. Any ambiguous decisions you made and why
5. Any section you skipped and why

Do NOT commit — just report back.
