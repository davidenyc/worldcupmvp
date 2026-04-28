# Overnight Parallel Workstreams

Codex is running the 10-phase build prompt. These are the other workstreams that can run at the same time so nothing sits idle. Each item lists who runs it (Codex bonus / Claude in Cowork / a script / you), the deliverable, and whether it's launch-blocking.

============================================================
STREAM A — CODEX BONUS PHASES (add to the existing prompt)
============================================================
These extend the main build. Add as Phase 11+ if Codex finishes early.

A1. Venue scraping pipeline (LAUNCH-CRITICAL for non-NYC cities)
    - Build `scripts/scrape/google-places.ts`: takes a city + grid of lat/lng tiles + keyword list (["sports bar", "bar", "pub", "restaurant", "supporter club"]), pages through Google Places Text Search and Nearby Search, dedupes, and writes raw JSON to `/data/scraped/{city}.raw.json`.
    - Build `scripts/scrape/normalize.ts`: takes a raw file, runs each row through an LLM (Claude API or local) to classify: country supporter affiliation (using bar name + tags + reviews), venue_type, atmosphere, price band. Outputs validated rows to `/data/venues/{city}.json` via the import CLI from Phase 1.
    - Run for all 16 non-NYC host cities tonight. Target: 80–150 venues per city.
    - Cost guard: hard budget cap on API spend, log to `/audit/scrape-cost.log`.

A2. Photo enrichment
    - For every venue without `photo_urls`, fetch Google Places Photos (1–3 per venue) and store the photo references (NOT the binary — use Google's photo URL with key on render to stay under quota).
    - Fallback: generate a city-skyline + country-flag composite SVG per venue type.

A3. Match schedule scrape
    - Pull official 2026 fixtures from FIFA's public schedule page or an open dataset; populate `/data/matches/2026.json` with all 104 matches incl. Las Vegas + Monterrey (which still show 0 matches).

A4. Country supporter intel
    - For each of 48 nations, run an LLM pass that produces: 1-paragraph supporter culture blurb, top 5 NYC bars known for that crowd, common chants/rituals (light, no gatekeeping), tournament expectations. Save to `/data/countries/{slug}.md`.
    - Wire into /country/{slug} pages so every nation has unique editorial copy, not a template.

A5. City landing copy
    - 1-paragraph "what watch parties feel like in {city}" for each of 17 cities, neighborhoods to know, transit notes, signature venues. Save to `/data/cities/{code}.md`.

A6. Web push notification infra
    - Service worker, VAPID keys, /api/push/subscribe + /api/push/send endpoints, opt-in flow on /account, Elite-tier-only feature.

A7. Stripe product setup script
    - `scripts/stripe/seed-products.ts` creates the Fan Pass and Supporter Elite products + monthly/annual prices in BOTH test and live modes idempotently. Outputs price IDs to `.env.local` and `.env.production`.

A8. Analytics
    - Wire PostHog (free tier) for funnel events: visit_home, click_city, click_country, open_venue, click_save, hit_paywall, start_checkout, complete_checkout, signup_alerts, submit_venue, share_venue, create_group. Each event has a clear name + props. Add a privacy-respecting cookie banner.

A9. PWA / install prompt
    - Manifest, app icons (gold "GM" mark), install banner on mobile after 2 visits, offline shell that shows "you saved these venues" when offline.

A10. SEO content batch
    - Auto-generate /watch-{country}-in-{city} pages for popular crossings (Brazil-NYC, Argentina-Miami, Mexico-LA, England-Boston, etc.) — these are gold for organic traffic. ~200 pages, each with unique editorial intro + the matching venue list.

============================================================
STREAM B — CLAUDE IN COWORK (I can do these tonight without touching the codebase)
============================================================
Hand any of these to me and I'll deliver a finished file you can hand to Codex or paste into the app.

B1. Country guide content (48 markdown files)
    - For each WC 2026 nation: supporter culture blurb, signature watch experience, "what to wear/bring," kickoff-day rituals, tournament storylines and key matches to watch. Tone: fan-first, not Wikipedia.
    - Deliverable: `/content/countries/{slug}.md` × 48.

B2. City editorial (17 markdown files)
    - For each host city: neighborhood guide for watching matches, transit, must-visit supporter bars, fan-zone info, weather notes for June/July, what makes that city's watch culture distinct.
    - Deliverable: `/content/cities/{code}.md` × 17.

B3. Match preview blurbs
    - 1–2 sentence editorial preview for each of the 104 matches: storyline, why it matters, fan-energy expectation. Use as match card subtitle.
    - Deliverable: `/content/matches/2026.json`.

B4. Membership tier copy + FAQ
    - Tighten the Free / Fan Pass / Supporter Elite comparison: feature names, benefit-focused descriptions, ordering of value, money-back guarantee, FAQ (24+ questions). Designed to convert.
    - Deliverable: `/content/membership.md`.

B5. Email templates
    - Welcome (free signup), Tonight digest, "Match starts in 1 hour" alert, Tonight-in-{city} weekly preview, abandoned-checkout, post-match recap, venue partner outreach, refer-a-friend.
    - Deliverable: `/content/emails/*.html` + plain-text variants.

B6. Press kit + launch one-pager
    - Boilerplate, founder quote, top 5 features, screenshots placeholder, tournament context, contact. PDF + .docx.

B7. Pricing-experiment hypotheses
    - 3–5 A/B tests worth running once analytics are live: e.g. $4.99 vs $6.99 Fan Pass, "Fan Pass" vs "Pro" naming, gate-on-3rd-country vs gate-on-5th, free-trial vs no-trial. Each with a hypothesis, success metric, and minimum sample size.

B8. Privacy policy + Terms of Service
    - Real-ish, app-specific, GDPR + CCPA aware. Not a generic template. Includes data retention, leads policy, venue submission rights, Stripe data flow.

B9. Venue partner outreach pack
    - Cold email + DM templates to bar owners offering "Featured" placement during WC. Pricing tiers.

B10. Demo script + investor pitch
    - 2-min demo flow + 5-slide pitch deck if you ever need it.

============================================================
STREAM C — SCRIPTS / MACHINES (run unattended)
============================================================
C1. Synthetic test data run
    - `npm run venues:stress` populates 17,000 fake venues to verify the data layer scales. Run, screenshot perf, then revert.

C2. Lighthouse / axe-core / Pa11y batch
    - Cron a script that runs Lighthouse + axe + Pa11y on the top 30 routes hourly during the night and writes deltas to `/audit/perf-watch/`.

C3. Visual regression
    - Use Playwright to take a full-page screenshot of every route (both themes, three viewports) every 30 min. Diff against baseline. Flag in `/audit/vrt-diffs/`.

C4. Link checker
    - Crawl every `<a>` on every route, follow it, assert 200. Run hourly. Write `/audit/broken-links.log`.

C5. Backup
    - `git push` to a remote backup repo every 30 min during the build so nothing gets lost.

============================================================
STREAM D — LAUNCH PREP (you, the owner, ~30 min each)
============================================================
D1. Domain
    - Register / point production domain. Set up Vercel deploy, env vars, SSL.

D2. Stripe live mode
    - Verify Stripe account, set up payout method, copy live keys into `.env.production` (NOT committed).

D3. Email sender
    - Set up Resend / Postmark / SendGrid + DKIM/SPF on the domain so transactional email lands in inbox.

D4. Google Places API key
    - With billing alert, capped budget — needed for both venue scraping (Stream A1) and photo URLs (A2).

D5. Mapbox token
    - Already used somewhere; confirm production token + URL allowlist.

D6. Social accounts
    - Reserve @gamedaymap on IG, X, TikTok, Threads. Post a "coming soon" with the kickoff countdown.

D7. Press / partner short list
    - 20 writers + 50 venue owners to email day-one.

============================================================
PRIORITIZATION — tonight's parallel plan
============================================================
While Codex is building Phases 0–3 (data layer, theme, map, monetization):
    → Hand B1 + B2 + B3 to me. I can produce all 48 country guides + 17 city guides + 104 match blurbs as markdown files, ready for Codex to import in Phase 9 (SEO content batch).
    → You handle D1, D2, D4, D5 (domain, Stripe, Google Places key, Mapbox token).

While Codex is building Phases 4–7:
    → Hand B4 + B5 + B8 to me (membership FAQ, email templates, legal docs).
    → You start D6 (social handle reservation).

While Codex is building Phases 8–10:
    → Run Stream A1 + A3 (venue scraping + match schedule) using the Google Places key from D4.
    → I produce B6 + B9 (press kit + partner outreach).

Wake-up state target:
- Codex: 10-phase build complete, all green.
- Me: 48 country guides + 17 city guides + 104 match blurbs + membership FAQ + 8 email templates + privacy/TOS + press kit + partner outreach pack — all in `/content/`.
- Scripts: ~1,500–2,000 sourced venues across 17 cities, photos referenced, perf/vrt/link logs clean.
- You: domain live, Stripe ready, social handles parked.

Then morning is launch polish, not foundational work.

============================================================
WHAT TO SAY TO ME RIGHT NOW
============================================================
Pick which Stream B items you want me to start on tonight. Suggested first batch (no codebase access needed):
    1. "Start B1: write all 48 country guides"
    2. "Start B4: tighten membership tier copy + FAQ"
    3. "Start B5: write the 8 email templates"

Tell me which and I'll start producing files immediately while Codex runs.
