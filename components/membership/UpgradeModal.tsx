"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { FEATURE_GATES, PremiumFeature, TIER_META, useMembership } from "@/lib/store/membership";

const FEATURE_COPY: Record<PremiumFeature, string> = {
  unlimited_country_filters: "Unlimited country filters unlock all 48 nations at once.",
  unlimited_saves: "Save beyond the 5-venue Free limit and build your full watch list.",
  unlimited_promo_redemptions: "Claim more matchday promo codes and keep a bigger QR wallet ready to show.",
  reservation_request: "Request reservations at supporter venues before match day gets crowded.",
  premium_venue_badges: "See Hot Spot and premium venue badges curated for serious fans.",
  match_alerts: "Get Elite reminders before your team kicks off.",
  elite_activity_timeline: "See your personal matchday timeline with venue visits and redeemed perks.",
  venue_concierge: "Let our concierge build the right venue shortlist for your crew.",
  early_access: "See new venue drops before everyone else.",
  advanced_filters: "Unlock richer filters for capacity, vibe, and matchday fit.",
  export_list: "Export your saved venue list and share it with your crew.",
  watch_party_groups: "Create and join GameDay crews around your favorite venue.",
  priority_support: "Get priority help when you need it."
};

type UpgradeModalProps = {
  feature: PremiumFeature;
  requiredTier: "fan" | "elite";
  onClose: () => void;
  returnPath?: string;
};

export function UpgradeModal({
  feature,
  requiredTier,
  onClose,
  returnPath
}: UpgradeModalProps) {
  const router = useRouter();
  const pathname = usePathname();
  const setTier = useMembership((state) => state.setTier);
  const [mounted, setMounted] = useState(false);
  const [flashingSuccess, setFlashingSuccess] = useState(false);
  const [upgradingInline, setUpgradingInline] = useState(false);

  const tierMeta = TIER_META[requiredTier];
  const currentPath = returnPath ?? pathname ?? "/";
  const membershipHref = `/membership?feature=${feature}&return=${encodeURIComponent(currentPath)}`;
  const featureList = useMemo(() => tierMeta.features.slice(0, 4), [tierMeta.features]);
  const headline = FEATURE_COPY[feature];

  useEffect(() => {
    setMounted(true);

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  async function handleInstantUpgrade() {
    setUpgradingInline(true);
    await new Promise((resolve) => window.setTimeout(resolve, 1500));
    setTier(requiredTier);
    setFlashingSuccess(true);
    setUpgradingInline(false);

    window.setTimeout(() => {
      onClose();
      if (returnPath) {
        router.push(returnPath);
      }
    }, 1500);
  }

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm transition-opacity duration-200 ease-out ${
        mounted ? "opacity-100" : "opacity-0"
      }`}
      onClick={onClose}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className={`w-full max-w-[360px] overflow-hidden rounded-3xl bg-white shadow-2xl transition-all duration-200 ease-out ${
          mounted ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        }`}
      >
        <div className="bg-deep p-6 text-center text-[color:var(--fg-on-strong)]">
          <div className="text-[48px] leading-none">{tierMeta.emoji || "⭐"}</div>
          <div className="mt-3 text-[20px] font-bold text-gold">{tierMeta.label}</div>
          <div className="mt-1 text-sm text-[color:var(--fg-secondary-on-strong)]">{tierMeta.price}/mo</div>
        </div>

        <div className="space-y-5 p-6">
          {flashingSuccess ? (
            <div className="rounded-3xl bg-gold px-4 py-6 text-center text-deep">
              <div className="text-2xl font-bold">🏆 Upgraded! Welcome to {tierMeta.label}</div>
            </div>
          ) : (
            <>
              <div className="text-center">
                <h2 className="text-lg font-bold text-deep">{headline}</h2>
                <p className="mt-2 text-sm text-[color:var(--fg-secondary)]">
                  Upgrade to {tierMeta.label} to unlock this and more:
                </p>
              </div>

              <ul className="space-y-2">
                {featureList.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-deep">
                    <span className="mt-0.5 font-bold text-gold">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="space-y-3">
                <Link
                  href={membershipHref}
                  className="block w-full rounded-full bg-gold px-5 py-3 text-center text-sm font-bold text-deep"
                >
                  Upgrade — {tierMeta.price}/mo
                </Link>
                <button
                  type="button"
                  onClick={handleInstantUpgrade}
                  disabled={upgradingInline}
                  className="w-full text-sm font-semibold text-[color:var(--fg-secondary)] underline"
                >
                  {upgradingInline ? "Processing demo upgrade…" : "Or upgrade instantly (demo)"}
                </button>
                <div className="text-center text-[11px] text-gray-500">Demo mode — no payment required</div>
                <button
                  type="button"
                  onClick={onClose}
                  className="block w-full text-center text-sm font-semibold text-[color:var(--fg-secondary)]"
                >
                  Maybe later
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
