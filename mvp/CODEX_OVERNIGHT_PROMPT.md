# GameDay Map — Overnight Build Prompt

You are working on the GameDay Map web app (World Cup 2026 fan venue finder), running locally at http://localhost:3001. Tonight's run is open-ended — work through every phase below in order, ship verified fixes, and do not stop until either every phase is complete or you hit a blocking ambiguity. Take screenshots at every phase boundary, keep the dev server running, and do not break existing functionality.

Operating rules for this run:
- ZERO DEAD BUTTONS. Every button, link, dropdown item, toggle, checkbox, and form on every route must do something real and observable. If a feature is intentionally not yet built, the control is either hidden or shows an explicit, branded "Coming soon" tooltip — never a silent no-op. This is the single most important rule of the run; ship-readiness is gated on this.
- ZERO DEAD ROUTES. Every link in every nav (top, mobile bottom, footer, in-page CTAs) must resolve to a real working page, not a stub.
- MONEY PATHS ALWAYS COMPLETE. Every upgrade CTA, paywall, "Go Pro", "Upgrade to Fan Pass", "See Fan Pass & Elite Plans", "Reserve", "Notify Me", and "Create watch party" button must complete its full happy-path end-to-end during your own QA. No half-wired flows.
- Verify every fix yourself by reloading the affected page and confirming the bug is gone with a screenshot.
- After each phase, run `npm run build` (or the project's equivalent) and ensure zero type errors and zero console errors.
- After each user-facing phase, run the click-through script from Phase 9.5 over the routes touched in that phase and confirm 0 dead controls before moving on.
- Keep commits small and labeled by phase (e.g. `phase-2: city map render`).
- Where you must invent copy, keep brand voice: confident, fan-first, no marketing fluff.
- Where data is missing for a non-NYC city, do NOT hardcode placeholders — make the empty state graceful AND make the data import path trivial (see Phase 1).
- Never display internal/debug strings to end users (e.g. "Imported from Google Places", "verified via name match", "Country assignment via name match"). Replace with curated copy or remove.

============================================================
PHASE 0 — Smoke + audit baseline (before you change anything)
============================================================
0.1 Take a screenshot of every primary route at desktop (1440), tablet (768), mobile (390) widths. Save to `/audit/screenshots/{phase-0}/{route}.png`. Routes to capture:
    /, /tonight, /nyc/map, /la/map, /mex/map, /tor/map, /nyc/matches, /membership, /account, /saved, /search, /search?city=nyc, /submit, /groups, /country/brazil, /country/japan, /country/usa, /venue/nyc-usa-the-u-bar-and-grill, /privacy, /terms, /about.
0.2 Capture console errors per route. Write `/audit/baseline.md` listing every error and warning by route. This is the regression baseline.

============================================================
PHASE 1 — Venue data layer rebuild for bulk ingestion
============================================================
We will be pasting in hundreds of venues across all 17 host cities over the next 24–72 hours. The data layer must be ready.

1.1 Define a single canonical Venue schema (TypeScript type + Zod validator). Required fields:
    id (slug-stable, deterministic from city + name), name, city_code (NYC, LAX, DAL, SFO, MIA, SEA, BOS, PHL, KAN, ATL, HOU, LAS, TOR, VAN, MEX, GDL, MTY), country_code (ISO-2 of the supporter base or "MIXED"), neighborhood, address_line, lat, lng, phone, website, instagram, reservation_url, capacity_band ("<30","30-60","60-100","100-200","200+"), price_band ("$","$$","$$$","$$$$"), venue_type ("sports_bar","cultural_bar","cultural_restaurant","bar_with_tvs","fan_fest","supporter_club","cafe","lounge","other"), atmosphere ("low","medium","high"), screens (int), has_projector (bool), has_outdoor (bool), accepts_reservations (bool), family_friendly (bool), supporter_club_official (bool), tags (string[]), photo_urls (string[]), match_focus (array of match_ids that especially fit), source ("seed","community","partner","import"), verified (bool), submitted_by, submitted_at, last_verified_at, hot_spot (bool — premium "Hot Spot" badge), sponsored (bool — for paid placements), notes_md (markdown blurb).

1.2 Move venue data out of any inlined arrays into `/data/venues/{city_code}.json` files. Add a top-level `/data/venues/index.ts` that loads all city files at build time and exposes typed selectors: `getVenuesByCity(code)`, `getVenuesByCountry(code)`, `getVenueById(id)`, `searchVenues(query)`, `filterVenues(predicate)`.

1.3 Build an import CLI: `npm run venues:import -- --file=incoming.csv --city=NYC` that reads a CSV (or JSON), validates each row against the Zod schema, dedupes by id, merges into the existing city JSON, and writes back. Report: rows added, rows skipped (with reason), rows updated. Add a `--dry-run` flag.

1.4 Build a second CLI: `npm run venues:export -- --city=ALL --format=csv` that writes a tidy CSV ready for me to hand to a sourcing agent and re-import.

1.5 Build a `/data/matches/2026.json` source of truth for the WC schedule with full coverage of all 104 matches across all 17 host cities — including Las Vegas (Allegiant) and Monterrey (Estadio Universitario). Every match must have: id, group_or_round, home_country, away_country, kickoff_iso, stadium, host_city_code. If you cannot find official 2026 fixtures for a city, mark that city's matches with `tbd: true` rather than fabricating.

1.6 Wire every page that previously read venues from inline arrays through the new selectors. Verify no page imports raw JSON directly anywhere except `/data`.

1.7 Add a compile-time check: build fails if any venue is missing required fields, has invalid lat/lng, or has a duplicate id.

============================================================
PHASE 1.5 — Theme parity (DARK + LIGHT) — CRITICAL, do this before further visual work
============================================================
The app currently has visible theme breakage that makes whole sections unreadable. Canonical bug to reproduce: open `/nyc/map` in dark mode, click any venue pin so the right-side venue card opens. The card renders on a near-white surface while the text and pills inside it still use dark-mode foreground tokens — result is white-on-white labels and yellow-on-cream "Fan Pass members see all N venues" copy. Same class of bug exists across the venue card, fan-pass upsell card, atmosphere pills, and the "Reserve" CTA.

This is a token-system problem, not a one-component fix. Solve it systemically:

1.5.1 Define a single design-token layer in CSS variables (or Tailwind theme extension) with semantic names — never raw hex literals in components. At minimum:
    --bg-page, --bg-surface, --bg-surface-elevated, --bg-surface-inverse,
    --fg-primary, --fg-secondary, --fg-muted, --fg-on-accent,
    --border-subtle, --border-strong,
    --accent, --accent-fg, --accent-soft-bg, --accent-soft-fg,
    --success, --warning, --danger,
    --pill-bg, --pill-fg, --pill-border,
    --country-flag-bg (subtle tint behind flag chips).
    Each token has a dark value and a light value. The toggle flips the root data-theme attribute; nothing else should change.

1.5.2 Find and remove every hardcoded color in components (`text-white`, `bg-[#0b1020]`, `text-black`, raw `#fff`, `rgba(0,0,0,...)`, `bg-slate-900`, etc.). Replace with the semantic token. Lint rule: `no-restricted-syntax` to forbid hex literals in JSX/TSX outside of `/styles/tokens.css`.

1.5.3 Audit and fix every surface that flips wrong:
    - Right-side venue card on /{city}/map (the bug in the screenshot).
    - "Fan Pass members see all N venues ranked by quality" callout.
    - Atmosphere pills (HIGH/MEDIUM/LOW), country pills (e.g. "SPAIN BAR"), price pills.
    - "Reserve" / "Directions" / "Details" buttons inside venue cards.
    - The blank-skeleton loaders on /saved and /search (they are white in dark mode).
    - Submit form inputs (placeholders, borders, focus rings).
    - Membership pricing cards (gold border + dark bg works in dark, must work in light).
    - Account page profile header.
    - Tonight's countdown numbers and email-capture card.
    - Footer.
    - Modal/toast surfaces once Phase 7 adds them.

1.5.4 Visual regression: take a screenshot of EVERY route (the Phase 0 list) in BOTH themes, side by side, save to `/audit/screenshots/phase-1.5/{route}-{theme}.png`. Manually scan every screenshot for white-on-white, black-on-black, low-contrast pills, or invisible borders. Fix until none remain.

1.5.5 Contrast check: every text/bg combination must meet WCAG AA (4.5:1 for body, 3:1 for large text). Run `axe-core` on every route in both themes and fix all contrast violations.

1.5.6 Theme toggle behavior:
    - Persist to localStorage as `theme: light | dark | system`.
    - Honor `prefers-color-scheme` when set to `system`.
    - No flash-of-wrong-theme on load (inline a tiny script in `<head>` that reads localStorage and sets `data-theme` before React hydrates).
    - The toggle pill should appear in the More menu on desktop and in the Account screen on mobile.

1.5.7 Acceptance gate: do not proceed to Phase 2 until a reviewer can flip the theme on every primary route and see ZERO illegible text, ZERO mismatched surfaces, and ZERO color-only signals (every status uses both color and an icon/label).

============================================================
PHASE 2 — City map component (CRITICAL)
============================================================
The /{city}/map listing map renders blank everywhere. The /venue/... single-venue map works. Reconcile.

2.1 Identify why the multi-venue map's tile container has zero usable height OR why its init runs before its container mounts. Common causes: parent flex container without explicit height, SSR hydration mismatch, missing `mapboxgl-canvas` class, missing token at the listing-page boundary. Fix it.

2.2 Make the city map component generic and city-aware. Reading `/{city}/map` should:
    - Center on that city's bbox (use a `/data/cities.ts` constant with bbox + center for all 17).
    - Plot every venue belonging to that city (color-coded by venue_type).
    - Show clusters above ~50 visible pins.
    - When a venue card is hovered/clicked in the sidebar, fly-to and pulse that pin.
    - Show a "no venues yet — submit one" empty state for cities without data.

2.3 Replace the home page "North America" dot scatter with an actual styled Mapbox/MapLibre static-style map of NA, with one labeled pin per host city. Labels must NOT overlap pins (right now NYC label clips into the NYC dot). On click → `/{city}/map`.

2.4 De-duplicate the filter panel: it currently renders twice in the DOM on /nyc/map. Render exactly one filter component, swap its layout via CSS at the breakpoint, never duplicate the node.

============================================================
PHASE 3 — Monetization expansion (this is the revenue work)
============================================================
The owner explicitly said: "more filters and features = more money." Build out the gated/premium surface so Fan Pass and Supporter Elite tiers each unlock real, distinct value.

3.1 Build the full filter set (all should work for free users on a *limited* basis, then gate higher fidelity behind tiers):
    - Country supporter base (Free: 2 countries; Fan Pass: all 48; Elite: all 48)
    - Match (filter venues by which match they're best for; pulls match_focus + neighborhood + nationality)
    - Venue type (sports bar / cultural bar / cultural restaurant / bar w/ TVs / fan fest / supporter club / cafe)
    - Capacity band
    - Price band
    - Atmosphere (low / medium / high)
    - Reservations available toggle
    - Walk-in only toggle
    - Outdoor seating toggle
    - Projector / screen count threshold
    - Family friendly toggle
    - Open now toggle (computed from venue.hours)
    - Distance from me (geolocation; "near me" requires Fan Pass)
    - Neighborhood multi-select per city
    - Sort: highest rated / largest capacity / nearest / most likely to have my country's crowd / official supporter clubs first
    Persist filter state in URL query string so it's shareable. Show count of matches.

3.2 Build the Premium surface and *actually* gate it:
    - Fan Pass ($4.99/mo) unlocks: all 48 country filters, unlimited saves, reservation request inline, "near me" + open-now filters, advanced filters (capacity/price/atmosphere), Hot Spot badges, save matches to calendar (.ics export), email match alerts, country trip-planner page (next gameday + best venues + group code).
    - Supporter Elite ($12.99/mo) unlocks: everything in Fan Pass + push notifications, venue concierge (a contact form that emails the venue on the user's behalf and tracks status), early access to new venue drops, group booking with capacity holds, partner discounts page (placeholder cards), priority Submit-a-Venue review, custom group page with shareable URL.
    - Build a real Stripe Checkout integration (test mode) for both tiers. On success, write a `membership: { tier, since, renews_at }` to the user record. Local dev can use a faux JWT in localStorage if Stripe webhooks aren't set up — but route through real Stripe Checkout.
    - Show a sticky bottom upgrade bar on free-tier sessions when they hit a gate (with X to dismiss for the session).
    - Add the "Restore purchase" link on /account.

3.3 Ad / partner placements (revenue beyond subs):
    - Add a `sponsored` flag on venues. When true, show a "Featured" pill, pin them at top of city map results, and on the home city card.
    - Build a /partners page with a contact form: "Get featured" / "Reservations API" / "Bulk venue licensing". Send to a configurable email.

3.4 Affiliate scaffolding:
    - On match cards, add a "Buy match-day kit" link that points to a configurable affiliate URL keyed by country (default to Fanatics search).
    - On venue cards, add an OpenTable / Resy / Tock deep link if reservation_url is present.

3.5 Referral loop:
    - On /account, generate a unique referral code and share URL. Track referrals client-side for now (localStorage). When a referred user upgrades, give referrer 1 free month (record intent server-side via a stub `/api/referral/credit` endpoint).

3.6 Revenue-path activation — every CTA in the app must complete a real flow during your own click-through QA. Walk this list end-to-end yourself before moving to Phase 4:
    - Home "Find a watch spot →" → /{user_city}/map with default filters applied.
    - Home "⭐ Go Pro" / nav star icon → /membership with `return` querystring → upgrade flow → return to origin route on success.
    - Home "Notify Me" email capture → POST to /api/leads → success toast + persisted to /data/leads.jsonl → de-duped on retry.
    - Home country chip (any of the 48) → /country/{slug}.
    - Home city card "Open city →" → /{city}/map with that city's data.
    - Home "See Fan Pass & Elite Plans" → /membership.
    - Home "Demo mode — upgrade free today" — either remove (it's confusing) OR convert into a real one-click "Try Fan Pass free for 7 days" trial that creates a Stripe trialing subscription.
    - Tonight email capture → same /api/leads path, separate source tag.
    - Tonight match card "Find bars for this match →" → /{city}/map?match={id} with the match filter pre-applied.
    - Map filter toggles → URL updates → results re-filter live → URL is shareable (paste in fresh tab and same filters apply).
    - Map "Show all" → drops the visible-bbox limit and renders every venue.
    - Venue card "Reserve" → opens reservation_url in a new tab (or in-app modal for partner venues) and logs intent to /api/intent.
    - Venue card "Directions" → opens Google Maps directions deep link.
    - Venue card "Details" → /venue/{id}.
    - Venue page "Save" → optimistic save + persist + free-tier limit enforced + upgrade modal on hit.
    - Venue page "Share this spot" → native share sheet on mobile, copy-to-clipboard with toast on desktop.
    - Venue page "Create watch party" → opens the modal from Phase 6.6 → produces a /groups/{code} URL that actually works.
    - Membership "Upgrade to Fan Pass" / "Upgrade to Supporter Elite" → Stripe Checkout (test mode) → returns to /account on success → tier visibly upgrades → gated features unlock immediately.
    - Membership "Restore purchase" → Stripe customer portal session.
    - Account "Manage billing" → Stripe customer portal session.
    - Account "Sign out" → clears session, returns to home.
    - Submit-a-venue form → POST to /api/submissions → row written to /data/submissions.jsonl → confirmation page with a tracking ID → row appears in /admin/venues.
    - Footer links: every one resolves to a real page.
    - "Preview instant demo upgrade" link on the Fan Pass paywall — either kill it OR make it a real one-click toggle that grants 24h Fan Pass for testing (writes a `demo_until` timestamp to localStorage).

3.7 Aggressive upsell surface — show clear, tasteful upgrade prompts at high-intent moments. None of these should be persistent nags; each disappears once acknowledged or the user upgrades.
    - When a free user attempts a 3rd country filter.
    - When a free user attempts a 6th save.
    - When a free user opens a venue page and the "Make a reservation request" button is dimmed.
    - When a free user clicks "Match alerts".
    - On Tonight when there are 3+ matches that day (Elite-only push notifications).
    - On the venue concierge form (Elite-only).
    - All upsell modals must include: tier benefits, price, "Maybe later" dismiss, AND a "What's the difference?" link to /membership.

============================================================
PHASE 4 — Tonight page expansion
============================================================
Owner specifically called this out: Tonight should include restaurants, more filters, more features.

4.1 Tonight currently shows "today's matches" + a tiny NYC bars list. Rebuild as the highest-engagement landing surface for an active tournament:
    - Hero: "Tonight in {detected_city}" with a city switcher (defaults to user's saved city or geolocated nearest host city).
    - For every match in the next 24 hours: a card with kickoff in user's timezone, both flags, stadium, group/round, "Top 5 spots in {city}" preview, a "View all watch spots" CTA.
    - Tonight filters (above the match list): country I'm rooting for, food/drink preference (full restaurant vs bar with TVs vs sports bar vs fan fest), reservations available, groups welcome, distance from me.
    - Add a "Tonight's restaurants" section separate from bars: same UI, filtered to venue_type in [cultural_restaurant, restaurant_with_tvs]. The user wants restaurants surfaced.
    - Add a "Tonight at a glance" digest card that summarizes the night: matches, weather (use a free API like Open-Meteo, NOT a paid one — read the city center lat/lng from /data/cities.ts), and a single recommended pick per match.
    - Add a "Set city as default" button that saves city preference.

4.2 Email capture on /tonight should hit a real `/api/leads` endpoint that writes to `/data/leads.jsonl` (one JSON line per signup) so we can move them to a real CRM later. Validate email, prevent duplicates, return user-visible success/error states.

4.3 Add iCal download for any match: `GET /api/match/{id}/calendar.ics` returns a valid VEVENT with reminder.

============================================================
PHASE 5 — Saved + Search + Account (currently stubs)
============================================================
5.1 /saved currently renders empty skeletons. Build it:
    - Lists saved venues, grouped by city, with quick filters (country, match).
    - Each card has Remove, Share, Add to Group, Open Directions.
    - Free tier: 5 saves max, with a clear "Upgrade to save unlimited" CTA when limit hit.
    - Persist saves to localStorage now; design API surface (`/api/saves`) for future server backing.

5.2 /search currently renders empty skeletons. Build it:
    - Top-of-page search across venues, matches, and countries with instant fuzzy results (use Fuse.js or similar).
    - Filterable by city. Keyboard navigation.
    - Empty-state suggests popular searches (e.g. "Brazil bars NYC", "Mexico games tonight").

5.3 /account:
    - Real edit profile (display name, home city, supporter country).
    - Membership: show current tier, billing date, manage in Stripe customer portal.
    - Notification preferences (email match alerts on/off, push on/off if supported).
    - Saved venues count, saved matches count, referral code.
    - Replace the soccer ball placeholder avatar with initials-based default.

============================================================
PHASE 6 — Venue detail page polish
============================================================
6.1 Remove all debug-looking copy:
    - "Imported from Google Places with name match: grill" → replace with curated 1-line "Why we picked this spot" generated from venue tags + atmosphere + country (e.g. "High-energy USA bar with 8 screens — strong group atmosphere on match day").
    - "Country assignment verified via name match" → remove entirely.
    - The auto-generated amenities tag soup ("usa cuisine", "8 screens") should be filtered to humans-readable only.
6.2 Replace the random purple banner with a brand-colored one (use the gold token already in the design system; on cultural bars use a country-flag-tinted gradient subtle, not loud).
6.3 If photo_urls is empty, show a designed empty-state hero (city skyline silhouette with country flag overlay) — never a flat gray rectangle.
6.4 Add: "Best for" computed pill (e.g. "Best for groups of 6+", "Best for Brazil supporters") based on capacity_band and country_code.
6.5 Add an "Other spots nearby" rail of 4 cards.
6.6 Add a "Create watch party" button that opens a modal: prompts for match selection + group size + name, generates a /groups/{code} URL, copies to clipboard.

============================================================
PHASE 7 — Cross-cutting UI polish
============================================================
7.1 Header/nav:
    - At ALL widths above 600px, never wrap or clip pills. Primary nav is exactly: Home / Tonight / Map / Matches / Membership. Secondary actions (Saved, Account, theme, search, Submit) collapse into a "More ▾" menu and a search icon.
    - On mobile (<600px), bottom-fixed nav with: Home / Tonight / Map / Matches / Account. Include a center "+" FAB for Submit-a-Venue.
    - Fix the empty white circle that appears at certain widths next to Account.
7.2 Logo: ship a real GameDay Map SVG logo (gold "GM" monogram → ball icon variant). No empty circles.
7.3 Country flag rendering: replace `🏴` (England, Scotland) with proper subdivision sequences `🏴󠁧󠁢󠁥󠁮󠁧󠁿`/`🏴󠁧󠁢󠁳󠁣󠁴󠁿`. If those don't render on Windows Chrome, fall back to inline SVGs in `/public/flags/`. Test on Windows.
7.4 Theme: already handled in Phase 1.5. In this phase, only re-verify that any new components added in Phases 2–6 (admin tables, group pages, modals, toasts, OG previews, calendar export UI, paywall sticky bar) ship with both themes verified and added to the Phase 1.5 visual-regression set.
7.5 Replace every 📍 emoji used as a UI badge with an inline SVG pin from a single icon set (lucide-react). Same for 🍺/⚽/📺.
7.6 Add proper loading skeletons (shimmering, not blank white boxes) and graceful empty states for every list.
7.7 Add an OG image generator (Vercel OG or similar) so every share link to a venue, country, match, or city has a custom social card.
7.8 Add a global toast system for success/error messages.

============================================================
PHASE 8 — Architecture for the bulk venue dump
============================================================
The owner is sourcing hundreds of venues tonight. Make absolutely sure the system is ready.

8.1 Stress test: synthetically generate 1,000 venues per city across all 17 cities (17,000 total) using realistic mock data (Faker), shove through the import CLI, then run the dev server. Pages must render in <2s. If they don't, add pagination, virtualization (react-virtuoso), and proper indexing on the venue search.

8.2 Add a `/admin/venues` route (gated by an `ADMIN_PASSWORD` env var) with a table view: search, filter by city/country, edit row inline, mark verified, mark hot_spot, mark sponsored, soft-delete. Saves write back to `/data/venues/{city}.json` via a server action.

8.3 Add a `/admin/import` route that lets me paste CSV text, preview the parsed rows, and commit. Shows validation errors per row.

8.4 Add a `/admin/dashboard` showing: total venues per city, % verified, % with photos, % with reservations, leads collected, signups by tier, top 10 most-saved venues, top 10 most-searched countries.

8.5 After running the synthetic stress test, REMOVE the synthetic data and commit a clean tree. Leave the import CLI and admin tooling in place.

============================================================
PHASE 9 — SEO + crawlability
============================================================
9.1 Generate static pages at build time for: every venue, every match, every country (all 48), every city (all 17). Currently only Brazil's country page exists at `/country/brazil`.
9.2 Add `sitemap.xml` and `robots.txt`.
9.3 Add proper `<title>`, `<meta description>`, and structured data (JSON-LD `LocalBusiness` for venues, `SportsEvent` for matches, `Place` for cities).
9.4 Add canonical URLs.
9.5 Add `lang` and `hreflang` for English/Spanish given the Mexico hosts (Spanish translations can be auto-generated via a single LLM pass into `/i18n/es.json` — wire i18n now even if EN is the only complete locale).

============================================================
PHASE 9.5 — Total functional QA: every interactive element on every route
============================================================
This phase exists because the app is rolling out very soon and there cannot be a single dead button. Spend as long as it takes.

9.5.1 Build a Playwright suite at `/tests/e2e/click-through.spec.ts` that does the following on every route in the audit list (desktop + mobile viewports, both themes):
    - Enumerate every clickable element: `button`, `a[href]`, `[role="button"]`, `input[type=submit]`, `[onclick]`, `[role="menuitem"]`, `[role="tab"]`, label-bound inputs.
    - Click each one (skipping destructive actions like sign-out and pay-now after the first verified pass).
    - For each click, assert at least one of: navigation occurred, network request fired, DOM mutation occurred, modal/toast/drawer opened, URL query/hash updated. If none — FAIL with the element's selector and route.
    - For every form field: focus, type, blur, and confirm validation messages render with correct theme colors.
    - Run the suite headless in CI mode and write `/audit/click-through-report.json` with pass/fail per element.

9.5.2 Manually walk these surfaces on a real desktop browser AND a real mobile viewport (390px). Treat each as a checklist; do not ship until every item is ✓:

    HEADER (every width):
    - Logo links to /
    - Home / Tonight / Map / Matches / Membership all navigate
    - City switcher dropdown opens, lists all 17 cities, selecting one updates URL and filters
    - "More" menu opens, contains Saved / Account / Submit / theme toggle / sign in/out, every item works
    - Search icon opens /search OR an inline search drawer
    - Star/Go Pro pill links to /membership and preserves the return URL
    - Account avatar opens account menu (signed-in) or auth modal (signed-out)
    - Theme toggle flips theme with no flash, persists across reloads
    - On mobile (<600px) the bottom-fixed nav has Home / Tonight / Map / Matches / Account, the center "+" FAB opens Submit
    - At every viewport width from 320px → 1920px in 80px increments, NO pill wraps, clips, or overlaps

    HOME:
    - Countdown ticks every second
    - Hero "Find a watch spot →" navigates correctly
    - The North America map's 17 city pins are all clickable and routed
    - All 17 city cards' "Open city →" buttons work and route to the right city
    - Country search input filters the country grid live
    - Every one of the 48 country chips routes to /country/{slug}
    - "See Fan Pass & Elite Plans" routes to /membership
    - Email capture validates + posts + shows real success/error states

    TONIGHT:
    - City switcher works
    - Filters apply live and update URL
    - Every match card's "Find bars" CTA routes correctly
    - Restaurants section renders (Phase 4)
    - "Set city as default" persists
    - Calendar download produces a valid .ics that imports into Apple/Google Calendar

    MAP (each of the 17 cities):
    - Map tiles render
    - Pin clusters work; clicking a cluster zooms in
    - Clicking a pin opens the right-side card
    - Right-side card contents fully readable in BOTH themes (Phase 1.5 gate)
    - Every filter (venue type, country, match, capacity, price, atmosphere, reservations, walk-in, outdoor, family, open now, near me, neighborhood) toggles correctly and persists in URL
    - Sort dropdown reorders results
    - "Show all" / "Zoom in to reveal more" interactions work
    - "Fan Pass members see all N venues ranked by quality" — the upsell card itself is clickable and routes to /membership

    MATCHES:
    - All / At {stadium} tabs filter correctly
    - "Find watch spots near you" routes correctly
    - Group Stage / Round of 32 / etc filter chips work
    - Calendar export per match works

    VENUE PAGE:
    - Save button toggles state with optimistic UI and persists
    - Share button works (native sheet on mobile, clipboard + toast on desktop)
    - Reserve button opens reservation_url
    - Directions opens Google Maps deep link
    - Single-venue map renders and is interactive
    - "Other spots nearby" rail cards all route correctly
    - "Create watch party" modal opens, completes, generates a working /groups/{code} URL
    - Fan Pass paywall card upgrade button works
    - "Preview instant demo upgrade" actually grants demo or is removed

    MEMBERSHIP:
    - "Current Plan ✓" reflects real tier from auth state
    - Upgrade to Fan Pass → Stripe Checkout test mode → success → returns + reflects new tier
    - Upgrade to Supporter Elite → same
    - "Restore purchase" → customer portal
    - Tier feature comparison rows are accurate to what's actually gated

    ACCOUNT:
    - Edit profile saves
    - Notification preferences persist
    - Membership panel matches Membership page state
    - Referral code copies to clipboard
    - Sign-out works

    SAVED:
    - Renders saved venues (or correct empty state, never blank skeletons)
    - Remove / Share / Add to Group / Directions all work per card
    - Free-tier limit enforced with upgrade prompt

    SEARCH:
    - Live fuzzy search across venues + matches + countries
    - Keyboard nav (arrows + Enter)
    - City filter works
    - Recent searches persist

    SUBMIT:
    - All fields validate inline
    - Submit posts to /api/submissions and shows confirmation
    - Submission appears in /admin/venues
    - Required fields enforced

    GROUPS:
    - "Find a venue" CTA routes to map
    - Join code form actually validates and joins
    - Created groups show member list and chat or message board (Phase 6.6 / 3.5)

    ADMIN (Phase 8):
    - Login gate works
    - Table edit-in-place persists
    - Import CSV preview + commit works
    - Dashboard charts render real numbers

    FOOTER:
    - Every link works on every page

9.5.3 Inventory of every "Coming soon" surface: write `/audit/coming-soon.md` listing any control that intentionally defers. If the list is non-empty, each item must have a tooltip / inline note explaining the deferral, and a target date. The owner needs to see this list to approve the launch.

9.5.4 Edge cases to verify by clicking, not assuming:
    - Logged-out user → click any gated feature → lands on /membership with `return` preserved → completes upgrade → returns to original action which now succeeds.
    - Free user at country-filter limit → 3rd selection triggers upsell → "Maybe later" closes it → 3rd country is NOT applied (limit enforced in backend, not just UI).
    - Refresh in the middle of any modal/flow → app does not crash.
    - Browser back from /venue/{id} returns to /map with prior filters intact.
    - Direct deep link to /map?country=BRA&match=match-001 loads with filters applied.

9.5.5 Acceptance gate for Phase 9.5: zero failures in the Playwright suite, zero items left unchecked in 9.5.2, `/audit/coming-soon.md` reviewed and minimal.

============================================================
PHASE 10 — Final QA pass
============================================================
10.1 Re-run the Phase 0 audit. Diff baseline vs. now. Every previous error should be fixed; no new errors introduced.
10.2 Lighthouse: each main page >90 perf, 100 a11y, 100 SEO, 100 best-practices. Fix until met.
10.3 Run through these user journeys end-to-end and screenshot each:
    a) "I'm a Brazil fan in NYC, find me a spot for the Brazil-Morocco match" → Tonight → filter Brazil → click match → see venues → reserve.
    b) "I'm in Houston, where do I watch Germany-Curacao tonight" → city switch to HOU → Tonight.
    c) "Save 6 venues" → hits free-tier paywall on 6th → upgrade to Fan Pass via Stripe test card → unlimited saves work.
    d) "Submit my own bar" → form → validation → success → it appears in /admin/venues for review.
    e) "Share a watch party" → venue page → Create Group → URL copied → friend opens URL and joins.
10.4 Write `/audit/phase-10-report.md` summarizing: every phase's outcome, every screenshot path, every test journey result, and any items intentionally deferred.

============================================================
Stop conditions
============================================================
- All phases complete and Phase 10 report written.
- OR: a single ambiguity blocks 2+ phases (in which case, leave a clear question in `/audit/blocked.md` and continue with the remaining unblocked work).

Begin Phase 0 now.
