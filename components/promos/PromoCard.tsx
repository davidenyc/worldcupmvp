"use client";

import { useState } from "react";

import {
  PromoRecord,
  canRedeemPromo,
  getPromoLockCopy,
  getPromoRedemptionLabel
} from "@/lib/data/promos";
import { useMembership } from "@/lib/store/membership";
import { useSavedPromosStore } from "@/lib/store/savedPromos";
import { useUser } from "@/lib/store/user";
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
  const { tier } = useMembership();
  const user = useUser();
  const savedPromos = useSavedPromosStore((state) => state.savedPromos);
  const savePromo = useSavedPromosStore((state) => state.savePromo);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const redeemable = canRedeemPromo(tier, promo);
  const savedPromo = savedPromos.find((entry) => entry.promoId === promo.id) ?? null;

  async function handlePrimaryAction() {
    if (savedPromo) {
      setOpen(true);
      return;
    }

    if (!redeemable) {
      setOpen(true);
      return;
    }

    setSaving(true);
    const response = await fetch("/api/promos/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        promoId: promo.id,
        userId: user.id,
        tier
      })
    });

    const payload = (await response.json()) as { savedPromo?: import("@/lib/data/promos").SavedPromo; error?: string };
    setSaving(false);

    if (!response.ok || !payload.savedPromo) {
      toast.error(payload.error ?? "Could not save this QR right now.");
      return;
    }

    savePromo(payload.savedPromo);
    toast.success("Saved to My World Cup");
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
          <div className="rounded-full bg-[#eef4ff] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#0a1628]">
            {getPromoRedemptionLabel(promo.redemption)}
          </div>
          {promo.tier_required !== "free" ? (
            <div className="rounded-full bg-[#0a1628] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
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
        <div className="mt-4 inline-flex rounded-full bg-[#f4b942] px-3 py-2 text-sm font-semibold text-[#0a1628]">
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
    </>
  );
}
