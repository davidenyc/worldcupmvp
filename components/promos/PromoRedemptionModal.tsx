"use client";

import { useEffect, useMemo, useState } from "react";

import { UpgradeModal } from "@/components/membership/UpgradeModal";
import { QRCodeImage } from "@/components/ui/QRCodeImage";
import {
  PromoRecord,
  SavedPromo,
  canRedeemPromo,
  getPromoLockCopy,
  getPromoRedemptionLabel,
  getPromoTypeLabel
} from "@/lib/data/promos";
import { useMembership } from "@/lib/store/membership";
import { useUser } from "@/lib/store/user";
import { toast } from "@/lib/toast";

function formatCountdown(totalSeconds: number) {
  const clamped = Math.max(0, totalSeconds);
  const hours = Math.floor(clamped / 3600);
  const minutes = Math.floor((clamped % 3600) / 60);
  const seconds = clamped % 60;
  return [hours, minutes, seconds].map((value) => value.toString().padStart(2, "0")).join(":");
}

export function PromoRedemptionModal({
  promo,
  savedPromo,
  venueName,
  reservationUrl,
  onClose
}: {
  promo: PromoRecord;
  savedPromo?: SavedPromo | null;
  venueName: string;
  reservationUrl?: string;
  onClose: () => void;
}) {
  const { tier } = useMembership();
  const user = useUser();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [redeemed, setRedeemed] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(promo.redemption === "walk_in" ? 60 * 60 : 15 * 60);

  const liveCode = savedPromo?.code ?? promo.code;
  const qrData = useMemo(() => `${promo.qr_payload}:${user.id}:${liveCode}`, [liveCode, promo.qr_payload, user.id]);
  const qrUrl = useMemo(
    () => `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(qrData)}`,
    [qrData]
  );
  const redeemable = canRedeemPromo(tier, promo);

  useEffect(() => {
    if (!redeemable || redeemed) return undefined;
    const interval = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [redeemable, redeemed]);

  async function markRedeemed() {
    if (savedPromo) {
      toast.success("QR ready for the venue.");
      return;
    }

    if (!redeemable) {
      setShowUpgrade(true);
      return;
    }

    const response = await fetch("/api/promos/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        promoId: promo.id
      })
    });

    if (!response.ok) {
      toast.error("Could not mark this deal as redeemed.");
      return;
    }

    setRedeemed(true);
    toast.success("Deal marked redeemed.");
  }

  async function copyCode() {
    await navigator.clipboard.writeText(promo.code);
    toast.success("Code copied.");
  }

  return (
    <>
      <div className="fixed inset-0 z-[100] bg-deep/70 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 z-[101] max-h-[92vh] overflow-y-auto rounded-t-[2rem] bg-[var(--bg-surface)] px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-5 text-[color:var(--fg-primary)] shadow-2xl sm:left-1/2 sm:top-1/2 sm:max-h-[90vh] sm:w-[min(32rem,92vw)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[2rem]">
        <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-[color:var(--border-strong)] sm:hidden" />
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--fg-muted)]">
              {getPromoTypeLabel(promo)}
            </div>
            <h2 className="mt-2 text-2xl font-semibold">{promo.title}</h2>
            <p className="mt-2 text-sm leading-6 text-[color:var(--fg-secondary)]">{promo.description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close promo"
            className="inline-flex min-h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[color:var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-lg"
          >
            ×
          </button>
        </div>

        <div className="mt-4 rounded-[1.5rem] border border-[color:var(--border-subtle)] bg-[var(--bg-surface-elevated)] p-4">
          <div className="text-sm font-semibold">{venueName}</div>
          <div className="mt-1 text-xs uppercase tracking-[0.18em] text-[color:var(--fg-muted)]">
            {getPromoRedemptionLabel(promo.redemption)} · {promo.tier_required === "free" ? "Open to everyone" : promo.tier_required === "fan" ? "Fan Pass perk" : "Elite perk"}
          </div>
          <div className="mt-2 text-sm text-[color:var(--fg-secondary)]">
            Valid for {promo.applies_to}. {redeemable ? `Expires in ${formatCountdown(secondsLeft)} once opened.` : getPromoLockCopy(promo)}
          </div>
        </div>

        {!redeemable ? (
            <div className="mt-5 rounded-[1.5rem] border border-gold/40 bg-[var(--accent-soft-bg)] p-4 text-deep">
              <div className="text-sm font-semibold">{getPromoLockCopy(promo)}</div>
              <button
                type="button"
                onClick={() => setShowUpgrade(true)}
                className="mt-3 inline-flex min-h-11 items-center rounded-full bg-gold px-4 text-sm font-semibold text-deep"
              >
                {promo.tier_required === "fan" ? "Unlock with Fan Pass" : "Get Elite to redeem"}
              </button>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {promo.redemption === "show_qr" || promo.redemption === "walk_in" ? (
              <div className="rounded-[1.75rem] border border-[color:var(--border-subtle)] bg-[var(--bg-surface-elevated)] p-5 text-center">
                <QRCodeImage src={qrUrl} alt={`${promo.title} QR code`} className="mx-auto h-56 w-56 rounded-[1.25rem]" />
                <div className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--fg-muted)]">
                  Backup code
                </div>
                <div className="mt-1 text-lg font-semibold tracking-[0.28em]">{liveCode}</div>
              </div>
            ) : null}

            {promo.redemption === "mention_code" ? (
              <div className="rounded-[1.75rem] border border-[color:var(--border-subtle)] bg-[var(--bg-surface-elevated)] p-5 text-center">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--fg-muted)]">
                  Mention this code
                </div>
                <div className="mt-2 text-3xl font-semibold tracking-[0.22em]">{liveCode}</div>
                <button
                  type="button"
                  onClick={copyCode}
                  className="mt-4 inline-flex min-h-11 items-center rounded-full bg-gold px-4 text-sm font-semibold text-deep"
                >
                  Copy code
                </button>
              </div>
            ) : null}

            {promo.redemption === "auto_applied" ? (
              <div className="rounded-[1.75rem] border border-[color:var(--border-subtle)] bg-[var(--bg-surface-elevated)] p-5">
                <div className="text-sm leading-6 text-[color:var(--fg-secondary)]">
                  Showing up at {venueName}? Your perk is applied automatically when you reserve through GameDay Map.
                </div>
                {reservationUrl ? (
                  <a
                    href={reservationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex min-h-11 items-center rounded-full bg-gold px-4 text-sm font-semibold text-deep"
                  >
                    Reserve →
                  </a>
                ) : null}
              </div>
            ) : null}

            <button
              type="button"
              onClick={markRedeemed}
              disabled={redeemed}
              className="inline-flex w-full items-center justify-center rounded-full bg-deep px-4 py-3 text-sm font-semibold text-[color:var(--fg-on-strong)] disabled:opacity-60"
            >
              {savedPromo ? "Saved to My Cup" : redeemed ? "Redeemed" : "Tap to mark redeemed"}
            </button>
          </div>
        )}
      </div>
      {showUpgrade ? (
        <UpgradeModal
          feature={promo.tier_required === "elite" ? "match_alerts" : "reservation_request"}
          requiredTier={promo.tier_required === "elite" ? "elite" : "fan"}
          onClose={() => setShowUpgrade(false)}
        />
      ) : null}
    </>
  );
}
