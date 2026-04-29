"use client";

import Link from "next/link";

import { useMembership } from "@/lib/store/membership";

const PERKS = [
  {
    title: "Elite QR access",
    tier: "elite",
    body: "Pull up a rotating QR at partner venues and use the priority entry lane on big match days.",
    href: "/membership?tier=elite&feature=elite_qr_access&return=/today#membership-cards"
  },
  {
    title: "Fan Pass early booking",
    tier: "fan",
    body: "Fan Pass members open reservations 24 hours before public release. Elite opens 48 hours early.",
    href: "/membership?tier=fan&feature=early_booking&return=/today#membership-cards"
  },
  {
    title: "Elite concierge",
    tier: "elite",
    body: "Three concierge requests per day for reservation help, group holds, and last-minute match-night saves.",
    href: "/membership?tier=elite&feature=elite_concierge&return=/today#membership-cards"
  }
] as const;

export function MemberPerksSection() {
  const { tier } = useMembership();

  return (
    <section className="rounded-[2rem] border border-line bg-white p-6 dark:border-line dark:bg-[var(--bg-surface-strong)]">
      <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--ink-45)] dark:text-[color:var(--fg-on-strong)]/45">
        Member perks
      </div>
      <h2 className="mt-2 text-3xl font-bold text-deep dark:text-[color:var(--fg-on-strong)]">What your membership unlocks on match night</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {PERKS.map((perk) => {
          const unlocked = perk.tier === "fan" ? tier !== "free" : tier === "elite";
          return (
            <div
              key={perk.title}
              className={`rounded-[1.5rem] border p-5 ${
                unlocked
                  ? "border-gold/40 bg-[var(--accent-soft-bg)] text-deep"
                  : "border-line bg-surface-2 text-deep dark:border-line dark:bg-white/[0.03] dark:text-[color:var(--fg-on-strong)]"
              }`}
            >
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--accent-soft-fg)]">
                {perk.tier === "fan" ? "Fan Pass" : "Elite"}
              </div>
              <div className="mt-2 text-xl font-semibold">{perk.title}</div>
              <p className="mt-3 text-sm leading-6 opacity-80">{perk.body}</p>
              {!unlocked ? (
                <Link href={perk.href} className="mt-4 inline-flex text-sm font-semibold underline">
                  Upgrade to unlock →
                </Link>
              ) : (
                <div className="mt-4 text-sm font-semibold">Unlocked</div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
