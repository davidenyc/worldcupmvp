// Promo detail client for /promos/[id], handling save/redeem state and inline QR presentation.
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { MockQRCode } from "@/components/ui/MockQRCode";
import { UpgradePrompt } from "@/components/membership/UpgradePrompt";
import type { Promo } from "@/lib/data/promos";
import { useMembership } from "@/lib/store/membership";
import { useSavedPromosStore } from "@/lib/store/savedPromos";
import { useUser } from "@/lib/store/user";
import { toast } from "@/lib/toast";

export function PromoDetailClient({
  promo,
  venueName,
  reservationUrl
}: {
  promo: Promo;
  venueName: string;
  reservationUrl?: string;
}) {
  const { tier } = useMembership();
  const user = useUser();
  const savedPromos = useSavedPromosStore((state) => state.savedPromos);
  const savePromo = useSavedPromosStore((state) => state.savePromo);
  const [saving, setSaving] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const savedPromo = useMemo(
    () => savedPromos.find((entry) => entry.promoId === promo.id) ?? null,
    [promo.id, savedPromos]
  );
  const requiredTier = promo.tier === "elite" ? "elite" : promo.tier === "fan" ? "fan" : null;

  async function handleRedeem() {
    if (requiredTier === "elite" && tier !== "elite") {
      setShowUpgrade(true);
      return;
    }

    if (requiredTier === "fan" && tier === "free") {
      setShowUpgrade(true);
      return;
    }

    if (savedPromo) return;

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

    const payload = (await response.json()) as {
      savedPromo?: import("@/lib/data/promos").SavedPromo;
      redemptionCode?: string;
      error?: string;
    };
    setSaving(false);

    if (!response.ok || !payload.savedPromo) {
      toast.error(payload.error ?? "Could not save this promo right now.");
      return;
    }

    savePromo(payload.savedPromo);
    toast.success("Saved to My Cup");
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-line bg-[radial-gradient(circle_at_top_left,rgba(244,185,66,0.16),transparent_36%),linear-gradient(145deg,var(--bg-surface),var(--bg-surface-elevated))] p-6 sm:p-8">
        <div className="text-[10px] uppercase tracking-[0.18em] text-mist">Promo detail</div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-deep sm:text-4xl">{promo.title}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-mist sm:text-base">{promo.description ?? promo.body}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <span className="inline-flex min-h-10 items-center rounded-full border border-line bg-surface px-4 text-sm font-semibold text-deep">
            {venueName}
          </span>
          <span className="inline-flex min-h-10 items-center rounded-full border border-line bg-surface px-4 text-sm text-mist">
            Valid until {new Date(promo.validTo ?? promo.endsAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
          </span>
          {requiredTier ? (
            <span className="inline-flex min-h-10 items-center rounded-full border border-gold/50 bg-gold/12 px-4 text-sm font-semibold text-deep">
              {requiredTier === "elite" ? "Elite-only" : "Fan Pass"}
            </span>
          ) : null}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_22rem]">
        <div className="rounded-[2rem] border border-line bg-surface p-6">
          <div className="text-[10px] uppercase tracking-[0.18em] text-mist">Terms</div>
          <div className="mt-2 text-base font-semibold text-deep">What you get</div>
          <p className="mt-3 text-sm leading-7 text-mist">{promo.description ?? promo.body}</p>
          <div className="mt-6 text-base font-semibold text-deep">Fine print</div>
          <p className="mt-3 text-sm leading-7 text-mist">{promo.terms}</p>
          {reservationUrl ? (
            <a
              href={reservationUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex min-h-11 items-center rounded-full border border-line bg-surface-2 px-4 text-sm font-semibold text-deep transition hover:bg-surface"
            >
              Reserve at venue →
            </a>
          ) : null}
        </div>

        <div className="rounded-[2rem] border border-line bg-surface p-6">
          <div className="text-[10px] uppercase tracking-[0.18em] text-mist">Redemption</div>
          {savedPromo ? (
            <>
              <div className="mt-2 text-xl font-semibold text-deep">Your QR is ready</div>
              <MockQRCode code={savedPromo.code} className="mt-5 h-64 w-64 max-w-full" />
              <div className="mt-4 text-xs uppercase tracking-[0.18em] text-mist">Backup code</div>
              <div className="mt-1 text-lg font-semibold tracking-[0.22em] text-deep">{savedPromo.code}</div>
              <Link
                href="/me"
                className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-gold px-4 text-sm font-semibold text-deep"
              >
                Open My Cup →
              </Link>
            </>
          ) : (
            <>
              <div className="mt-2 text-xl font-semibold text-deep">
                {requiredTier === "elite" ? "Elite-only redemption" : "Save this deal to My Cup"}
              </div>
              <p className="mt-3 text-sm leading-7 text-mist">
                {requiredTier === "elite"
                  ? "This perk is reserved for Elite members. Upgrade to unlock the QR and save it to your wallet."
                  : "Claim the code now and it will show up in your My Cup QR wallet for match day."}
              </p>
              <button
                type="button"
                onClick={handleRedeem}
                className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-gold px-4 text-sm font-semibold text-deep"
              >
                {saving ? "Saving…" : requiredTier === "elite" && tier !== "elite" ? "Upgrade to Elite →" : "Redeem →"}
              </button>
            </>
          )}
        </div>
      </section>

      {showUpgrade ? (
        <UpgradePrompt
          feature={requiredTier === "elite" ? "match_alerts" : "reservation_request"}
          requiredTier={requiredTier === "elite" ? "elite" : "fan"}
          onClose={() => setShowUpgrade(false)}
        />
      ) : null}
    </div>
  );
}
