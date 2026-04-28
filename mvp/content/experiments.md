# Pricing & conversion experiments

Run order: hold each test for at least 2 weeks or until 95% confidence on the primary metric, whichever comes first. Stop early only on safety regressions (refunds, chargebacks, support load).

Track every event in PostHog. Variants assigned at first session, sticky for 30 days. Don't run two pricing experiments simultaneously — copy/UX experiments can run in parallel with one pricing experiment.

---

## Experiment 1 — Fan Pass price point ($4.99 vs $6.99 vs $7.99)

**Hypothesis**: Higher price will not meaningfully reduce conversion rate during pre-tournament hype, and absolute revenue will increase.

**Setup**: 3 cells, 1/3 traffic each. Show the assigned price on the membership page, paywall modals, abandoned-checkout email, and footer reassurance.

**Primary metric**: Revenue per visitor (RPV) over 14 days.
**Secondary**: Free → Fan Pass conversion rate, refund rate, support tickets mentioning price.

**Minimum sample**: 8,000 unique visitors per cell to detect a 15% lift on RPV at 80% power.

**Decision rule**: If $6.99 cell beats $4.99 on RPV with refund rate within 1pp and support load within 20%, ship $6.99. If $7.99 wins on RPV but refund rate exceeds $4.99 by >2pp, do not ship — that's regret pricing.

**Risk to watch**: Public comparison if someone screenshots two prices. Use a single canonical price per session and don't show the alternative anywhere.

---

## Experiment 2 — Tier naming ("Fan Pass / Elite" vs "Pro / Insider")

**Hypothesis**: "Fan Pass" reads as casual and on-brand; "Pro" pulls more conversions from product-savvy users who scan tier names. Test which audience we want to win.

**Setup**: 2 cells, 50/50.
- Control: Fan Pass / Supporter Elite (current)
- Variant: Pro / Insider

Apply across membership page, nav pill ("Go Pro"), all email subjects ("Welcome to Pro"), upsell modals, and account page.

**Primary metric**: Free → paid conversion rate over 14 days.
**Secondary**: Open rate on welcome emails, average revenue per paid user.

**Minimum sample**: 12,000 unique visitors per cell.

**Decision rule**: Ship the winner. If they're within 5% relative on conversion, default to "Fan Pass / Elite" — it's more defensible long-term and matches the product's tone.

---

## Experiment 3 — Country filter gate threshold (3rd vs 5th country)

**Hypothesis**: Free fans rarely care about more than 2–3 countries on a given day. Gating at the 3rd country triggers an upsell at peak interest; gating at the 5th gives free users more room before pressure, possibly building habit before pay.

**Setup**: 2 cells, 50/50.
- Control: gate at 3rd country (current)
- Variant: gate at 5th country

**Primary metric**: 7-day retention × paid conversion rate (combined funnel).
**Secondary**: Number of country filter clicks per session, total paywalls shown per user, day-2 return rate.

**Minimum sample**: 10,000 unique visitors per cell.

**Decision rule**: Ship 5th if combined funnel lifts. If retention lifts but conversion drops, hold and re-test with copy variants — the gate might be right but the pitch wrong.

---

## Experiment 4 — Free trial vs no trial (7-day Fan Pass trial)

**Hypothesis**: A 7-day free trial increases gross signups but cancellation in trial week may reduce net revenue. Test whether net revenue rises.

**Setup**: 2 cells, 50/50.
- Control: no trial, charge immediately, 7-day refund.
- Variant: 7-day free trial, requires card, auto-converts on day 8.

**Primary metric**: 30-day net revenue per visitor (gross MRR minus refunds and trial cancellations).
**Secondary**: Trial → paid conversion, support ticket volume, churn at month 2.

**Minimum sample**: 15,000 unique visitors per cell — trials have noisier conversion paths.

**Decision rule**: Ship the trial only if 30-day NRPV beats the no-trial cell by ≥10% AND month-2 churn is within 1pp. Trials can mask future churn.

---

## Experiment 5 — Annual pricing discount depth (35% vs 50%)

**Hypothesis**: A bigger annual discount (50% off vs 35%) shifts more buyers to annual, reducing churn risk through the tournament window even if some monthly revenue is forgone.

**Setup**: 2 cells, 50/50, applied only to Fan Pass annual ($39 vs $30).

**Primary metric**: Annual plan share of paid signups over 21 days.
**Secondary**: Day-90 active rate, refund rate.

**Minimum sample**: 6,000 paid signups per cell.

**Decision rule**: Ship 50% discount only if annual share lifts ≥40% relative AND day-90 active rate is at parity. We'd rather lock in annual customers through the tournament than chase monthly margin.

---

## Copy/UX experiments (can run in parallel)

### C1 — Hero H1
Test the three headlines in `membership.md` (Default, Variant A urgency, Variant B social) on the membership page only. Primary: scroll-to-CTA rate × CTA click rate.

### C2 — Paywall modal for the country filter limit
- Control: "Filter every nation, free of friction." (current)
- Variant A: "You're filtering for 3 different crews. Fan Pass keeps it simple — pick all 48."
- Variant B: "One pass, 48 countries, every match."

### C3 — "Most popular" badge
- Control: badge on Fan Pass.
- Variant: badge on Elite.
- Variant 2: no badge anywhere.

Run for 14 days; measure tier mix.

### C4 — Stripe checkout button color
- Control: gold (current)
- Variant: brand dark with gold border
A small one. Useful only as a sanity check that the gold CTA is genuinely the local maximum.

---

## Anti-patterns to avoid (these will hurt long-term)

- **Price wall before any value seen.** Always let a free user filter, browse, and see at least one venue list before any paywall.
- **Persistent upsell nags.** Each modal must dismiss for the session.
- **Hidden cancellation.** One click in account, always.
- **Bait-and-switch annual pricing.** If a user clicks $4.99/mo and lands on $39/yr, they bounce and tell their friends. Annual goes through a separate explicit toggle.
- **Discount fatigue.** Don't rotate "50% off!" promos. Pick a price, defend it, run real experiments.

---

## Reporting cadence

- Daily: per-experiment dashboard in PostHog with conversion, RPV, refund rate.
- Weekly: written summary in `/audit/experiments/{week}.md` — what's running, what's significant, what's next.
- Post-tournament: full retro on every experiment, archived to `/content/experiments-history.md`.
