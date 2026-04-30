"use client";

import { useState } from "react";

import {
  PromoRecord,
  canRedeemPromo,
  getPromoLockCopy,
  getPromoRedemptionLabel
} from "@/lib/data/promos";
import { UpgradePrompt } from "@/components/membership/UpgradePrompt";
import { useMembership } from "@/lib/store/membership";
import { useSavedPromosStore } from "@/lib/store/savedPromos";
import { PromoRedemptionModal } from "@/components/promos/PromoRedemptionModal";
import { toast } from "@/lib/toast";

export function PromoCard({
  promo,
  venueName,
  reservationUrl,
  compact = false
}: {
  promo: PromoRecord;
  venueName: string;
  reservationUrl?: string;
  compact?: boolean;
}) {
  const { tier, hasFeature } = useMembership();
  const savedPromos = useSavedPromosStore((state) => state.savedPromos);
  const savePromo = useSavedPromosStore((state) => state.savePromo);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const redeemable = canRedeemPromo(tier, promo);
  const savedPromo = savedPromos.find((entry) => entry.promoId === promo.id) ?? null;
  const recentPromoClaims = savedPromos.filter(
    (entry) => Date.now() - Date.parse(entry.claimedAt) <= 7 * 24 * 60 * 60 * 1000
  );
  const freeClaimLimitReached = !hasFeature("unlimited_promo_redemptions") && recentPromoClaims.length >= 1 && !savedPromo;

  async function handlePrimaryAction() {
    if (savedPromo) {
      setOpen(true);
      return;
    }

    if (!redeemable) {
      setShowUpgrade(true);
      return;
    }

    if (freeClaimLimitReached) {
      setShowUpgrade(true);
      return;
    }

    setSaving(true);
    const response = await fetch("/api/promos/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        promoId: promo.id
      })
    });

    const payload = (await response.json()) as { savedPromo?: import("@/lib/data/promos").SavedPromo; error?: string };
    setSaving(false);

    if (!response.ok || !payload.savedPromo) {
      toast.error(payload.error ?? "Could not save this QR right now.");
      return;
    }

    savePromo(payload.savedPromo);
    toast.success("Saved to My Cup");
    setOpen(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={handlePrimaryAction}
        className={`w-full rounded-[1.5rem] border border-[color:var(--border-subtle)] bg-[var(--bg-surface)] p-4 text-left shadow-sm transition hover:translate-y-[-1px] ${
          compact ? "min-h-[180px]" : "min-h-[220px]"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="rounded-full bg-surface-2 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-deep">
            {getPromoRedemptionLabel(promo.redemption)}
          </div>
          {promo.tier_required !== "free" ? (
            <div className="rounded-full bg-deep px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--fg-on-strong)]">
              {promo.tier_required === "fan" ? "Fan Pass" : "Elite"}
            </div>
          ) : null}
        </div>
        <h3 className="mt-4 text-lg font-semibold text-[color:var(--fg-primary)]">{promo.title}</h3>
        <div className="mt-2 text-sm font-medium text-[color:var(--fg-secondary)]">{venueName}</div>
        <p className="mt-2 text-sm leading-6 text-[color:var(--fg-muted)]">{promo.description}</p>
        <div className="mt-4 text-xs uppercase tracking-[0.18em] text-[color:var(--fg-muted)]">
          {new Date(promo.start_iso).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit"
          })}{" "}
          –{" "}
          {new Date(promo.end_iso).toLocaleString("en-US", {
            hour: "numeric",
            minute: "2-digit"
          })}
        </div>
        <div className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-gold px-4 py-2.5 text-sm font-semibold text-deep">
          {saving
            ? "Saving…"
            : savedPromo
              ? "Show QR ↗"
              : redeemable
                ? "Save QR →"
                : `${getPromoLockCopy(promo)} →`}
        </div>
      </button>
      {open ? (
        <PromoRedemptionModal
          promo={promo}
          savedPromo={savedPromo}
          venueName={venueName}
          reservationUrl={reservationUrl}
          onClose={() => setOpen(false)}
        />
      ) : null}
      {showUpgrade ? (
        <UpgradePrompt
          feature={promo.tier_required === "free" ? "unlimited_promo_redemptions" : promo.tier_required === "fan" ? "reservation_request" : "elite_activity_timeline"}
          requiredTier={promo.tier_required === "elite" ? "elite" : "fan"}
          onClose={() => setShowUpgrade(false)}
        />
      ) : null}
    </>
  );
}
