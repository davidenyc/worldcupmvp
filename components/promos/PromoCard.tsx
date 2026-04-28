"use client";

import { useState } from "react";

import {
  PromoRecord,
  canRedeemPromo,
  getPromoLockCopy,
  getPromoRedemptionLabel
} from "@/lib/data/promos";
import { useMembership } from "@/lib/store/membership";
import { PromoRedemptionModal } from "@/components/promos/PromoRedemptionModal";

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
  const [open, setOpen] = useState(false);
  const redeemable = canRedeemPromo(tier, promo);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
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
          {redeemable ? "Tap to redeem →" : `${getPromoLockCopy(promo)} →`}
        </div>
      </button>
      {open ? (
        <PromoRedemptionModal
          promo={promo}
          venueName={venueName}
          reservationUrl={reservationUrl}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}
