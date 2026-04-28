# Cleanup Pass 2 — third audit (localhost:3000)

Massive progress since pass 1. Confirming what's now working, then listing what's still left.

---

## ✅ CONFIRMED FIXED — do not regress

1. Dark theme + design tokens shipped (`--bg-page=#0d1117`, `theme="dark"` on root).
2. NYC home card venue count is now 118 (was 3,543).
3. "DEMO VENUES" stat label replaced with "VENUES."
4. Real SEO city URLs (`/los-angeles/map`, `/miami/map`, etc.).
5. `/los-angeles/map` actually serves LA data (was redirecting to NYC).
6. `/nyc/map` renders Mapbox tiles + country-flag pins. **The blank-map bug from passes 1 + 2 is fixed.**
7. Right-side venue card on the map is themed correctly — no more white-on-white.
8. Search page has structured venue cards with badges, ratings, addresses, editorial blurbs.
9. Account page has F-initial avatar (no soccer-ball placeholder).
10. "Profile Header" debug label is gone.
11. Tonight page has both Find a bar / Find a restaurant tabs visible.
12. Tonight has Top-3-Spots, Where-To-Go-Next, filter strip, Deals section, tier-gated upsells, Member Perks (Members-only caipirinha upgrade, Skip-the-line entry lane).
13. Tonight at a Glance card with weather, matches, city, saved-venues.
14. Promos render with proper redemption badges (CODE, walk-in QR, etc.) and tier-gated CTAs ("Unlock with Fan Pass," "Get Elite to redeem").
15. England/Scotland flags render correctly.
16. Saved page has a real empty state.
17. NA hero map looks good in dark theme.

---

## ❌ P0 — still blocking ship

### 1. Rename "Tonight" → "Today" everywhere (TODAY_REBUILD.md hasn't been picked up)
- Page header still says "TONIGHT · Tonight in New York."
- Top nav pill still says "Tonight."
- `/today` URL renders a blank page (just header + footer). Either the route isn't built or it isn't aliased to `/tonight`.
- Email file names still say "tonight" (`02-tonight-digest.html`).
- Section titles still say "Top 3 in New York tonight," "Deals tonight in New York," "First game tonight."
- Acceptance: every visible "Tonight" string in the UI is "Today," and `/tonight` 301-redirects to `/today`.

### 2. Mobile bottom nav not deployed
- JS check: `mobileNavExists` returns false. There's no `[class*=mobile-nav], [class*=bottom-nav], nav[class*=fixed]` element on any route.
- At 390px width, mobile users still get the desktop nav (Home / Tonight / Map / Matches / Membership) with no Today, Saved, Account, Submit, theme toggle in a logical mobile-first arrangement.
- Acceptance: at 390px, a bottom-fixed bar with Home / Today / Map / Matches / Account, plus a center "+" FAB for Submit, plus a top-right 🔍 search icon in the sticky header.

### 3. The "First Game Tonight" hero is internally contradictory
- Headline: "No matches today — but here are the rooms worth knowing for the next slate."
- Body of same card: shows the Mexico vs South Africa countdown with stadium and group stage labels.
- Right side: "Top 3 spots for THIS MATCH in New York."
- Either there's a match coming up (in which case the headline is wrong) or there isn't (in which case the spots and countdown shouldn't say "this match"). Pick one state and write coherent copy.
- Fix: when the next match is >24h away, headline should be "Up next: {match} on {date} · Kickoff in {countdown}." When the next match is <24h away, "Tonight at {kickoff_local} · {match}." When a match is live, "Live now: {match}." When no matches all day, "No matches today — here's what's worth a watch tomorrow at {next_match_kickoff}."
- And the right-side card title becomes "Top 3 spots for {match_short} in {city}" — never just "this match" without context.

### 4. Venue page still leaks debug strings
- `/venue/nyc-usa-the-u-bar-and-grill` shows "Imported from Google Places with name match: grill." This was flagged in pass 1 and pass 2.
- Replace with a curated 1-line venue blurb in the voice of `/content/countries/usa.md` (e.g. "High-energy USA bar with match coverage — strong group atmosphere, 8+ screens, reliable on match day.").
- Acceptance: open every venue page in the data set, find zero instances of "Imported from", "verified via", "name match", "match: {keyword}".

### 5. Venue page hero banner is purple
- `/venue/{id}` shows a bright purple banner ("🍺 Cultural bar with match coverage") that clashes with the brand gold/dark.
- Fix: use the gold accent token, OR a country-flag-tinted gradient (subtle, low-saturation), OR a dark surface variant. Never raw purple.

### 6. "2 errors" badge in bottom-left of every page
- A red rounded badge with "2 errors" + an X icon shows in the lower-left corner of every screenshot. This is almost certainly the Next.js dev-mode error overlay leaking through.
- Resolve the underlying errors so the badge goes away. Even if those errors are "informational," dev overlays should never appear in production builds — verify `next build && next start` mode is what the user hits.

---

## ⚠️ P1 — visible UX bugs

### 7. Search results card layout
- "Save" button overlaps the fan score number in the top-right of every card ("Save" + "9" or "9.4").
- "England" pill (and likely other country pills) renders with a translucent gradient fade that makes the country name barely readable.
- City tabs strip has wrapping text (Los Angeles, San Francisco, Las Vegas wrap to two lines awkwardly).
- Fix: lay out the card top-row as `[Save_icon_top_right] [Score_below_it]` with vertical stacking, not overlapping. Country pill backgrounds use solid muted color, not gradient. City tabs use horizontal scroll with no wrap.

### 8. Map venue card photo area is empty white
- Right-side card on `/nyc/map` has a white rectangle at the top where a photo should be. If `photo_urls` is empty, render a designed empty state (city skyline silhouette + country flag overlay, on the dark surface token), never a blank white block.

### 9. Country chip filter on Tonight is truncated
- The country filter strip at the bottom of the Tonight filter section shows only A–C countries (ARG, ALG, AUS, AUT, BEL, BIH, BRA, CAN). The other 40 nations are missing — there's no scroll or "show more" affordance.
- Fix: horizontally scrollable strip with momentum scroll on touch, OR a "see all 48" button that opens the full grid in a sheet.

### 10. "Top 3 spots for this match" cards have HIGH ATMOSPHERE pill clipped
- The atmosphere pill at the bottom of each ranked card is cut off — "HIGH ATMOSPHERE" wraps and the bottom padding eats the lower line.
- Fix: card needs more vertical room, or the pill needs to single-line with smaller text.

### 11. Map: pin labels overlap at zoomed-out level
- At default city zoom, country-flag pins cluster tightly in NYC midtown — multiple overlap. Need clustering at zoom < 14.

---

## P2 — polish

### 12. NA hero map: NYC and PHI labels still cluster
- Better than dot-scatter, but at desktop "NYC" and "PHI" labels graze each other and the dots.
- Fix: collision-aware label placement, or fixed offset for NYC right and PHI down-left.

### 13. /today URL behavior
- Once renamed, `/tonight` should 301 to `/today`. Right now `/today` just renders empty.
- Acceptance: `curl -I http://localhost:3000/tonight` returns 301 → `/today`.

### 14. Las Vegas matches
- Verify LV home card no longer says "0 matches · Full schedule preview coming soon." If it does, populate fixtures.

### 15. Match preview blurbs
- Pull from `/content/matches/2026.json` into the Tonight match cards and ranked lists. Right now match cards show "KOR vs CZE · Jun 12 3:00 AM · Top spots →" — could be enriched with "3am kickoff in Guadalajara — a global late-night for Korean and Czech bars."

---

## Verification checklist when this pass is done

Run end-to-end in one session:

1. Open `/`. Header says "Today" (not Tonight).
2. Tap the Tonight/Today pill. Lands at `/today`. Both Find a bar / Find a restaurant tabs visible. First-match hero copy is coherent (no "no matches today" + "this match" contradictions).
3. Resize browser to 390px. Bottom nav appears. Search icon visible in top header. Today is in the bottom nav.
4. Open `/nyc/map`. Map tiles render. Pins cluster at low zoom. Click a pin. Right-side card opens with venue info, no white photo block.
5. Open `/venue/nyc-usa-the-u-bar-and-grill`. No "Imported from Google Places" string. No purple banner. Venue blurb reads as curated copy.
6. Open `/search`. Cards have Save button not overlapping the score. Country pills readable. City tabs scroll horizontally without wrapping.
7. Confirm "2 errors" red badge is gone from every page.
8. `/tonight` 301-redirects to `/today`.
9. Open `/los-angeles/map`. Map tiles, LA-specific venues, no NYC fallback.
10. Las Vegas card on home shows real fixtures.

When all 10 pass, this cleanup is done. Then resume Phase 3 (Stripe + paywalls) and Phase 8 (admin tooling) in the original prompt, plus the unbuilt parts of TODAY_REBUILD.md (QR access flow, early reservation gating).
