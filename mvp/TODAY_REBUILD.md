# Today rebuild + mobile nav fix + promos + member perks

This replaces TONIGHT_REBUILD.md. Two changes from the prior version:

1. **Global rename: "Tonight" → "Today" everywhere in the app.**
   - Page route: `/tonight` → `/today` (with a 301 redirect from `/tonight` so saved links keep working).
   - Nav label: "Tonight" → "Today" (desktop nav and mobile bottom nav).
   - Page H1: "Tonight's Matches" → "Today's Matches".
   - Header tag: "TONIGHT'S MATCHES" → "TODAY'S MATCHES".
   - Email subject lines: "Tonight in {city}" → "Today in {city}". Email file names: `02-today-digest.html` is now canonical (update internal copy too).
   - Marketing copy: any "tonight" reference inside `/content/marketing/*.md` swapped to "today" where the meaning is "the day's matches" (NOT "later this evening").
   - Schemas / event names: PostHog event `tonight_open` → `today_open`. Database column / variable `tonight_*` → `today_*`.
   - Country guide blurbs that say "tonight" stay as-is — those are descriptive prose, not the page name.

   Reason: the World Cup runs matches at 12pm, 3pm, 6pm, 9pm local across host cities. "Tonight" is wrong for noon kickoffs. "Today" is accurate for the whole day's slate.

2. **The restaurant tab must be visible by default. Never hidden.**
   - Tabs render as a 50/50 split at the top of the Today page, immediately under the header.
   - Both tabs are always visible at every viewport width, every theme, every device.
   - Default selected tab is "🍺 Find a bar" for first-time visitors. User's last selection persists thereafter.
   - The restaurant tab is NOT inside a "More" menu, NOT in a dropdown, NOT collapsed on mobile. If it doesn't fit, the rest of the layout adapts — the tabs do not.
   - Acceptance gate: open `/today` at 320px width — both tabs visible side-by-side without horizontal scroll.

The rest of this spec is the same as TONIGHT_REBUILD.md with terminology updated.

---

## A. Mobile nav fix (P0 prerequisite — do this first)

Current state at <600px width: bottom nav shows only Home / Map / Matches / Saved. Today, Membership, Submit, Search, and the theme toggle are all missing.

Fix:
- **Top header on mobile (sticky):** logo on the left, **🔍 Search icon on the right (always visible)**, hamburger / Account avatar next to it. Search icon opens `/search` or an inline search drawer in one tap.
- **Bottom-fixed mobile nav, exactly 5 items:** Home / Today / Map / Matches / Account.
- Center-floating "+" FAB above the bottom bar opens the Submit-a-Venue sheet.
- Membership and theme toggle live inside Account → top of the screen.
- The "More ▾" menu used on desktop becomes a swipe-up drawer accessible from the Account icon on mobile.
- Today icon should pulse subtly on match days (CSS animation, no JS).
- Today icon shows a small numeric badge ("3") when there are matches today the user is following.

Acceptance: at 390px width, every primary surface is reachable in one tap. The search icon is **always visible in the top header on every route** — not buried in a menu. No dead controls.

Layout reference for mobile header:
```
┌──────────────────────────────────────────┐
│  GM  GameDay Map         🔍   👤  ☰     │   ← always visible, sticky
└──────────────────────────────────────────┘
```

Where:
- `🔍` opens search (`/search` or inline drawer).
- `👤` opens account menu.
- `☰` opens the More drawer (Membership, Submit, Theme toggle, About, Privacy, etc.).

---

## B. Today — restructure as the marquee surface

### B1. Two top-level mode tabs (CRITICAL — restaurant must be visible)

Right under the page header, full-width 50/50 tabs:
```
[ 🍺 Find a bar ]  [ 🍽️ Find a restaurant ]
```

Both pull from the same venue index but apply different default filters:
- Bar tab: `venue_type ∈ {sports_bar, cultural_bar, bar_with_tvs, fan_fest}`.
- Restaurant tab: `venue_type ∈ {cultural_restaurant, restaurant_with_tvs}`, additionally `accepts_reservations=true` by default (toggleable).

Both tabs always rendered. Selected tab persists in URL `?mode=bar|restaurant` and across sessions. Default to `bar` for first-time visitors. Tab styles use the same gold-on-dark-pill treatment used elsewhere — selected tab gets the gold fill, unselected is outline only.

Restaurant-tab specific filters appear in the filter strip when restaurant is selected:
- Vegetarian-friendly
- Halal
- Kosher
- Live music between matches
- Outdoor seating
- Group-ready (8+)
- Family-friendly

Bar-tab filters stay focused on:
- Sports-bar-only toggle
- Number of screens minimum
- Capacity band
- Atmosphere (low/medium/high)
- Outdoor seating

### B2. The "First match today" hero

Top of the page below the tabs:

```
┌──────────────────────────────────────────────────────────────────┐
│  KICKOFF IN 2:14:00       ·       Mexico vs South Africa         │
│  Estadio Azteca · Group Stage · 🇲🇽 vs 🇿🇦                       │
│                                                                   │
│  Top 3 spots for this match in {your_city}                        │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐              │
│  │ 1 Cantina    │ │ 2 La Cantina │ │ 3 H&H Cantina│              │
│  │ Rooftop      │ │ ⭐ 4.7 (83)  │ │ ⭐ 4.3 (23)  │              │
│  │ ⭐ 4.4 7,917 │ │ Reservations │ │ Reservations │              │
│  │ HOT SPOT     │ │ available    │ │ available    │              │
│  └──────────────┘ └──────────────┘ └──────────────┘              │
│  [ See all 22 spots → ]                                          │
└──────────────────────────────────────────────────────────────────┘
```

Hero copy adapts:
- If a match is live → "Live now: {match}"
- If next match is <6 hours away → "Kickoff in HH:MM:SS · {match}"
- If next match is >6 hours away → "Today at {kickoff_local} · {match}"
- If no matches today → "No matches today — but here are the rooms worth knowing for {next_match_date}'s slate."

Top 3 picks ranked by:
```
score = 0.40 * normalized_rating
      + 0.20 * normalized_review_count
      + 0.15 * country_match_bonus
      + 0.10 * atmosphere_bonus
      + 0.10 * capacity_fit_bonus
      + 0.05 * reservations_available_bonus
```

If user has a saved supporter country, country_match_bonus weights toward THEIR country.

### B3. "Where to go next" rail

Right below the first-match hero:

```
WHERE TO GO NEXT
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ 🇫🇷 vs 🇸🇳   │ │ 🇧🇷 vs 🇲🇦   │ │ 🇺🇸 vs 🇵🇾   │
│ Tomorrow     │ │ Sat 6pm      │ │ Fri 9pm      │
│ Top spots →  │ │ Top spots →  │ │ Top spots →  │
└──────────────┘ └──────────────┘ └──────────────┘
```

Show the next 3-5 matches the user is most likely to care about — prioritized by: matches saved, then matches involving their supporter country, then marquee matches by editorial rating.

### B4. Three ranked lists below the hero

Each as its own collapsible section. Default: "Top 3 in your area" expanded; the other two collapsed.

**1. Top 3 in your area**
```
Top 3 in {your_city} today
1. Venue · ⭐ rating (review count) · neighborhood · Reserve | Directions
2. ...
3. ...
[ See all → ]
```

**2. Most reviewed**
Sorted strictly by review count descending, top 5.

**3. Highest rated**
Sorted strictly by rating with a min-review-count floor (≥50) to filter 5.0/(1) outliers, top 5.

All three respect the bar/restaurant tab filter. All three respect the active country filter.

### B5. Filter strip

Above the lists, a compact filter strip (collapsible into a "🎚 Filters" pill on mobile):

Always visible:
- Country I'm rooting for (free: 2 max, paywall on 3rd)
- Reservations available
- Walk-in only
- Distance from me (Fan Pass — geolocation prompt)
- Group size (input, default 2)
- Atmosphere
- Open now
- Outdoor seating

URL state: `?mode=bar&country=BRA&reservations=1&size=4`. Shareable. Reload preserves.

### B6. "Today at a glance" card

Above the fold on mobile, top-right on desktop:

```
TODAY AT A GLANCE
🌡 78°F clear · sunset 8:24pm
🏟 3 matches in your timezone today
📍 You're in {city_name} · {neighborhood}
🎯 1 venue you saved is showing today's marquee
```

Pulls weather from Open-Meteo (free, no API key), match count from `/data/matches/2026.json`, geolocation from saved city or detected, "venues you saved showing today" from local saves.

---

## C. Promotions / Deals system

### C1. Promo data shape

Add `/data/promos/{city_code}.json`:
```json
{
  "id": "promo-nyc-cantina-rooftop-2026-06-13",
  "venue_id": "nyc-mex-cantina-rooftop",
  "title": "BOGO margaritas, kickoff to halftime",
  "description": "Buy one margarita, get one free during the first half of every Mexico match.",
  "type": "bogo | percent_off | free_item | happy_hour | matchday_special | membership_perk",
  "discount_pct": 50,
  "applies_to": "first hour | full match | matchday | all_day",
  "match_ids": ["match-mex-rsa-2026-06-11", ...],
  "start_iso": "2026-06-11T19:00:00Z",
  "end_iso": "2026-06-11T22:00:00Z",
  "tier_required": "free | fan_pass | elite",
  "redemption": "show_qr | mention_code | auto_applied | walk_in",
  "code": "GAMEDAY",
  "qr_payload": "gdm:promo:nyc-mex-cantina-rooftop:2026-06-13",
  "max_redemptions": 50,
  "redemptions_used": 0,
  "image_url": null,
  "verified": true,
  "sponsored": false
}
```

Promo types and canonical UI labels:
- `bogo` → "Buy one get one free"
- `percent_off` → "{pct}% off {applies_to}"
- `free_item` → "Free {item} with reservation"
- `happy_hour` → "Happy hour, {start}–{end}"
- `matchday_special` → "Match-day special"
- `membership_perk` → "Members only"

### C2. Promo surfaces

**On Today, after the "Top 3" hero:**
```
🎯 DEALS TODAY IN {CITY_NAME}
┌─────────────────────────────┐ ┌─────────────────────────────┐
│ 50% off first hour          │ │ BOGO margaritas             │
│ Cantina Rooftop · NYC       │ │ Cantina Taqueria · NYC      │
│ Today, kickoff–8pm          │ │ Mexico match only           │
│ [ Tap to redeem → ]         │ │ [ Tap to redeem → ]         │
└─────────────────────────────┘ └─────────────────────────────┘
[ See all 11 deals today → ]
```

Card shows: title, venue, time window, redemption type badge (📱 QR / 💬 Code / 🚪 Walk-in / 🎫 Auto), tier badge if gated.

**On every venue page (/venue/{id}):** "Active deals at this venue" card under the hero.

**On the city map (/{city}/map):** map pin gets a small green "%" dot if active promo. Filter chip "🎯 Has deals today" on the filter sidebar.

**On membership page:** dedicated "Member Perks" section showing every Elite-tier-only and Fan-Pass-only promo in the user's saved city.

### C3. Promo redemption flow

Tap "Tap to redeem" on a promo card →

For `redemption: walk_in`:
- Full-screen takeover with promo title, venue logo, time window, QR code or code text.
- "Tap to mark redeemed" button (records to `/api/promos/redeem` with promo_id, user_id, timestamp).
- QR stays viewable for 60 minutes then expires.

For `redemption: show_qr`:
- QR code + 6-char human-readable backup code.
- Bar staff scans QR; on scan, redemption logged.
- 15-min validity once shown.

For `redemption: mention_code`:
- Big text: "Mention 'GAMEDAY' to your server before ordering."
- Tap-to-copy button.

For `redemption: auto_applied`:
- Confirmation card: "Showing up at {venue}? Your discount applies automatically with this reservation. Reserve →"
- Tap-through to reservation flow.

### C4. Tier-gated redemption

- `tier_required: free` — open to everyone.
- `tier_required: fan_pass` — requires Fan Pass active. Free users see the card with a 🔒 badge and "Unlock with Fan Pass" CTA (NOT "Tap to redeem").
- `tier_required: elite` — Elite-only. Same lock pattern.

Critical: never let a free user start a redemption flow they can't complete. The CTA must literally say "Unlock with Fan Pass" or "Get Elite to redeem" for gated promos.

### C5. Member perks (the elite-tier wedge)

Persistent benefits shipped with the tier:

**QR-code venue access — Elite only**
- Venue page shows a "🎟 Skip the line — show your Elite QR" card if `venue.elite_partner=true`.
- Tap → full-screen QR with rotating 30-second token signed against the user's session.
- Bar staff scans → grants entry without standing in line on busy match days.
- Implementation: `/api/elite/access-token` issues short-lived signed JWT with user_id + venue_id + expiry; bar's scanner app (web) verifies signature against shared secret.
- For launch, a printed scan code at the bar can be used by a staff member with a phone webcam.

**Early reservation window — Fan Pass + Elite**
- Fan Pass: 24 hours earlier than free users.
- Elite: 48 hours earlier than free users.
- Implementation: every venue's reservation flow checks current user tier and gates by `release_time_for_tier(venue.next_release, user.tier)`.
- UX: free users see "Opens for booking 24 hours before kickoff. Fan Pass members can book now."
- Fan Pass users see "You're booking 24 hours before public release."

**Hold capacity for Elite group bookings**
- Elite users can request held capacity for groups of 6+ at partner venues.
- Auto-confirm if `venue.elite_held_capacity_remaining >= group_size`. Otherwise queue.

**Concierge — Elite (3 requests/day cap)**
**Partner discounts — Elite** — `/membership/perks` lists current partner deals.

### C6. Promo admin

In `/admin/promos`:
- Table view of every active and scheduled promo across all cities.
- Inline edit: title, description, time window, tier, redemption type, max redemptions.
- "Sponsor a match" flow: select a match, select a venue, select a discount → creates a `matchday_special` promo.
- Redemption analytics per promo: views, taps, redemptions, conversion rate.
- Bulk import via CSV.

---

## D. Acceptance checklist

Today is done when, on a fresh 390px-wide mobile session:

1. Bottom nav has Home / Today / Map / Matches / Account, plus a center "+" FAB.
2. Tap Today. Header shows the next match with a live countdown.
3. **Both tabs visible side-by-side: "🍺 Find a bar" and "🍽️ Find a restaurant."** Tap each, the venue list filters. Critical — neither tab is hidden.
4. Top 3 spots for the next match render below the header.
5. "Where to go next" rail shows 3+ upcoming matches.
6. "Top 3 in your area" / "Most reviewed" / "Highest rated" sections all render.
7. "Deals today in {city}" section shows at least 2 promo cards.
8. Tap a promo → redemption flow opens (QR / code / mention / auto).
9. A free user attempting a Fan-Pass-gated promo sees an upgrade CTA, not a silent failure.
10. The "Today at a glance" card shows weather, match count, city, saved-venues-today.
11. Filter strip is reachable in one tap; URL updates with state; reload preserves filters.
12. On /membership, the Member Perks section lists Elite QR access, Fan Pass early-booking, Concierge.
13. On any venue page, active deals show under the hero.
14. On the map, venues with deals get a green "%" dot.
15. Acceptance gate: an Elite user at a partner venue can pull up their access QR, the QR rotates every 30 seconds, and a manual scan against the verification endpoint succeeds.
16. **Restaurant tab visibility check at 320px:** open `/today` at 320px width — both tabs visible side-by-side without horizontal scroll, both tappable, both functional.
17. **Search visibility check on mobile:** at 390px and 320px width, the 🔍 search icon is always visible in the top sticky header on every route (`/`, `/today`, `/{city}/map`, `/membership`, `/account`, `/saved`, `/venue/{id}`, every other route). One tap from any page opens search.

---

## E. Data work to make this real

For Codex to fully ship this, the venue and match data need:
- Each venue: `elite_partner: boolean` flag.
- Each venue: `match_focus: match_id[]` — which matches it especially fits.
- A `/data/promos/{city}.json` per city, seeded with 5–10 plausible launch deals per city.
- A clear partner intake at `/partners` for venue owners to submit their own deals.

Until partners are live, seed with editorial promos labeled "Sponsored by GameDay Map" — not lying about who's offering, just framing the launch deal as us covering the discount in exchange for venue cooperation.

---

## F. Summary line for Codex

Today (renamed from Tonight) is the highest-frequency surface in the app. The owner has flagged it explicitly twice. Build it like the marquee. **Two-track (bar/restaurant) — both tabs visible at all times, never hidden.** Live countdown. Top 3 picks per match. Where-to-go-next rail. Most-reviewed and highest-rated lists. Filters. Promos. Member perks. Mobile-first.

Stop only when:
1. A fan opens `/today` at 5pm, sees the next match, picks a room in two taps, and walks out the door.
2. A 320px-wide mobile viewport shows both bar and restaurant tabs immediately, with no horizontal scroll required.
3. The page is named "Today" everywhere — nav label, page header, URL, email subject, event names.
