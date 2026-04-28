# Tonight rebuild + mobile nav fix + promos + member perks

This replaces and extends the Tonight section (Phase 4) and adds the promotions / member-perks system. Treat as a P0 build alongside the cleanup pass.

The owner's bar: Tonight has to be the page someone opens at 5pm and immediately knows (a) the first game tonight, (b) where to go for it, (c) where to go after that, (d) what deals are running, (e) what their membership unlocks. No friction. Pop.

---

## A. Mobile nav fix (P0 prerequisite — do this first)

Current state: at <600px width, the bottom nav shows only Home / Map / Matches / Saved. Tonight, Membership, Submit, and the theme toggle are all missing.

Fix:
- Bottom-fixed mobile nav, exactly 5 items: Home / Tonight / Map / Matches / Account.
- Center-floating "+" FAB above the bar opens the Submit-a-Venue sheet.
- Membership and theme toggle live inside Account → top of the screen.
- The "More ▾" menu used on desktop becomes a swipe-up drawer on mobile from the Account icon.
- Tonight icon should pulse subtly on match days (CSS animation, no JS).

Acceptance: at 390px width, every primary surface is reachable in one tap from the bottom nav. No dead controls.

---

## B. Tonight — restructure as the marquee surface

### B1. Two top-level mode tabs

Right under the page header:
```
[ 🍺 Find a bar ]  [ 🍽️ Find a restaurant ]
```

Both pull from the same venue index but apply different default filters:
- Bar tab: `venue_type ∈ {sports_bar, cultural_bar, bar_with_tvs, fan_fest}`.
- Restaurant tab: `venue_type ∈ {cultural_restaurant, restaurant_with_tvs}`, additionally requires `accepts_reservations=true` by default (toggleable).

Selected tab persists in URL `?mode=bar|restaurant` and across sessions. Default to `bar` for first-time visitors.

### B2. The "First game tonight" hero

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
- If next match is >6 hours away → "Tonight at {kickoff_local} · {match}"
- If no matches today → "No matches today — but here are the rooms worth knowing for {next_match_date}'s slate."

Top 3 picks are ranked by a single score:
```
score = 0.40 * normalized_rating
      + 0.20 * normalized_review_count
      + 0.15 * country_match_bonus      // does the venue's country tag match either team?
      + 0.10 * atmosphere_bonus          // high > medium > low
      + 0.10 * capacity_fit_bonus        // bigger crowd capacity scores higher for marquee
      + 0.05 * reservations_available_bonus
```

If user has a saved supporter country, the country_match_bonus weights toward THEIR country (e.g. an Argentina fan watching Brazil-Morocco still gets Argentine-flagged bars surfaced first if they're showing the match).

### B3. "Where to go next" rail

Right below the first-game hero:

```
WHERE TO GO NEXT
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ 🇫🇷 vs 🇸🇳   │ │ 🇧🇷 vs 🇲🇦   │ │ 🇺🇸 vs 🇵🇾   │
│ Tomorrow     │ │ Sat 6pm      │ │ Fri 9pm      │
│ Top spots →  │ │ Top spots →  │ │ Top spots →  │
└──────────────┘ └──────────────┘ └──────────────┘
```

Show the next 3-5 matches the user is most likely to care about — prioritized by: matches they've saved, then matches involving their supporter country, then marquee matches by editorial rating.

### B4. Three ranked lists below the hero

Each as its own collapsible section, default to "Top 3 in your area" expanded:

**1. Top 3 in your area** (ranked picks for the current city + mode)
```
Top 3 in {your_city} tonight
1. Venue name · ⭐ rating (review count) · neighborhood · Reserve | Directions
2. ...
3. ...
[ See all → ]
```

**2. Most reviewed**
Sorted strictly by review count descending, top 5.
```
Most reviewed in {your_city}
1. Reichenbach Hall · ⭐ 4.6 · 7,112 reviews
2. Cantina Rooftop · ⭐ 4.4 · 7,917 reviews
...
```

**3. Highest rated**
Sorted strictly by rating with a min-review-count floor (≥50 reviews to filter out 5.0/(1) outliers), top 5.
```
Highest rated in {your_city}
1. The U bar and grill · ⭐ 4.9 · 938 reviews
...
```

Each list respects the bar/restaurant tab filter.

### B5. Filters specific to Tonight

Above the lists, a compact filter strip (collapsible into a "🎚 Filters" pill on mobile):

- Country I'm rooting for (free: 2 max, paywall on 3rd)
- Reservations available (toggle)
- Walk-in only (toggle)
- Distance from me (Fan Pass — geolocation prompt)
- Group size (input, default 2)
- Atmosphere: low / medium / high
- Open now (toggle)
- Vegetarian-friendly / Halal / Kosher (restaurant tab only)
- Live music between matches (restaurant tab only)
- Outdoor seating

URL state: `?mode=bar&country=BRA&reservations=1&size=4` etc. Shareable.

### B6. "Tonight at a glance" card

A small at-a-glance card above the fold on mobile, top-right on desktop:

```
TONIGHT AT A GLANCE
🌡 78°F clear · sunset 8:24pm
🏟 3 matches in your timezone tonight
📍 You're in {city_name} · {neighborhood}
🎯 1 venue you saved is showing tonight's marquee
```

Pulls weather from Open-Meteo (free, no key), match count from `/data/matches/2026.json`, geolocation from saved city or detected, "venues you saved showing tonight" from local saves.

---

## C. Promotions / Deals system

This is its own data type, surface, and revenue channel.

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

Promo types and the canonical UI label for each:
- `bogo` → "Buy one get one free"
- `percent_off` → "{pct}% off {applies_to}"
- `free_item` → "Free {item} with reservation"
- `happy_hour` → "Happy hour, {start}–{end}"
- `matchday_special` → "Match-day special"
- `membership_perk` → "Members only" (gates redemption to tier_required)

### C2. Promo surfaces

**On Tonight, after the "Top 3" hero:**
```
🎯 DEALS TONIGHT IN {CITY_NAME}
┌─────────────────────────────┐ ┌─────────────────────────────┐
│ 50% off first hour          │ │ BOGO margaritas             │
│ Cantina Rooftop · NYC       │ │ Cantina Taqueria · NYC      │
│ Tonight, kickoff–8pm        │ │ Mexico match only           │
│ [ Tap to redeem → ]         │ │ [ Tap to redeem → ]         │
└─────────────────────────────┘ └─────────────────────────────┘
[ See all 11 deals tonight → ]
```

Card shows: title, venue, time window, redemption type (visible badge: 📱 QR / 💬 Code / 🚪 Walk-in / 🎫 Auto), and tier badge if gated.

**On every venue page (/venue/{id}):** "Active deals at this venue" card under the hero, listing current and upcoming promos for that venue.

**On the city map (/{city}/map):** map pin gets a small green "%" dot if the venue has an active promo. Filter chip "🎯 Has deals tonight" on the filter sidebar.

**On membership page:** dedicated "Member Perks" section showing every Elite-tier-only and Fan-Pass-only promo in the user's saved city.

### C3. Promo redemption flow

Tap "Tap to redeem" on a promo card →

For `redemption: walk_in` (just show the bar staff this screen):
- Full-screen takeover with promo title, venue logo, time window, big QR code or code text.
- "Tap to mark redeemed" button (records to `/api/promos/redeem` with promo_id, user_id, timestamp).
- Once redeemed, the QR code stays viewable for 60 minutes then expires.

For `redemption: show_qr`:
- QR code + a 6-char human-readable backup code.
- Bar staff scans QR; on scan, redemption is logged and reduces `redemptions_used`.
- Time-limited validity (15-min default once shown).

For `redemption: mention_code`:
- Big text: "Mention 'GAMEDAY' to your server before ordering."
- Tap-to-copy button.

For `redemption: auto_applied`:
- Just a confirmation card: "Showing up at {venue}? Your discount applies automatically with this reservation. Reserve →"
- Tap-through to the reservation flow.

### C4. Tier-gated redemption

- `tier_required: free` — open to everyone.
- `tier_required: fan_pass` — requires Fan Pass active. Free users see the card with a 🔒 badge and "Unlock with Fan Pass" CTA.
- `tier_required: elite` — Elite-only. Same lock pattern at the higher tier.

Critical: never let a free user start a redemption flow they can't complete. The CTA should literally say "Unlock with Fan Pass" or "Get Elite to redeem" for gated promos, never "Tap to redeem" → silent failure.

### C5. Member perks (the elite-tier wedge)

These are not one-off promos; they're persistent benefits that ship with the tier:

**QR-code venue access — Elite only**
- Every venue page shows a "🎟 Skip the line — show your Elite QR" card if `venue.elite_partner=true`.
- Tap → full-screen QR with rotating 30-second token signed against the user's session.
- Bar staff scans → grants entry without standing in line on busy match days.
- This is the killer Elite feature. It's worth $12.99/month on its own to a fan attending 5+ matches at busy bars.
- Implementation: `/api/elite/access-token` issues short-lived signed JWT with user_id + venue_id + expiry; bar's scanner app (web) verifies signature against shared secret. For launch, a printed scan code at the bar can be used by a staff member with a phone webcam.

**Early reservation window — Fan Pass + Elite**
- Fan Pass: 24 hours earlier than free users.
- Elite: 48 hours earlier than free users.
- Implementation: every venue's reservation flow checks current user tier and gates the booking by `release_time_for_tier(venue.next_release, user.tier)`.
- UX: free users see "Opens for booking 24 hours before kickoff. Fan Pass members can book now."
- Fan Pass users see "You're booking 24 hours before public release."

**Hold capacity for Elite group bookings**
- Phase 6.6 ships `/groups/{code}` URLs. For Elite users, the group page can request a held capacity for groups of 6+ at partner venues.
- Auto-confirm if `venue.elite_held_capacity_remaining >= group_size`. Otherwise queue with the venue.

**Concierge perks — Elite**
- Real human handles the reservation back-and-forth (already in the membership copy).
- 3 requests/day cap.

**Partner discounts — Elite**
- A `/membership/perks` page lists all current partner deals: drink specials, ride-share credits, kit affiliate codes, transit. Updated weekly.

### C6. Promo admin

In `/admin/promos`:
- Table view of every active and scheduled promo across all cities.
- Inline edit: title, description, time window, tier, redemption type, max redemptions.
- "Sponsor a match" flow: select a match, select a venue, select a discount → creates a `matchday_special` promo automatically.
- Redemption analytics per promo: views, taps, redemptions, conversion rate.
- Bulk import via CSV (same pattern as venues).

---

## D. Acceptance checklist

Tonight is done when, on a fresh 390px-wide mobile session:

1. The bottom nav has Home / Tonight / Map / Matches / Account, plus a center "+" FAB.
2. Tap Tonight. Header shows the next match with a live countdown.
3. Two tabs visible: "🍺 Find a bar" and "🍽️ Find a restaurant." Tap each, the venue list filters.
4. Top 3 spots for the next match render below the header.
5. "Where to go next" rail shows 3+ upcoming matches.
6. "Top 3 in your area" / "Most reviewed" / "Highest rated" sections all render.
7. "Deals tonight in {city}" section shows at least 2 promo cards.
8. Tap a promo → redemption flow opens (QR / code / mention / auto).
9. A free user attempting a Fan-Pass-gated promo sees an upgrade CTA, not a silent failure.
10. The "Tonight at a glance" card shows weather, match count, city, saved-venues-tonight.
11. Filter strip is reachable in one tap; URL updates with state; reload preserves filters.
12. On /membership, the Member Perks section lists Elite QR access, Fan Pass early-booking, Concierge.
13. On any venue page, active deals show under the hero.
14. On the map, venues with deals get a green "%" dot.
15. Acceptance gate: an Elite user at a partner venue can pull up their access QR, the QR rotates every 30 seconds, and a manual scan against the verification endpoint succeeds.

---

## E. Data work to make this real

For Codex to fully ship this, the venue and match data need:
- Each venue: `elite_partner: boolean` flag.
- Each venue: `match_focus: match_id[]` — which matches it especially fits.
- A `/data/promos/{city}.json` per city, seeded with 5–10 plausible launch deals per city.
- A clear partner intake at `/partners` for venue owners to submit their own deals.

The owner is sourcing real venues and partners. Until partners are live, seed with editorial promos labeled "Sponsored by GameDay Map" — not lying about who's offering, just framing the launch deal as us covering the discount in exchange for venue cooperation.

---

## F. The summary line for Codex

Tonight is the highest-frequency surface in the app. The owner has flagged it explicitly. Build it like the marquee. Two-track (bar/restaurant). Live countdown. Top 3 picks per match. Where-to-go-next rail. Most-reviewed and highest-rated lists. Filters. Promos. Member perks. Mobile-first.

Stop only when a fan opens it at 5pm, sees the next match, picks a room in two taps, and walks out the door.
