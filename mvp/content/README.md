# GameDay Map Content Library

All Stream B content produced overnight. Hand any of this to Codex for import in the relevant phases of the build prompt, or use directly in marketing.

## What's here

```
content/
├── README.md                          (this file)
├── membership.md                      (B4 — tier copy + FAQ + paywall modals)
├── experiments.md                     (B7 — 5 pricing experiments + 4 copy/UX experiments)
│
├── emails/                            (B5 — 8 transactional/marketing email templates)
│   ├── 01-welcome.html + .txt
│   ├── 02-today-digest.html
│   ├── 03-match-alert-1hr.html
│   ├── 04-weekly-preview.html
│   ├── 05-abandoned-checkout.html
│   ├── 06-post-match-recap.html
│   ├── 07-venue-partner-outreach.html
│   └── 08-refer-a-friend.html
│
├── legal/                             (B8 — privacy + terms + cookies)
│   ├── privacy.md
│   ├── terms.md
│   └── cookies.md
│
├── marketing/                         (B6 + B9 + B10)
│   ├── press-kit.md                   (B6 — full press kit)
│   ├── one-pager.md                   (B6 — launch one-pager)
│   ├── venue-partner-outreach.md      (B9 — cold email + DM + phone scripts + objection handling + city outreach lists)
│   ├── demo-script.md                 (B10 — 2-min, 5-min, 30-sec scripts)
│   └── investor-pitch.md              (B10 — 5-slide deck content)
│
├── matches/
│   └── 2026.json                      (B3 — 37 detailed match previews + schema template + voice guide for the remaining 67)
│
├── cities/                            (B2 — 17 host city editorial guides)
│   ├── NYC.md  (most detailed — biggest market)
│   ├── LAX.md  (most detailed — second-biggest market)
│   ├── DAL.md
│   ├── SFO.md
│   ├── MIA.md
│   ├── SEA.md
│   ├── BOS.md
│   ├── PHL.md
│   ├── KAN.md
│   ├── ATL.md
│   ├── HOU.md  (most diverse — most submission opportunities)
│   ├── LAS.md
│   ├── TOR.md
│   ├── VAN.md
│   ├── MEX.md
│   ├── GDL.md
│   └── MTY.md
│
└── countries/                         (B1 — 48 nation supporter culture guides)
    ├── argentina.md
    ├── algeria.md
    ├── australia.md
    ├── austria.md
    ├── belgium.md
    ├── bosnia-and-herzegovina.md
    ├── brazil.md
    ├── cabo-verde.md
    ├── canada.md
    ├── colombia.md
    ├── congo-dr.md
    ├── croatia.md
    ├── curacao.md
    ├── czechia.md
    ├── cote-divoire.md
    ├── ecuador.md
    ├── egypt.md
    ├── england.md
    ├── france.md
    ├── germany.md
    ├── ghana.md
    ├── haiti.md
    ├── ir-iran.md
    ├── iraq.md
    ├── japan.md
    ├── jordan.md
    ├── korea-republic.md
    ├── mexico.md
    ├── morocco.md
    ├── netherlands.md
    ├── new-zealand.md
    ├── norway.md
    ├── panama.md
    ├── paraguay.md
    ├── portugal.md
    ├── qatar.md
    ├── saudi-arabia.md
    ├── scotland.md
    ├── senegal.md
    ├── south-africa.md
    ├── spain.md
    ├── sweden.md
    ├── switzerland.md
    ├── tunisia.md
    ├── turkiye.md
    ├── uruguay.md
    ├── usa.md
    └── uzbekistan.md
```

## How to use this

### For Codex (point it at the build prompt + this folder)

Phase 1 (data layer) — `matches/2026.json` is ready for import. Codex can wire it into `/data/matches/2026.json` directly, then fill in the remaining ~67 matches via Stream A3 (FIFA schedule scrape) using the `_template_for_remaining_matches` schema and the `_writing_notes` voice guide already in the file.

Phase 4 (Tonight) — pull match preview blurbs (`blurb_short`, `blurb_long`, `fan_energy`, `marquee`) directly into match cards and Tonight digest emails.

Phase 5 (Saved + Search + Account) — no direct content dependency, but the membership FAQ in `membership.md` answers common questions a user might search for.

Phase 6 (Venue page polish) — replace the "Imported from Google Places with name match" debug string with curated copy. The pattern from `countries/*.md` (e.g. "where each crowd lives") gives Codex the right voice for venue blurbs.

Phase 7 (UI polish) — copy library in `membership.md` for paywall modals, upsell prompts, headline variants. Trust block ready for checkout pages.

Phase 9 (SEO content batch) — every `countries/*.md` and `cities/*.md` is a ready-to-render landing page. ~65 high-value SEO surfaces that the build prompt's Phase 9 Stream A10 ("crossing pages" like /watch-brazil-in-nyc) can permute into hundreds.

Phase 10 (final QA) — `experiments.md` defines what to start measuring once analytics are live.

### For email infra setup

`emails/*.html` files are ready to drop into Resend / Postmark / SendGrid templates. All variables use Mustache-style `{{var_name}}` substitution. Plain-text variants exist for the welcome email; replicate that pattern for the rest.

### For press / launch

`marketing/press-kit.md` and `marketing/one-pager.md` are the canonical sources. Boilerplate, screenshots placeholder, founder quote — all ready. Replace `{{template_vars}}` before sending out.

`marketing/demo-script.md` is rehearsable as-is. 2-min version for press, 5-min for partners, 30-sec for elevator.

`marketing/investor-pitch.md` is slide content — design later. Anticipated questions and short answers section is ready for live Q&A.

### For partner outreach

`marketing/venue-partner-outreach.md` includes the full cold-email + DM + phone-script + objection-handling pack, plus per-city outreach list targets. Hand to whoever's running outreach with target counts per city already specified.

### For legal review

`legal/privacy.md`, `legal/terms.md`, `legal/cookies.md` are drafts. They are NOT signed off — a licensed attorney must approve before launch. The drafts are designed to be product-counsel-friendly: clear sections, comments on intent, jurisdiction placeholders.

## Template variables to fill before publishing

Search every file for `{{` to find unfilled vars. Common ones:
- `{{home_url}}` — production canonical URL (gamedaymap.com)
- `{{founder_name}}`, `{{founder_email}}`, `{{founder_phone}}`
- `{{company_legal_name}}`, `{{company_address}}`
- `{{governing_jurisdiction}}`, `{{venue_city_state_country}}`
- `{{effective_date}}`, `{{last_updated}}`, `{{launch_date}}`
- `{{total_venues}}`, `{{verified_venues}}`, `{{cities_live}}`, `{{team_size}}`
- `{{specific_ask}}` (in pitch — fill with the literal ask: capital, intro, partnership, etc.)

## Voice and tone

Across every file, the brand voice is:
- Fan-first, never marketing-first.
- Specific over generic. Name actual neighborhoods (Brockton, Tehrangeles, Astoria, Ironbound, Jackson Heights, Doral). Specificity earns trust.
- Quiet confidence. Don't say "epic" or "iconic" — say "loud," "packed," "the room."
- Avoid: epic, iconic, the world watches, you won't want to miss, must-see.
- Use: packed, sold out, the room, standing-room, loyal, tight, walks in, finds you.

## What still needs human attention

1. Legal review of privacy/terms/cookies before launch.
2. Filling in `{{template_vars}}` with real numbers and contact info.
3. Verifying the country guides for any city/neighborhood reference that has changed (closed bars, moved restaurants).
4. Cross-checking match fixture data once FIFA's official 2026 schedule is locked.
5. Filling in the remaining ~67 match previews using the schema and voice guide in `matches/2026.json`.

## What to do with this next

Hand to Codex:
- Copy `/content/` into the repo at `/content/`.
- Add to the build prompt: "Phase 9 SEO content batch — render `/country/{slug}` and `/city/{code}` pages from the markdown files in `/content/`. Each gets a unique editorial intro plus the matching venue list."
- Add: "Phase 4 Tonight expansion — pull match preview blurbs from `/content/matches/2026.json` into the Tonight digest and match cards."
- Add: "Phase 6 venue page — replace debug strings with curated copy in the voice modeled after `/content/countries/*.md`."

Hand to a human:
- Legal review.
- Email vendor setup with `/content/emails/` templates.
- Press list outreach using `/content/marketing/press-kit.md`.
- Venue owner outreach using `/content/marketing/venue-partner-outreach.md`.

Wake-up state: every Stream B deliverable is a ready file. Codex's overnight build will land alongside.
