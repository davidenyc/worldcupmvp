# Codex Brief — Comprehensive UX overhaul

You (Codex) are executing. Claude (architect/reviewer) is handing you a
multi-hour pass to materially raise the UX bar of GameDay Map. Read this
brief end-to-end before writing code. There is no single-line answer here —
the goal is a coherent, opinionated site that feels like a finished World Cup
2026 product, not a demo.

The deep Google Places scrape (NYC) is complete. Cache files in
`lib/cache/places/` now hold hundreds–thousands of NYC venues. The app must
present them with **clarity, hierarchy, and matchday focus** — not as raw
lists.

---

## 1. Operating principles

Apply these to every component you touch:

1. **One job per screen.** Each page asks the user one question and gives
   them one obvious next action. The homepage asks "what city?". The map
   asks "what country / venue?". The venue page asks "are you going?".
2. **Matchday is the headline.** The product exists for the 2026 tournament.
   Surface match dates, kickoff times, and "watching tonight" everywhere
   relevant. A user who lands during a match week should see today's matches
   above the fold.
3. **Mobile-first, then earn the desktop layout.** Design for 375px first.
   Anything that requires hover, narrow click targets, or precise drag does
   not exist on mobile.
4. **Honest data.** A cultural restaurant that hasn't confirmed TVs should
   say so ("No TVs — book a private event"). A sports bar with a real Google
   rating should show that rating. Don't invent badges or scores.
5. **Cut. Cut. Cut.** When in doubt, remove. Header is overstuffed; left
   sidebar is overstuffed; venue cards are overstuffed. Remove labels that
   don't drive a decision.

---

## 2. Information architecture

Restructure the app's navigation around **three primary jobs**:

| Job | Primary surface | What the user wants |
| --- | --- | --- |
| "Where do I watch tonight?" | `/tonight` route, hero on `/` | Today's matches + 6–10 nearest open watch venues |
| "Where do I watch [country]?" | `/{city}/map?country=X` | Country-tagged venues in selected city |
| "Where do I watch [matchup]?" | `/match/[id]` | A specific upcoming match + recommended venues |

**Header (`components/layout/site-header.tsx`):**
- Mobile: logo, city pill, search, kebab menu (everything else hides into
  this menu).
- Desktop ≥1024: logo, primary nav of EXACTLY 4 items — `Home / Tonight /
  Map / Matches`. Account + Submit + theme toggle live in a top-right
  avatar dropdown.
- "Go Pro" upsell becomes a single discreet star icon next to the avatar,
  not a yellow pill. Premium prompts surface contextually inside the app
  (filter cards, premium-only ranking) — never in the chrome.

**Footer:**
- Trim to: brand, "Add a venue", "About", "Privacy", "Contact". One line on
  desktop, stacked on mobile.

---

## 3. Page-by-page

### 3.1 Homepage (`app/page.tsx`, `components/home/USAHomepage.tsx`)

Goal: in 5 seconds, the user knows what city they're in and what's playing
tonight.

**Above the fold (mobile and desktop):**
- Logo + tagline: "World Cup 2026 watch parties".
- City detector banner — auto-detect via `useUserCity` + IP fallback. Show
  "Watching from New York?" with a CTA button "Yes, show NYC" (default) +
  link "Pick a different city".
- **Today's matches strip** — horizontal scroll on mobile, grid on desktop.
  One card per match playing today (or next match-day if today is empty),
  with country flags, kickoff time in user's TZ, and a "Find a watch spot →"
  link that pre-applies country filter on `/{city}/map`.
- Below: kickoff countdown to opening match (already there — keep, simplify
  styling).
- Primary CTA: "Find your watch party →" linking to `/{city}/map`.

**Below the fold:**
- "How it works" — 3 steps, simple icons, max 60 chars per step.
- "Browse by country" — interactive flag grid (mobile-tappable, desktop-
  hoverable). 48 flags, ordered by popularity for the user's city.
- "Browse by city" — the 17 host city cards that already exist; redesign as
  smaller, denser cards (60% the current vertical real estate).
- "Latest community submissions" — last 5 user-submitted venues, with
  status pill ("Pending review" / "Approved").
- Email capture banner — keep but redesign to feel less like an ad.

**Remove:**
- The two redundant "GAMEDAY MAP / Find your World Cup watch party" hero
  blocks (currently rendered twice — once in hero, once again below).
- Hardcoded "288 demo venues / 192 reservation-ready" — replace with real
  computed counts.

### 3.2 City map page (`app/[city]/map/page.tsx` + `MapPageClient.tsx`)

Goal: a fan picks a venue in <30 seconds.

**Layout (≥1024px):**
- Three columns: filters (240px) | map (flex) | results (380px).
- Filters column: country picker (default top), venue-type chips
  (Bar, Restaurant, Sports Bar — multi-select), date picker (defaults
  today), single "Open now" toggle, "Has TVs" toggle, "Reservations" toggle.
  No more than 7 controls visible at once.
- Map column: Leaflet map fills available height (no Fan Pass overlay).
  Bottom of map: a small "X venues shown" pill with current filter summary.
- Results column: list of venue cards, sorted by relevance. Each card shows:
  - Country flag (if associated)
  - Venue name + neighborhood
  - Rating (Google) + review count
  - "Has TV" / "No TVs" badge
  - "Open now" / "Closes 11pm" status
  - Distance from city center
  - Click → opens venue detail

**Layout (<1024px mobile):**
- Map fills ~55% of viewport, anchored top.
- Bottom 45%: a peek-up bottom sheet with filter chips at the top and venue
  results scrolling. Drag handle to expand to full screen.
- Filters drawer: button at top of map opens a full-screen overlay with the
  same controls as desktop.

**Fan Pass upsell:**
- Out of the right column. Becomes:
  - A single dismissible banner above results (one line, 60px tall):
    "Unlock ranked results, watch-party priority booking, and city alerts —
    Fan Pass $4.99/mo." with X close button.
  - A premium ribbon on results 8+ ("Pro members see 23 more results")
    inside the list when the user scrolls past free-tier limit.

### 3.3 Venue detail (`app/venue/[slug]/page.tsx`)

Sections in this order:
1. Hero photo (or a neutral country-themed graphic if no photo).
2. Name + cuisine/country tag + rating in one row.
3. Quick-action bar: "Get directions", "Call", "Reserve", "Save".
4. Match-day note: "Showing today's USA vs Mexico match? Tap to ask".
   Sends a pre-filled message to the venue (POST to `/api/contact` stub
   for now — capture user's name + email).
5. Address + hours + price level.
6. Photos grid (Google Places photos).
7. "Other venues for [country]" carousel.
8. "Report an update" form at bottom (already partly there — clean it up).

### 3.4 Tonight page (`/tonight`)

This may not exist yet — create it. Show:
- Today's matches in user's TZ. Sort by kickoff.
- For each match: 4 recommended NYC venues, ranked by:
  1. Country-association match (e.g., for USA-Mexico, show Mexican
     restaurants + sports bars equally)
  2. `gameDayScore`
  3. Distance to user (if geolocated)
- "See all venues for this match →" link to filtered map.

### 3.5 Submit (`app/submit`)

Trim form to 5 fields: venue name, address, country association
(autocomplete), notes, email. Add an inline "we'll review within 48 hours"
microcopy.

---

## 4. Visual design

**Type scale** — set in `tailwind.config.ts` if not already:
- Display (homepage hero): 56px / 48px line-height / -1.5px letter / 700
- H1 (page titles): 32px / 38px / -0.5px / 600
- H2: 24px / 30px / -0.25px / 600
- Body: 16px / 24px / 0 / 400
- Small: 13px / 18px / 0 / 500

**Color tokens** (`app/globals.css` `:root`):
- Already defined. Don't add more. Use the existing `--ink`, `--surface`,
  `--gold`, `--red`. Do NOT introduce new hex values inline — refactor any
  inline `text-[#0a1628]` / `bg-[#f8fbff]` to semantic Tailwind tokens
  defined in tailwind config.

**Spacing rhythm** — every container uses multiples of 4. No `p-3` (12px)
mixed with `p-4` (16px) in the same row; pick one.

**Radius** — tokens: `rounded-2xl` (cards), `rounded-full` (pills/buttons).
Eliminate `rounded-[1.75rem]`, `rounded-[1.2rem]`, etc. inline arbitrary
radii.

**Shadows** — exactly two: `shadow-card` (default) and `shadow-popover`
(elevated). Define both in `tailwind.config.ts` if not present.

**Iconography** — `lucide-react` is installed. Replace inline SVGs in
`site-header.tsx` (Search, Heart) with `lucide-react` imports for
consistency. Remove the `_lucideIcons` dead-code block.

**Empty states** — every list/grid in the app gets an empty state
component: friendly illustration (use a country emoji + small illustration),
one-line explanation, and a CTA. No bare "No results found" text.

**Loading states** — every async data load gets a skeleton, not a spinner.
Use Tailwind `animate-pulse` on shaped placeholders matching the eventual
content.

---

## 5. Component cleanup tasks

For each of the following components, audit and slim down:

- `components/layout/site-header.tsx` — already over-wide; collapse
  per §2 above.
- `components/map/MapPageClient.tsx` — remove the embedded Fan Pass panel.
  Move filter controls into the new left column or mobile drawer.
- `components/map/MapResultsPanel.tsx` — redesign card per §3.2.
- `components/home/USAHomepage.tsx` — remove duplicate hero, replace
  hardcoded counts.
- `components/home/HomeHeroActions.tsx` — make the primary CTA larger and
  more prominent on mobile.
- `components/home/NorthAmericaMap.tsx` — used as illustration on home; if
  it's not interactive, drop it in favor of a simpler "17 cities" stat.
  If interactive, ensure city dot tap targets are ≥44px on mobile.
- `components/venue/venue-card.tsx` — simplify to the §3.2 spec.
- `components/venue/venue-hero.tsx` — match §3.3.
- `components/membership/UpgradeModal.tsx` — make sure it's modal-only,
  never an inline panel.

---

## 6. Hard rules

- **DO NOT modify** `scripts/seed-places-nyc-deep.ts` (Claude owns).
- **DO NOT modify** `components/map/world-map.tsx` (name-matching is fixed).
- **DO NOT regenerate or overwrite** any `lib/cache/places/nyc-*.json`.
- **DO NOT modify** the `Venue` type in `lib/types.ts`. Add optional fields
  if you really need them; never remove or rename existing ones.
- **DO NOT add new dependencies** without justification. lucide-react,
  Leaflet, react-simple-maps, Tailwind, Sonner, Zustand, react-hook-form,
  Zod are already there — that's enough.
- Keep `DATA_PROVIDER=mock` as the default. The Google scrape's data is
  served via the same provider abstraction; don't bypass it.

---

## 7. Acceptance criteria

Empirical, not aspirational. Each must be testable.

1. At 375×667, no horizontal scroll on `/`, `/{city}/map`, `/venue/[slug]`,
   `/tonight`, `/submit`.
2. Header has ≤4 visible nav items on desktop; mobile header collapses to
   logo + city + search + menu (≤4 items).
3. No hardcoded venue counts on `/`. All counts computed from
   `getMapPageData()` or equivalent.
4. Today's matches strip on `/` populates from `lib/data/matches.ts`. If
   no match today, fallback to "Next match in N days".
5. `/{city}/map` results panel shows binary "Has TV" or "No TVs" badge —
   no fabricated screen counts.
6. Fan Pass upsell does not occupy a full column on `/{city}/map`. Visible
   only as dismissible banner OR triggered modal.
7. Empty states everywhere lists could be empty (no venues, no matches,
   no submissions).
8. Skeleton loaders on async-fetched content; no full-page spinners.
9. `npx tsc --noEmit` → 0 errors.
10. `npm run build` → green.
11. Manual visual sweep at 375 / 768 / 1024 / 1440 / 1920 widths in light
    AND dark mode — paste DevTools screenshots for at least 3 viewports
    of `/` and `/{city}/map`.

---

## 8. Suggested commit structure

To keep the PR reviewable:

1. `chore: extract design tokens to tailwind.config.ts`
2. `feat: header IA collapse to 4-item desktop nav + avatar menu`
3. `feat: homepage hero rebuild with today's matches strip`
4. `feat: /tonight route with match-tagged venue list`
5. `feat: map page filter restructure + Fan Pass upsell move`
6. `feat: venue card redesign + Has-TV badge`
7. `feat: venue detail rebuild`
8. `feat: empty + loading states across the app`
9. `chore: replace inline SVGs with lucide-react`
10. `chore: replace inline arbitrary colors with tokens`

---

## 9. Report back

When you're done OR cap out at 6 hours of work, report:
1. Files changed (paths only).
2. Which acceptance criteria are met vs deferred.
3. Screenshots from 3+ viewports.
4. `tsc --noEmit` and `next build` output.
5. The Vercel preview URL.

Claude will fetch the preview, walk through it in Chrome, and do a critique
pass against the brief.
