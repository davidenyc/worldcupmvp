"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { TIER_META, type MembershipTier, useMembership } from "@/lib/store/membership";

const tierOrder: MembershipTier[] = ["free", "fan", "elite"];

export function MembershipCards() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { tier, setTier } = useMembership();
  const [loadingTier, setLoadingTier] = useState<MembershipTier | null>(null);
  const [successTier, setSuccessTier] = useState<MembershipTier | null>(null);

  const currentIndex = useMemo(() => tierOrder.indexOf(tier), [tier]);
  const returnPath = searchParams.get("return");

  async function handleTierChange(nextTier: MembershipTier) {
    if (nextTier === tier) return;

    setLoadingTier(nextTier);
    setSuccessTier(null);
    await new Promise((resolve) => window.setTimeout(resolve, 1500));
    setTier(nextTier);
    setLoadingTier(null);
    setSuccessTier(nextTier);

    window.setTimeout(() => {
      if (returnPath) {
        router.push(returnPath);
        return;
      }

      window.scrollTo({ top: 0, behavior: "smooth" });
      setSuccessTier(null);
    }, 2000);
  }

  return (
    <div id="membership-cards" className="grid gap-5 lg:grid-cols-3">
      {tierOrder.map((cardTier) => {
        const meta = TIER_META[cardTier];
        const cardIndex = tierOrder.indexOf(cardTier);
        const isCurrent = cardTier === tier;
        const isHigherTier = cardIndex > currentIndex;
        const isLoading = loadingTier === cardTier;
        const isSuccess = successTier === cardTier;

        return (
          <section
            key={cardTier}
            className={`relative flex flex-col rounded-[2rem] border bg-white p-6 shadow-sm dark:bg-[var(--bg-surface-strong)] ${
              isCurrent
                ? "border-deep ring-2 ring-deep dark:border-gold dark:ring-gold"
                : "border-line dark:border-line"
            } ${cardTier === "fan" ? "lg:scale-[1.01]" : ""}`}
          >
            {cardTier === "fan" ? (
              <div className="absolute left-6 top-0 -translate-y-1/2 rounded-full bg-gold px-3 py-1 text-xs font-bold text-deep">
                ⭐ Most Popular
              </div>
            ) : null}
            {isCurrent ? (
              <div className="mb-4 inline-flex self-start rounded-full bg-deep px-3 py-1 text-xs font-bold text-[color:var(--fg-on-strong)] dark:border dark:border-gold/30 dark:bg-[var(--bg-surface-strong)]">
                Current Plan ✓
              </div>
            ) : null}

            <div className="text-xl font-bold text-deep dark:text-[color:var(--fg-on-strong)]">{meta.label}</div>
            <div className="mt-4 flex items-end gap-2">
              <div className="text-4xl font-bold text-deep dark:text-[color:var(--fg-on-strong)]">{meta.price}</div>
              <div className="pb-1 text-sm text-mist dark:text-[color:var(--fg-muted-on-strong)]">/mo</div>
            </div>
            <div className="mt-5 h-px bg-[color:var(--border-subtle)] dark:bg-white/10" />

            <ul className="mt-5 flex-1 space-y-3 text-sm text-[color:var(--fg-secondary)] dark:text-[color:var(--fg-secondary-on-strong)]">
              {meta.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <span className="mt-0.5 font-bold text-gold">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 space-y-2">
              {isCurrent ? (
                <button
                  type="button"
                  disabled
                  className="w-full rounded-full bg-gray-200 px-5 py-3 text-sm font-bold text-gray-500 dark:bg-white/10 dark:text-[color:var(--fg-secondary-on-strong)]"
                >
                  You&apos;re here
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleTierChange(cardTier)}
                  disabled={isLoading}
                  className={`w-full rounded-full px-5 py-3 text-sm font-bold transition ${
                    isSuccess
                      ? "bg-emerald-600 text-[color:var(--fg-on-strong)]"
                      : isHigherTier
                        ? "bg-gold text-deep"
                        : "border border-line bg-white text-deep dark:border-line dark:bg-[var(--bg-surface-strong)] dark:text-[color:var(--fg-on-strong)]"
                  }`}
                >
                  {isLoading
                    ? "⏳ Processing…"
                    : isSuccess
                      ? "🏆 Upgraded!"
                      : isHigherTier
                        ? `Upgrade to ${meta.label} — ${meta.price}/mo`
                        : `Downgrade to ${meta.label}`}
                </button>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
