# Cleanup Pass — second audit (localhost:3000)

Big progress since the first audit. The North America hero map looks great, the saved page has a real empty state, the search page works, country/brazil renders, the nav layout is clean, England/Scotland flags render, Monterrey has matches. Don't break any of it.

What's still broken or sloppy, in priority order:

---

## P0 — blockers, fix before anything else

### 1. City map area is still completely blank
- `/nyc/map`, `/la/map`, every `/{city}/map`: sidebar + filters render but the actual map canvas is empty. Confirmed: `window.mapboxgl` is undefined, no `.mapboxgl-map` containers exist in the DOM, `mapElements` query returns 0.
- The single-venue map on `/venue/{id}` does work — so the SDK loads somewhere. The bug is specific to the city listing map's mount: parent container probably has no resolved height, or the SDK is being imported but never instantiated for this view, or the token check fails silently.
- Fix: trace why `mapboxgl` global isn't set on the listing route. Check that the import isn't tree-shaken away, that the container has explicit pixel height (not `100%` of an unflexed parent), that the token env var is exposed to the client bundle on this route.
- Acceptance: open `/nyc/map`, see tiles, see pins, click a pin, see the right-side card open. Same for every other `/{city}/map`.

### 2. Non-NYC city map URLs still serve NYC data
- `/la/map` navigates but the page title is "Best Bars to Watch World Cup 2026 in New York" and the venue list is NYC's. Same for SF, MEX, TOR, etc.
- Fix: each city URL must read from `/data/venues/{city_code}.json` per the Phase 1 data layer, not fall back to NYC.
- Acceptance: `/la/map` shows LA stadium name, LA venues, LA-centered map.

### 3. NYC home card shows "📍 3543 venues" — that's wrong
- The actual NYC venue count should match what the map's "spots shown" reports (~140). 3,543 is probably counting all venues across all cities. Other cities show plausible numbers (148, 135, 160, etc.) so this is NYC-specific.
- Fix: home card venue counter for NYC uses the wrong selector or is summing something it shouldn't.
- Acceptance: NYC home card shows the same count as `/nyc/map` reports.

### 4. Theme system from Phase 1.5 isn't wired
- `getComputedStyle(document.documentElement).getPropertyValue('--bg-page')` returns empty.
- No theme toggle visible in any nav.
- Site appears stuck in light mode even when device is dark.
- Fix: ship the design-token CSS variables (semantic names, dark + light values), wire the toggle into the More menu and onto /account, prevent flash-of-wrong-theme with an inline head script.
- Acceptance: toggle flips theme on every primary route with no flash; localStorage persists; `prefers-color-scheme` respected when set to system. Reload the right-side venue card on `/nyc/map` in dark mode and verify text is readable on its surface (the original bug from the screenshot).

### 5. Las Vegas still shows "0 matches · Full schedule preview coming soon"
- LV is a confirmed host. Pull its matches from the official 2026 schedule.
- Acceptance: LV card on home shows real fixtures, just like every other city.

---

## P1 — visible UX bugs

### 6. Search results card layout has overlapping table headers
- On `/search`, each venue card has a row of column headers (RATING / FAN SCORE / CAPACITY / RESERVATION / PRICE) that are jammed together and overlap. Looks broken.
- Fix: that row needs more horizontal space, smaller font, or a different layout (label-above-value vertical pairs instead of inline).
- Acceptance: every header readable, no overlap, at every desktop and mobile width.

### 7. /account leaks "Profile Header" as visible UI text
- The literal string "Profile Header" is rendering at the top of the account page. That's a placeholder label that escaped into production.
- Fix: remove the visible label or replace with the user's display name.

### 8. /account avatar is still a soccer-ball emoji placeholder
- Spec'd in Phase 5.3 — replace with initials-based default (gold ring, monogram).

### 9. "Demo mode — upgrade free today" on home
- Confusing tagline next to the "Go Premium" callout. Either kill it or make it a real one-click 7-day Fan Pass trial as called out in Phase 3.6.

### 10. North America hero map: NYC and PHI labels overlap their dots
- Better than the original dot-scatter version, but at desktop width "NYC" and "PHI" labels still clip into each other and into their pins.
- Fix: collision-aware label placement, or right-align NYC and left-align PHI when they'd overlap.

---

## P2 — polish, not blockers

### 11. England flag renders correctly on home country chip but not on Dallas card's "ENG vs CRO"
- Verify subdivision flag sequences are used everywhere ENG/SCO appear, not just in the country chips grid.

### 12. Boston card "HAI vs SCO" — Scotland flag missing same way
- Same fix.

### 13. /tonight is still bars-only
- Phase 4 calls for a separate restaurants section. Not yet built.

### 14. No "Tonight in {city}" auto-detect
- Tonight defaults to "across all 17 host cities." The user's home city should drive the surface.

### 15. Auto-generated venue blurbs read like data, not editorial
- Brickyard Craft Kitchen & Bar shows "USA restaurant in NYC." That's the import string, not curated copy. Replace with editorial blurbs in the voice of `/content/countries/usa.md` and `/content/cities/NYC.md`.

### 16. The "demo venues 5,571" stat on home
- If those are seeded/synthetic, replace the label with "venues" once the real venue ingestion lands. Calling them "demo" undermines trust during launch.

---

## What's working — DO NOT BREAK

- Real North America map with geographic outlines
- Top nav layout at all widths
- Country/brazil and other country pages
- /search page (apart from the table-row layout bug above)
- /saved empty state
- /tonight countdown and structure
- /membership tier copy and pricing layout
- Footer
- Logo SVG
- England/Scotland subdivision flag in country chip grid
- Monterrey has fixtures

---

## How to verify when this pass is done

Run this checklist top to bottom in a single browser session:

1. Open `/` — countdown ticks, nav clean, hero map renders with pin labels not overlapping.
2. Click any of the 17 city pins — lands on `/{city}/map` for THAT city, with that city's stadium, that city's venues, map tiles visible, pins visible, click a pin → right-side card opens, content readable.
3. Open the More menu → Theme toggle → flip → every surface flips legibly with no flash.
4. Open `/account` — no "Profile Header" string, real initials avatar, membership panel shows free-tier state.
5. Open `/search` — venue cards render with no overlapping headers.
6. Open `/tonight` — restaurants section visible (Phase 4) and city auto-detected.
7. Open `/membership` — Stripe Checkout opens for both Fan Pass and Elite (Phase 3.6).
8. Open `/nyc/map` in dark mode — right-side venue card text readable on its surface, no white-on-white.
9. Open Las Vegas card on home — real fixture list, not "Full schedule preview coming soon."
10. Confirm NYC home card venue count matches `/nyc/map` "spots shown" count (not 3,543).

When all 10 pass, this cleanup is done. Then resume Phase 3 / 4 / 5 work in the original prompt.
