# Cleanup Pass 3 — fourth audit (localhost:3000)

Massive shipment. The Today rebuild, the map, the design tokens, the venue page polish — most of the build prompt has landed. This pass is the surgical finishing list.

---

## ✅ CONFIRMED FIXED — do not regress

1. **Today rename complete.** `/today` route works, page header reads "TODAY · Today in New York", nav pill says "Today", footer link says "Today". `/tonight` should still 301 here (verify).
2. **Mobile nav shipped.** DOM has `<div class="mobile-nav-shell ... fixed inset-x-0 bottom-0 z-50 ... min-[600px]:hidden">` containing a 5-item nav (🏠 Home / ⚽ Today / 🗺️ Map / 📅 Matches / 👤 Account) plus a "+" Submit FAB.
3. **Today page is fully built**: Find a bar / Find a restaurant tabs both visible; "Today at a glance" with real weather + sunset; coherent "First match on deck — No matches today, here's what's worth a watch tomorrow at 3:00 PM" copy; Top 3 spots labelled "TOP 3 SPOTS FOR MEX VS RSA IN NEW YORK"; "Where to go next" rail with 5 upcoming matches; filter strip with Reservations / Walk-in / Open now / Outdoor seating / Distance from me 🔒 / atmosphere dropdown / group size; country chips ARG → CZE; "Deals today in NEW YORK" with QR + CODE redemption type badges; "Top 3 in New York tonight" ranked list with #1 #2 #3 + Reserve/Directions; Most reviewed in New York and Highest rated in New York sections (with min-50-review outlier guard explicitly noted in the copy); "MEMBER PERKS — What your membership unlocks on match night" with Elite QR access / Fan Pass early booking / Elite concierge cards.
4. **Venue page debug strings removed.** "Imported from Google Places with name match: grill" is gone. Replaced with curated copy: "High-energy USA-leaning cultural bar with 8+ screens and built for bigger groups on match day."
5. **Map renders.** `/nyc/map` shows real Mapbox tiles, country-flag pins, proper clustering with cluster numbers (3, 6, 7, 8, 12). Right-side card themed correctly.
6. **NYC venue count fixed** (118 not 3,543). Stats label "DEMO VENUES" replaced with "VENUES."
7. **Real SEO city URLs** (`/los-angeles/map`, `/miami/map`, etc.). LA serves LA data.
8. **Dark theme tokens wired.** `--bg-page: #0d1117`, root `data-theme="dark"`.
9. **Account avatar** is initials-based (no soccer ball).
10. **Search page** — Save button no longer overlaps fan score. "VIBE" labels separated. Editorial blurbs in voice ("Liverpool-linked sports bar in FiDi with an unmistakable match-day focus and broad sports coverage").
11. **Country page** (`/country/brazil`) — clean editorial venue list with neighborhoods, ratings, and venue type per city.
12. **2 errors red badge** appears to be gone in this build.
13. **"Demo mode — upgrade free today"** copy removed from the Premium card; replaced with "Unlock Fan Pass perks before kickoff."

---

## ❌ P0 — still blocking ship

### 1. Las Vegas data is wrong
- Home card and Las Vegas city page show "0 matches · No official World Cup fixtures are currently assigned to this city."
- Las Vegas (Allegiant Stadium) is a **confirmed FIFA WC 2026 host city**. Add the assigned fixtures to `/data/matches/2026.json` under `host_city_code: "LAS"`.
- Acceptance: home card shows real fixtures and a non-zero match count; `/las-vegas/map` shows the LV stadium and a venue list.

### 2. Top 3 ranked cards clip the HIGH ATMOSPHERE pill
- On `/today`, "TOP 3 SPOTS FOR MEX VS RSA IN NEW YORK" — cards #1 and #2 cut the bottom of the "HIGH ATMOSPHERE" pill (the bottom half of the pill is invisible, only "HIGH" is fully visible). Card #3 looks fine because the venue blurb is shorter so the card breathes.
- Fix: cards should be equal-height in the row (CSS grid `grid-auto-rows: 1fr` or flex `align-items: stretch`), with the atmosphere pill floored to a fixed bottom slot. Or wrap the pill into single-line text at smaller sizes.
- Acceptance: every ranked card in the Top 3 / Where-to-go-next / ranked-list sections shows the full atmosphere pill, on every viewport width from 320px → 1920px.

### 3. Map venue card has empty white photo block
- Right-side venue card on `/nyc/map` has a white rectangle (~200px tall) at the top of the card before the venue name. If `photo_urls` is empty, the placeholder is a flat white block — clashes hard against the dark theme.
- Fix: when no photo, render the dark-surface empty state (city skyline silhouette + country flag overlay, on `--bg-surface`), or pull a Google Places photo by reference, or just show a tighter card with no media at all.
- Acceptance: zero white blocks in dark mode anywhere on the map view.

### 4. Search city tabs truncate "Las Vegas"
- Bottom of the city-tab strip on `/search`, the right-most tab shows "Las Ve" (the rest is cut off at the viewport edge).
- Fix: add right padding equal to one tab width; or render with overflow scroll-snap; or ensure horizontal scroll has visible momentum/scrollbar.
- Acceptance: at 1440px, every city tab is fully visible OR there's an obvious "scroll for more" affordance.

### 5. Mobile bottom nav visual verification
- DOM shows the nav exists. Verify visually at 390px by opening Chrome DevTools mobile mode, taking a screenshot, and confirming:
  - All 5 items render as labels with icons.
  - "+" FAB sits centered above the bar.
  - Tap targets are at least 44×44px.
  - Safe-area-inset is honored on iPhone notch.
  - Dark + light themes both look right.
- Acceptance: a screenshot at 390×844 with the bottom nav rendering correctly, plus another at 360×640 (Android baseline).

### 6. Search-icon-on-mobile visual verification
- The DOM check found a search icon. Verify it's in the top sticky header on every route at 390px width and is one tap from `/`, `/today`, `/{city}/map`, `/membership`, `/account`, `/saved`, `/venue/{id}`. Per the TODAY_REBUILD spec, this is required.

---

## ⚠️ P1 — high-impact polish

### 7. Top 3 cards should show country flag for the venue
- On Today's "TOP 3 SPOTS FOR MEX VS RSA IN NEW YORK", the cards are La Contenta Oeste / Kaia Wine Bar / Ofrenda. None show a flag indicating which country's supporters they're aligned with. For a Mexico match, fans want to see 🇲🇽 next to "La Contenta Oeste" so they know it's the right room.
- Fix: small flag badge in the top-left of each ranked card, drawn from `venue.country_code`. If `country_code === "MIXED"`, use a fan-fest icon instead.

### 8. Where-to-go-next rail is bare
- Cards show only "KOR vs CZE · Jun 12 3:00 AM · Top spots →". Should add: country flags next to codes, the host stadium (so a NYC user sees if it's their city or a road match), and a one-line "fan_energy" tag pulled from `/content/matches/2026.json` (e.g. "3am kickoff in Guadalajara — a global late-night for Korean and Czech bars").
- Fix: enrich the card schema to pull `match.host_city_code`, `match.fan_energy`, `match.blurb_short` from the matches data.

### 9. Country chip filter strip on Today is incomplete
- Visible chips: ARG, ALG, AUS, AUT, BEL, BIH, BRA, CAN, CPV, COL, COD, CRO, CUW, CZE — that's only 14 of 48. The remaining 34 countries (CIV, ECU, EGY, ENG, FRA, GER, GHA, etc.) are missing or scrolled off without an affordance.
- Fix: horizontal-scroll strip with momentum scroll on touch + a "see all 48" button at the right edge that opens a full grid in a sheet/modal.
- Acceptance: every one of the 48 nations is reachable from the Today filter strip in ≤2 taps.

### 10. Promo redemption flow not tested end-to-end
- "Tap to redeem" on a promo card should open the full-screen redemption takeover (QR / code / mention / auto-applied per redemption type) per TODAY_REBUILD §C3. Verify by tapping each promo type once and confirming the takeover renders, the QR rotates if QR-typed, and the "redeemed" state persists.
- Acceptance: each of the 4 redemption types (`show_qr`, `mention_code`, `auto_applied`, `walk_in`) has a working takeover.

### 11. Member Perks cards' "Upgrade to unlock" CTAs need to actually go to checkout
- Each of the three perk cards shows "Upgrade to unlock →". Verify that:
  - Elite QR access → Stripe Checkout for Supporter Elite tier.
  - Fan Pass early booking → Stripe Checkout for Fan Pass tier.
  - Elite concierge → Stripe Checkout for Supporter Elite tier.
- If Stripe isn't wired yet (Phase 3.6 from the original prompt), these CTAs should at least preserve a `?return=` querystring so the user lands back on `/today` after completing the upgrade.

### 12. Map venue card: "Cultural bar with match coverage" thin label is redundant
- Above the venue name, every map card shows a small dark-gold-tinted label like "🍺 Cultural bar with match coverage". This same info is conveyed by the "SPORTS BAR" / "CULTURAL BAR" badge directly below the photo. The label feels like leftover scaffolding.
- Fix: drop the thin label OR drop the SPORTS BAR badge. Pick one.

### 13. Top 3 ranked card copy says "Top 3 in New York tonight" — should be "today"
- Below the Top 3 hero, there's another section "Top 3 in New York tonight · Ranked bar picks for the current city and mode." Catch the last "tonight" string.
- Acceptance: search source for `tonight` (case insensitive) in any UI-rendering file. Replace where the meaning is "the day's slate." Leave it in country-guide prose ("the room is loud at night") only when the meaning is literally evening.

### 14. NA hero map: NYC label clips PHI label
- Better than dot-scatter, but at desktop "NYC" still grazes "PHI." Fix with collision-aware placement, or fixed offset (NYC label up-right, PHI label down-left).

### 15. Stats label "RESERVATION-READY SPOTS"
- During scroll the label appears clipped to "READY SPOTS" because the eyebrow is on two lines and the top half drops above the viewport. Cosmetic only — but worth fixing by:
  - Making the eyebrow single-line at desktop widths.
  - OR using a shorter label like "RESERVATIONS" or "BOOK READY" and keeping the number prominent.

---

## P2 — nice to have, post-ship

### 16. Las Vegas bug: stats stat for "venues" is 2,146
- Verify whether the 2,146 figure is real or seeded test data. If seeded, label it accurately ("DEMO VENUES" was rolled back, but a number that's purely synthetic can mislead launch press).

### 17. Match preview blurbs not used in match cards
- `/content/matches/2026.json` contains 37 detailed previews. The Today match cards still show generic kickoff time only. Wire `blurb_short` into the Top 3 hero subhead (e.g. "Tournament opens at the Azteca, the only stadium to host three World Cups").

### 18. Country guide content not wired into /country/{slug}
- `/country/brazil` shows venues but no editorial blurb. The 48 country guides in `/content/countries/` should render at the top of each page.

### 19. City editorial content not wired into /{city}/map
- Same — the 17 city guides in `/content/cities/` should appear as a "CITY GUIDE" panel above or below the map.

### 20. /matches page still uses old layout
- `/nyc/matches` still has the prior "All Matches" / "At MetLife Stadium" tabs without integrating Today's improved venue picks per match. Redirect to a unified `/matches?city=nyc` that pulls from the same data layer as Today.

### 21. /membership tier CTAs not wired to Stripe Checkout (Phase 3.6 of original prompt)
- Verify "Get Fan Pass" and "Get Elite" buttons open Stripe Checkout test mode. If they don't, that's launch-blocking, not a P2.

### 22. /admin/* tooling not built (Phase 8)
- Codex hasn't shipped the admin dashboard yet. Owner needs `/admin/venues` for the bulk-import path before sourcing partner venues.

### 23. Today's "FIRST MATCH ON DECK" hero is text-only
- Card is functional but visually flat. Consider: a subtle gradient using both team colors (e.g. green→red for MEX vs RSA), or a stadium image overlay at low opacity, or animated countdown digits.

### 24. Top 3 cards at desktop are 3-up but tight
- At 1440px, three cards in the row leaves the venue blurbs pinched. On wider screens (>1280px) consider a 4-up grid that adds Top 4, OR widen the cards and shrink to 2-up + a "See more" rail.

---

## Verification checklist

Run end-to-end in one session, desktop and mobile:

1. `/` — header says Today (not Tonight). NYC card shows 118 venues. Las Vegas card shows real fixtures, not "0 matches."
2. `/today` — Today in {city}, Find a bar/restaurant tabs visible, full "First match on deck + Top 3" hero with country flags on each ranked card and no clipped atmosphere pills.
3. Tap a country chip → strip scrolls or "see all 48" opens a full grid.
4. Tap a "Tap to redeem" promo → takeover opens (QR/code/mention/auto).
5. Tap a Member Perks "Upgrade to unlock" → Stripe Checkout opens (or `/membership?return=/today`).
6. Resize to 390px → bottom nav appears with Home / Today / Map / Matches / Account + center "+" FAB. Top header shows logo + 🔍 search icon + account avatar + ☰ menu.
7. Tap 🔍 → search opens in one tap.
8. `/nyc/map` — map tiles, country-flag pins, clusters, click a pin, right-side card has zero white photo block.
9. `/los-angeles/map` — LA-specific data, not NYC fallback.
10. `/venue/nyc-usa-the-u-bar-and-grill` — no "Imported from Google Places" string, brand-aligned hero (no purple). One redundant label between the thin "🍺 Cultural bar with match coverage" pill and the SPORTS BAR badge has been removed.
11. `/search` — Las Vegas tab fully visible; Save and VIBE not overlapping; country pills readable.
12. `/country/brazil` — editorial intro from `/content/countries/brazil.md` renders above the venue list.
13. `/membership` — Get Fan Pass / Get Elite buttons fire Stripe Checkout test mode.
14. Source-search the codebase for "tonight" — only valid uses (descriptive prose, country guide blurbs about evening culture) remain. UI strings all say "today."

When all 14 pass, this cleanup is done. Resume Phase 3.6 (Stripe wiring), Phase 8 (admin tooling), Phase 9 (SEO content batch wired into city/country pages).
