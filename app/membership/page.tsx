"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { MembershipCards } from "@/components/membership/MembershipCards";
import { TierBadge } from "@/components/membership/TierBadge";
import { FEATURE_GATES, TIER_META, type PremiumFeature, useMembership } from "@/lib/store/membership";

const featureNames: Record<PremiumFeature, string> = {
  unlimited_country_filters: "Unlimited country filters",
  unlimited_saves: "Unlimited saves",
  reservation_request: "Reservation requests",
  premium_venue_badges: "Hot Spot badges",
  match_alerts: "Match day alerts",
  venue_concierge: "Venue Concierge",
  early_access: "Early access",
  advanced_filters: "Advanced filters",
  export_list: "Export saved list",
  watch_party_groups: "Watch Party groups",
  priority_support: "Priority support"
};

const tableRows = [
  ["Browse all 17 cities", "✓", "✓", "✓"],
  ["View match schedule", "✓", "✓", "✓"],
  ["Country filter limit", "2", "48", "48"],
  ["Save venues", "5", "∞", "∞"],
  ["Reservation requests", "—", "✓", "✓"],
  ["Hot Spot badges", "—", "✓", "✓"],
  ["Watch Party groups", "—", "✓", "✓"],
  ["Match day alerts", "—", "—", "✓"],
  ["Venue Concierge", "—", "—", "✓"],
  ["Export saved list", "—", "—", "✓"],
  ["Priority support", "—", "—", "✓"]
] as const;

const faqs = [
  {
    question: "Is this a real subscription?",
    answer: "Demo mode, free to upgrade, real billing before WC."
  },
  {
    question: "What happens to my saves if I downgrade?",
    answer: "Never deleted, just can't add new ones."
  },
  {
    question: "Can I share Fan Pass?",
    answer: "One account per membership. Family plans coming."
  },
  {
    question: "How do match alerts work?",
    answer: "Enter email in Account. 2hr reminder before team's matches."
  }
];

export default function MembershipPage() {
  const searchParams = useSearchParams();
  const { tier } = useMembership();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [dismissedBanner, setDismissedBanner] = useState(false);

  const feature = searchParams.get("feature") as PremiumFeature | null;
  const requiredTier = feature ? (FEATURE_GATES[feature].includes("fan") ? "fan" : "elite") : null;
  const currentTierMessage = useMemo(() => {
    if (tier === "fan") return "⭐ You're on Fan Pass — unlimited filters & saves!";
    if (tier === "elite") return "👑 Supporter Elite — you have maximum access";
    return "You're on the Free plan · 2 countries · 5 saves max";
  }, [tier]);

  return (
    <main className="min-h-[100dvh] bg-[#f7fafc] dark:bg-[#0d1117]">
      <section className="bg-[#0a1628] px-4 py-16 text-white sm:px-6 lg:px-8">
        <div className="container-shell">
          <div className="text-xs font-semibold uppercase tracking-[0.28em] text-[#f4b942]">GAMEDAY MAP PRO</div>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">Go Premium for the World Cup</h1>
          <p className="mt-3 text-lg text-white/70">Unlock every filter, every venue, every feature.</p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white/90">
              {currentTierMessage}
            </div>
            {tier !== "free" ? (
              <a href="#membership-cards" className="text-sm font-semibold text-[#f4b942] underline">
                Downgrade options below
              </a>
            ) : null}
          </div>
        </div>
      </section>

      <section className="container-shell space-y-12 px-4 py-10 sm:px-6 lg:px-8">
        {feature && requiredTier && !dismissedBanner ? (
          <div className="rounded-[1.5rem] bg-[#f4b942] px-5 py-4 text-[#0a1628]">
            <div className="flex items-start justify-between gap-4">
              <div className="text-sm font-semibold">
                {featureNames[feature]} is a {TIER_META[requiredTier].label} feature. Upgrade below to unlock it.
              </div>
              <button type="button" onClick={() => setDismissedBanner(true)} className="text-sm font-bold">
                ✕
              </button>
            </div>
          </div>
        ) : null}

        <MembershipCards />

        <section className="overflow-hidden rounded-[2rem] border border-[#d8e3f5] bg-white dark:border-white/10 dark:bg-[#161b22]">
          <div className="overflow-x-auto">
            <table className="min-w-[760px] w-full border-collapse text-left text-sm">
              <thead className="sticky top-0 bg-[#0a1628] text-white">
                <tr>
                  <th className="px-4 py-4 font-semibold">Feature</th>
                  <th className="px-4 py-4 font-semibold">Free</th>
                  <th className="px-4 py-4 font-semibold">Fan Pass</th>
                  <th className="px-4 py-4 font-semibold">Elite</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map(([label, free, fan, elite], index) => (
                  <tr
                    key={label}
                    className={
                      index % 2 === 0
                        ? "bg-[#f8fbff] dark:bg-white/[0.03]"
                        : "bg-white dark:bg-[#161b22]"
                    }
                  >
                    <td className="px-4 py-4 font-medium text-[#0a1628] dark:text-white">{label}</td>
                    {[free, fan, elite].map((value, cellIndex) => (
                      <td key={`${label}-${cellIndex}`} className="px-4 py-4 text-center">
                        <span
                          className={
                            value === "—"
                              ? "text-gray-400 dark:text-white/30"
                              : "font-bold text-[#c98a00] dark:text-[#f4b942]"
                          }
                        >
                          {value}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0a1628]/45 dark:text-white/45">FAQ</div>
            <h2 className="mt-2 text-3xl font-bold text-[#0a1628] dark:text-white">Questions before you upgrade?</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={faq.question} className="overflow-hidden rounded-[1.5rem] border border-[#d8e3f5] bg-white dark:border-white/10 dark:bg-[#161b22]">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
                  >
                    <span className="text-base font-semibold text-[#0a1628] dark:text-white">{faq.question}</span>
                    <span className="text-lg text-[#0a1628]/45 dark:text-white/45">{isOpen ? "−" : "+"}</span>
                  </button>
                  <div
                    className="overflow-hidden transition-[max-height] duration-300 ease-out"
                    style={{ maxHeight: isOpen ? "160px" : "0px" }}
                  >
                    <div className="border-t border-[#eef4ff] px-5 py-4 text-sm leading-6 text-[#0a1628]/68 dark:border-white/10 dark:text-white/68">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-[2rem] bg-[#0a1628] px-6 py-8 text-center text-white">
          <div className="text-xl font-semibold">Questions? Email hello@gamedaymap.com</div>
          <div className="mt-4">
            <Link
              href="mailto:hello@gamedaymap.com"
              className="inline-flex rounded-full bg-[#f4b942] px-5 py-3 text-sm font-bold text-[#0a1628]"
            >
              Contact support
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}
