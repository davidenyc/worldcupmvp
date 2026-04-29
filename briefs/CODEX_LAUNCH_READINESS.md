# CODEX BRIEF — LAUNCH READINESS PASS

**One sentence:** Clean up the dirty tree, tokenize every hardcoded color hex across the entire app (351 hits, 47 files), add the missing "I watched this" match-check-in UI, build a real marketing landing for first-time visitors, ship a proper PWA install banner, generate per-route OG images, and bolt error boundaries onto the critical auth + billing flows — single branch, ~22 commits, designed to run overnight.

**Branch:** `feat/launch-readiness`
**Hard rule:** Local dev only. No Vercel push.
**Hard rule:** Server Components NEVER pass functions to Client Components.
**Hard rule:** Capacitor-safe — no `window.*` or `localStorage` at module top-level.
**Hard rule:** No new top-level npm dependencies.
**Hard rule:** Every commit must leave the codebase in a working state. `pnpm build` must succeed at every commit boundary.
**Hard rule:** Use the existing design tokens (`bg-bg`, `bg-surface`, `bg-surface-2`, `text-deep`, `text-mist`, `bg-gold`, `border-line`, `text-[color:var(--fg-primary)]`, `text-[color:var(--fg-secondary)]`, `text-[color:var(--fg-muted)]`, `text-[color:var(--fg-on-accent)]`, `bg-[var(--accent-soft-bg)]`, `text-[color:var(--accent-soft-fg)]`, etc.). The brief never introduces new color hexes — it removes them.

---

## 0. WORKING-TREE CLEANUP (commit 1, MUST be first)

The branch starts with 27 dirty files in the working tree from a previous in-progress experiment. Decide cleanly:

1. Run `git diff --stat` and read the diffs.
2. The map page changes (`MapPageClient.tsx`, `MapShell.tsx`, `MapResultsPanel.tsx`, `CitySelector.tsx`) are an in-progress switch to a charcoal-themed results panel. They violate the design-token rule (raw `bg-[#161b22]`, `text-white`). **Revert them.** They'll be re-done correctly in commit 5 (the map tokenization commit).
3. The non-map dirty files (`globals.css`, `welcome/page.tsx`, `HomeCountryPicker.tsx`, `HomeHeroActions.tsx`, `site-header.tsx`, `WelcomeFlow.tsx`) — read each diff. Keep the changes that are real bug fixes (e.g. `globals.css` notification toolbar `pointer-events: none` fix should stay). Revert anything that's WIP.
4. Move all 11 untracked `CODEX_*.md` briefs into a new `briefs/` directory and add `.gitignore` entry `briefs/`. They're scratch documentation, not code. Keep `briefs/CODEX_LAUNCH_READINESS.md` (this file) as a checked-in record of what tonight's run accomplished.
5. Untracked artifacts (`data/promo-redemptions.jsonl`, `prisma/migrations/20260429002000_profile_tables/`, `test-results/`) — add to `.gitignore` if not already.
6. Commit the cleanup as `chore(cleanup): revert in-progress UI experiments, ignore briefs and artifacts`.

**Acceptance:** `git status --short` returns at most 1 line (the launch-readiness brief itself, if you keep it tracked). `pnpm build` succeeds.

---

## 1. TOKENIZE ALL HARDCODED HEX LITERALS (commits 2–6)

351 hex literals across 47 files. Replace every one with a design token. Break the work across 5 commits by file group so it's reviewable.

### Token mapping cheat sheet

| Hex | Replace with |
|---|---|
| `#0a1628` (deep navy text) | `text-deep` or `text-[color:var(--fg-primary)]` |
| `#0a1628` (deep bg) | `bg-deep` or `bg-[var(--bg-deep)]` (add token if missing) |
| `#f4b942` (gold) | `bg-gold` / `text-gold` / `border-gold` |
| `#f7fafc` (page bg light) | `bg-bg` |
| `#161b22` (dark surface) | `bg-[var(--bg-surface-strong)]` (add if missing) |
| `#d8e3f5` (subtle border) | `border-line` |
| `#fff8e7` / `#fff5da` (warm gold tint) | `bg-[var(--accent-soft-bg)]` |
| `#9b6b04` (warm gold deep text) | `text-[color:var(--accent-soft-fg)]` |
| `text-white` on dark surfaces | `text-[color:var(--fg-on-strong)]` (add if missing) |
| `text-white/55`, `text-white/70`, etc. | `text-[color:var(--fg-secondary-on-strong)]` (add if missing — single token, alpha varies via opacity classes if needed) |

**If a token doesn't exist, ADD IT to `app/globals.css` `:root` and `:root[data-theme="dark"]` blocks BEFORE using it.** Don't sprinkle new hexes anywhere.

### Commit breakdown:

- **Commit 2** — `feat(tokens): add missing design tokens to globals.css` — define `--bg-deep`, `--bg-surface-strong`, `--fg-on-strong`, `--fg-secondary-on-strong`, `--fg-muted-on-strong`. Light mode and dark mode values for each. No file other than `globals.css` changes in this commit.
- **Commit 3** — `chore(tokens): tokenize app/account, app/membership, app/admin pages` (~50 hex hits)
- **Commit 4** — `chore(tokens): tokenize app/groups, app/join, app/promos/*, app/venue, app/country pages` (~60 hex hits)
- **Commit 5** — `chore(tokens): tokenize map components (MapPageClient, MapShell, FilterDrawer, etc.)` (~120 hex hits — this is the biggest commit)
- **Commit 6** — `chore(tokens): tokenize remaining components (matches, marketing, ui/, venue/, membership/)` (~120 hex hits)

After commit 6: `grep -rE "(bg|text|border)-\[#[0-9a-fA-F]{3,8}" app components --include="*.tsx" | wc -l` must return zero, OR documented exceptions (e.g. country brand colors used as data, not theme).

**Acceptance:** Every page renders correctly in BOTH light and dark mode. Open `/account`, `/membership`, `/[city]/map`, `/promos`, `/venue/<slug>`, `/me` in each theme. No white-on-white, no dark-on-dark.

---

## 2. "I WATCHED THIS" MATCH CHECK-IN UI (commits 7–8)

`lib/store/watchlist.ts` already has `watchedMatches: string[]` state and `markWatched(matchId)` action. The UI for it doesn't exist on `MatchCard.tsx`.

### Commit 7 — `feat(matches): add 'I watched this' button to MatchCard`

Inside `components/matches/MatchCard.tsx`:
- After kickoff (`Date.now() > Date.parse(match.startsAt)`), show a primary CTA "I watched this →" if not already watched, or "✓ Watched" if it is.
- Tapping the unwatched state opens a `WatchedCheckInSheet`:
  - Optional: "Where did you watch?" — venue picker pre-filtered to that city, with a top "Other" option for at-home / external.
  - Optional: 1–5 star rating of the watch experience (stars only, no review text in this brief).
  - Submit button calls `markWatched(matchId)` and `setWatchVenue(matchId, venueSlug)` from the store.
- Already-watched state shows the chosen venue if one was set, plus a "Edit" button to reopen the sheet.

For matches that haven't kicked off yet, show "I'll watch this →" instead, which adds to `watchlist.watchedMatches` proactively (signaling intent — same store field, just earlier write). Distinguish with a different chip color.

### Commit 8 — `feat(activity): wire watchedMatches mutations to user.activity timeline`

When `markWatched` fires, append an `ActivityEvent { kind: "watched_match", payload: { matchId, watchVenueSlug } }` to `user.activity`. Already-existing pattern from earlier briefs — just hook it up here.

When the auth user signs in and migrate runs, watchedMatches sync to `ProfileWatchedMatch` server table (already wired by auth sprint).

**Acceptance:** Mark a match watched anonymously → reload → still watched. Sign in → migrate → confirm row in `ProfileWatchedMatch` table. Tap "Edit" → change the venue → confirm update.

---

## 3. MARKETING LANDING PAGE (commits 9–11)

Currently `/` renders `<USAHomepage />` which is the venue picker for active users. First-time visitors get dropped into a complex tool with no context.

### Commit 9 — `chore(routes): move USAHomepage to /app, keep / for marketing landing`

- Create `app/app/page.tsx` that renders `<USAHomepage />`. Same SEO metadata as before.
- Update `app/page.tsx` to render a NEW `<MarketingLanding />` component when the user is anonymous AND has no `welcomeSeenAt`.
- For users who have already onboarded OR are signed in, `/` redirects to `/app` (using a small client-side check inside the layout, since detection requires the auth state).

### Commit 10 — `feat(marketing): MarketingLanding component`

`components/marketing/MarketingLanding.tsx`:
- Hero: large "Find your watch party for World Cup 2026." headline, sub-line "17 host cities · 48 nations · every fan diaspora.", primary gold CTA "Personalize my Cup →" routes to `/welcome`, secondary "See the map →" routes to `/nyc/map`.
- "How it works" — three step cards (already exist on USAHomepage — extract).
- "Featured fan groups" — horizontal scrolling row of 6 demo fan groups (NYC Argentina Crew, LA México Locos, etc. — use `lib/data/fanGroups.ts` if it exists, otherwise hardcode 6 placeholder cards).
- "By the numbers" — 17 cities / 48 nations / X verified venues.
- Email capture (reuse `EmailCaptureBanner`).
- Footer links to /about, /privacy, /terms.

Visual treatment: deep navy hero (always dark), white surface for the rest. Mobile-first.

### Commit 11 — `feat(marketing): /about + about content`

Update `/about` (currently exists but thin) to:
- Why the app exists (1 paragraph, real prose).
- How fan-group venue data is sourced (Google Places + community submissions).
- Privacy stance (1 line).
- Email + contact link.

**Acceptance:** Anonymous visitor lands on `/` → sees marketing page. Signed-in user OR onboarded user → redirects to `/app`. The marketing page works in both light and dark mode.

---

## 4. PWA INSTALL FLOW (commits 12–14)

### Commit 12 — `feat(pwa): global install banner with smart suppression`

Currently `InstallAppBanner` only renders inside the home sidebar. Build a real one:

`components/layout/PWAInstallBanner.tsx` — mounted in `app/layout.tsx` as a sticky bottom banner (above the mobile nav, hidden on desktop).

- Detects whether the app is already installed (PWA `display-mode: standalone` OR iOS `navigator.standalone`).
- Detects whether the user previously dismissed (`localStorage.gameday-pwa-dismissed`).
- Hides on `/welcome`, `/auth/*`, and any route where `body[data-route]` is set.
- Copy: "Add GameDay Map to your home screen for kickoff alerts." Single primary CTA: "Install →".
- On Chrome/Android, triggers `beforeinstallprompt` flow.
- On iOS, opens an instruction modal: "Tap Share, then 'Add to Home Screen'." Show a small graphic.

### Commit 13 — `feat(pwa): manifest + icons audit`

- Verify `public/manifest.json` has all required fields: name, short_name, icons (192 + 512), start_url, display: "standalone", theme_color, background_color.
- Verify icons exist at `public/icons/icon-192.png` and `public/icons/icon-512.png`.
- Add `apple-touch-icon` link in `app/layout.tsx` head if missing.

### Commit 14 — `feat(pwa): offline page polish`

`app/offline/page.tsx` exists. Make it useful:
- "You're offline. Here's what's still readable." Lists last-cached city map page link (from cache).
- Match schedule for today (from cached data).
- "Reconnect" button.

Service worker (`public/sw.js`) caches venue data for the user's home city + match schedule for the next 48h. Use a stale-while-revalidate strategy.

**Acceptance:** Mobile Chrome shows install prompt. iOS Safari shows the manual instruction modal. Already-installed users don't see the banner. Going offline shows the offline page with cached content.

---

## 5. PER-ROUTE OG IMAGES (commits 15–16)

Currently every route shares the default OG image.

### Commit 15 — `feat(og): dynamic OG image generator route`

`app/api/og/route.ts` exists as a stub. Build it out using `@vercel/og` (which is built into Next.js `next/og` — no new dep needed).

Routes that need custom OG:
- `/` → "GameDay Map · Find your World Cup 2026 watch party"
- `/[city]/map` → "{City} watch parties · X venues for {Country count} nations"
- `/country/[slug]` → "{Country} fans in NYC, LA, Miami…"
- `/venue/[slug]` → "{Venue name} · {City} · Watch World Cup with {country} fans"
- `/promos` → "World Cup promos · Save at watch parties across 17 cities"
- `/welcome` → "Personalize your Cup"

Each renders a 1200×630 PNG with the wordmark, headline, gold accent, and city/country flag where relevant.

### Commit 16 — `feat(og): wire metadata.openGraph.images per route`

Each page that needs custom OG sets:
```ts
export async function generateMetadata({ params }): Promise<Metadata> {
  return {
    openGraph: {
      images: [`/api/og?type=venue&slug=${params.slug}`]
    }
  };
}
```

**Acceptance:** Paste a venue URL into Twitter/Slack/iMessage → custom OG card appears with venue name, city, country.

---

## 6. ERROR BOUNDARIES ON CRITICAL FLOWS (commit 17)

Add per-flow error boundaries:
- `app/auth/error.tsx` — covers /auth/sign-in, /auth/callback, /auth/sign-out. Friendly: "Sign in hit a snag. Try again or email hello@gamedaymap.com."
- `app/membership/error.tsx` — covers /membership and /membership/concierge. Friendly: "Couldn't load membership info. Your subscription is safe — try again."
- `app/[city]/error.tsx` — covers all city subroutes.

Each error boundary includes a "Reset" button that calls `reset()` (Next.js error boundary API) and a "Go home" link.

**Acceptance:** Force a runtime error inside `/auth/callback` (throw during code exchange) → user sees the friendly page, not a stack trace.

---

## 7. ACCOUNT DROPDOWN ENRICHMENT (commit 18)

`components/layout/site-header.tsx` account dropdown currently shows nav items but not the user's identity.

Update for signed-in state:
- Top of dropdown: avatar emoji + first name + email below (small, muted).
- Existing nav rows below.
- Bottom of dropdown: "Sign out" row that POSTs to `/auth/sign-out`.

For signed-out state:
- Top of dropdown: "Sign in to sync" with a primary "Sign in →" button → `/auth/sign-in`.
- Existing nav rows below (still work anonymously).

**Acceptance:** Dropdown clearly tells the user whether they're signed in and gives them an obvious way in or out.

---

## 8. UI POLISH ITEMS FROM PREVIOUS BRIEFS (commits 19–21)

Knock out the leftover polish items I documented in earlier briefs that haven't shipped:

### Commit 19 — `fix(map): account popover stacks above results panel + venue names wrap to 2 lines`

- Account popover renders into a portal at `z-50`. Venue results panel `z-30`.
- Venue card titles use `line-clamp-2` instead of single-line truncation.

### Commit 20 — `fix(north-america-map): label collisions on east coast cluster`

- NYC/BOS/PHI/TOR cluster: tighten label offsets, use `top-left` for Toronto, `top-right` for Boston, smaller font (9px) for the cluster.
- SF/LV/LA west coast: same treatment.
- On mobile (<640px), labels render only on tap, not always.

### Commit 21 — `fix(home-hero): two CTAs not three, drop "See today's matches"`

- Primary: `Personalize my Cup →` / `Open my Cup →` (gold).
- Secondary: `Find a watch spot →` (outline).
- Remove `See today's matches` — `HomeMatchesStrip` already shows them right below the hero.

---

## 9. BUILD + LINT VERIFICATION (commit 22)

`chore(verify): pnpm build + grep audits + dark mode walkthrough`

After all 21 commits land:

1. `pnpm build` — must succeed. Paste full output in the report.
2. `pnpm lint` — must pass. Fix any new violations.
3. `grep -rE "(bg|text|border)-\[#[0-9a-fA-F]{3,8}" app components --include="*.tsx" | wc -l` — should return 0 or document each exception.
4. `grep -rn "// SRC:" lib/store | wc -l` — should be ≥ 20 (from auth sprint).
5. Visual walkthrough at desktop (1280px) AND mobile (380px) in BOTH light and dark mode for every page touched in this brief.

---

## 10. REPORT BACK

After commit 22, single consolidated report:
- All 22 commit shas + titles.
- Total files touched (count).
- One-line description of each commit's visual outcome.
- `pnpm build` full output.
- Hex audit count before and after (should be 351 → 0).
- Screenshots at desktop AND mobile in both themes for: `/`, `/app`, `/[city]/map`, `/me`, `/account`, `/membership`, `/promos`, `/auth/sign-in`.
- Any RSC-boundary issues hit and how resolved.

---

## 11. ACCEPTANCE GUT-CHECK

- [ ] Working tree was clean after commit 1 — no leftover dirty files.
- [ ] `grep -rE "(bg|text|border)-\[#" app components --include="*.tsx"` returns 0 hits.
- [ ] Match cards have working "I watched this" button + check-in sheet.
- [ ] Anonymous first-time visitor lands on `/` and sees a marketing page, NOT the venue picker.
- [ ] Signed-in or onboarded users land on `/app` (existing USAHomepage).
- [ ] PWA install banner appears on mobile, hides after dismiss, hides if already installed.
- [ ] Custom OG images render for `/`, `/[city]/map`, `/venue/[slug]`, `/country/[slug]`, `/promos`.
- [ ] Auth, membership, and city error boundaries exist.
- [ ] Account dropdown shows email when signed in, "Sign in to sync" when not.
- [ ] Account popover stacks above results panel on `/[city]/map`.
- [ ] Homepage hero has 2 CTAs not 3.
- [ ] NorthAmericaMap east-coast labels don't overlap on desktop.
- [ ] `pnpm build` succeeds, clean.
- [ ] No new top-level deps.
- [ ] Both light and dark mode pass on every page touched.
