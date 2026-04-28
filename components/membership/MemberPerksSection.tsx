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
    <section className="rounded-[2rem] border border-[#d8e3f5] bg-white p-6 dark:border-white/10 dark:bg-[#161b22]">
      <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0a1628]/45 dark:text-white/45">
        Member perks
      </div>
      <h2 className="mt-2 text-3xl font-bold text-[#0a1628] dark:text-white">What your membership unlocks on match night</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {PERKS.map((perk) => {
          const unlocked = perk.tier === "fan" ? tier !== "free" : tier === "elite";
          return (
            <div
              key={perk.title}
              className={`rounded-[1.5rem] border p-5 ${
                unlocked
                  ? "border-[#f4b942]/40 bg-[#fff8e7] text-[#0a1628]"
                  : "border-[#d8e3f5] bg-[#f8fbff] text-[#0a1628] dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
              }`}
            >
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#c98a00]">
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
