# Codex Brief — World Cup Fan Finder map work

You (Codex) are executing. Claude (separate agent) is planning and reviewing.
This document is the single source of truth for what has already changed, what
to do next, and how Claude will verify your work. **Read it end-to-end before
writing any code.**

---

## 1. What Claude already changed (do NOT redo — only extend)

| File | Change | Why |
| --- | --- | --- |
| `components/map/world-map.tsx` | Swapped `geo.properties.iso_a2` lookup for normalised-name matching with a `NAME_TO_SLUG` override map. Added `onCountrySelect` prop, `highlightNYC` prop, US polygon dimming, and an NYC marker overlay. | The TopoJSON at `world-atlas@2/countries-110m.json` exposes only `{ name }` and a numeric `id` — `iso_a2` was always `undefined`, so every country fell into the non-participant branch. That was the root cause of the "broken map". |
| `lib/maps/serviceAreas.ts` | Removed LA / Miami / Houston / Chicago / Boston / DC / SF. Only NYC remains (bounds cover the 5 boroughs + JC/Hoboken). | Product decision: NYC-only coverage. |
| `types/react-simple-maps.d.ts` | New ambient module shim. | `react-simple-maps@3.x` ships without types; `tsc --noEmit` was failing. |

`components/map/MapPageClient.tsx` is **unchanged from your last state** — Claude prototyped an embedded world map there, then reverted so you can rebuild freely for the new two-map direction (see §3, Step D).

`components/map/ServiceAreaList.tsx` is still imported by `MapPageClient.tsx` but only shows one entry now (NYC) because `serviceAreas` was trimmed. In Step D you'll likely remove both the `<ServiceAreaList>` usage and the file itself.

### Pre-existing bugs Claude did NOT fix (please handle)

- `lib/providers/mock.ts` reads `params.priceLevel`, but `VenueSearchParams` in
  `lib/providers/types.ts` doesn't declare that field. Add
  `priceLevel?: number` to the interface.

---

## 2. Product direction (the "two maps" update)

The homepage needs **two maps stacked**:

1. **World map (top).** Clicking a country **redirects to the NYC map view for
   that country** — no in-page panel. Use
   `router.push(`/map?country=${slug}`)`. This means: *remove* the
   `onCountrySelect` wiring Claude added in `MapPageClient.tsx` from the
   homepage usage; let the default routing fire.

2. **NYC flag-pin map (below the world map).** An **interactive, draggable
   Leaflet NYC map** showing every seeded venue as a pin with a **mini national
   flag of that venue's `likelySupporterCountry` on top of the pin**. Clicking a
   pin opens a popover with venue name, neighborhood, rating, and a link to
   `/venue/[slug]`.

The existing `/map` page becomes the **"NYC map in detail" destination**. It
should:
- Read the `?country=` query param and pre-apply it to `selectedCountrySlugs`.
- Keep the Leaflet venue map prominent. The world map above is optional — you
  may remove it here or make it a collapsible helper.

---

## 3. Concrete implementation plan (in order)

### Step A — fix the mock typing gap
Add `priceLevel?: number` to `VenueSearchParams` in
`lib/providers/types.ts`. Confirm `npx tsc --noEmit` has zero errors before
moving on.

### Step B — build `components/map/NYCFlagPinMap.tsx`
A new client component (or a variant of `LeafletVenueMap`) that:
- Renders `MapContainer` centred on `[40.742, -73.968]`, zoom 11,
  `scrollWheelZoom={true}`, `dragging={true}`, `touchZoom={true}`.
- Iterates `venues` and for each renders a `Marker` with a Leaflet
  `L.divIcon` containing HTML like:
  ```html
  <div class="flag-pin">
    <span class="flag">🇵🇹</span>
    <span class="pin-dot"></span>
  </div>
  ```
- The flag emoji comes from the `CountrySummary.flagEmoji` for the venue's
  `likelySupporterCountry`. Use a `Map<slug, CountrySummary>` lookup you build
  once.
- On marker click, show a `<Popup>` with `VenuePreviewCard` or a compact
  equivalent (name, neighborhood, rating, "View details →").
- Style the flag-pin in `app/globals.css` — flag ~20px tall, pin dot ~10px,
  drop shadow, stacked so the flag sits above the pin.
- File must start with `"use client";`. Import Leaflet dynamically if
  necessary so SSR doesn't break.

### Step C — wire the homepage to show both maps
Edit `app/page.tsx`:
- Keep (or refactor out) the `HeroWorldExplorer` copy + country search, but
  make sure its `WorldMap` passes **no `onCountrySelect`** so clicks use the
  default `router.push(`/country/${slug}`)` route — **except** change the
  default destination to `/map?country=${slug}` (modify the default inside
  `world-map.tsx` itself, so both the homepage and any future callers benefit).
- Add a new section below the hero with `<NYCFlagPinMap venues={allVenues}
  countries={allCountries} />`. Give it a clear heading like "All NYC spots,
  every supporter flag".
- Feed it from `getMapPageData()` (same source `/map` uses).

### Step D — adjust `MapPageClient.tsx` for the new direction
- Remove the embedded `WorldMap` from the top of the NYC page (or make it a
  collapsible "Jump to another country" accordion — your call).
- Read `?country=` from `useSearchParams()` on mount and seed
  `selectedCountrySlugs` with it.
- Keep the filter sidebar and Leaflet venue map as the primary experience.
- You can reuse the new `NYCFlagPinMap` here instead of `LeafletVenueMap` if
  it's visually better — but the filter-result list should stay.

### Step E — acceptance checks (Claude will verify)
Run and paste the output back to the user:
1. `npx tsc --noEmit` → **0 errors**.
2. `npm run build` → green.
3. `npm run dev`, open `/` → world map visible, countries highlighted in blue,
   hover shows pointer + darker blue; clicking Portugal navigates to
   `/map?country=portugal`. On the homepage, scrolling down shows the
   NYC flag-pin map with draggable behavior and flag-topped pins.
4. On `/map?country=portugal`, the filter shows Portugal selected and venue
   list/pins are already filtered to Portugal-associated venues.
5. Mobile (DevTools, iPhone SE viewport): both maps render, pinch-to-zoom
   works on the NYC map, world map scales to width.
6. No "serviceable areas" UI anywhere. Only NYC Metro labelling.

---

## 4. Ground rules

- **Do not modify `components/map/world-map.tsx` lookup logic** — the fix is
  correct. You may change the default `router.push` destination (step C) and
  may add new props, but leave `NAME_TO_SLUG` and the name-matching alone.
- **Do not re-introduce non-NYC service areas.** If a future metro is added,
  it's a separate ticket.
- **Keep `"use client"` boundaries clean.** Leaflet never renders on the
  server.
- **Don't install `@types/react-simple-maps`** — v3.x doesn't have a reliable
  one; the ambient shim in `types/` is the supported path.

---

## 5. When you're done

Report back with:
1. The list of files you changed.
2. The output of `tsc --noEmit` and `next build`.
3. Any decisions you made where the brief was ambiguous.

Claude will review, run sanity checks, and flag anything off before the user
merges.
