// QR code section for /me listing claimed promos or an empty state pointing to /promos.
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { QRCodeModal } from "@/components/me/QRCodeModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { MockQRCode } from "@/components/ui/MockQRCode";
import type { Promo, SavedPromo } from "@/lib/data/promos";
import type { RankedVenue } from "@/lib/types";

export function MyQRCodes({
  savedPromos,
  promos,
  venues
}: {
  savedPromos: SavedPromo[];
  promos: Promo[];
  venues: RankedVenue[];
}) {
  const [selectedPromoId, setSelectedPromoId] = useState<string | null>(null);
  const promoLookup = useMemo(() => new Map(promos.map((promo) => [promo.id, promo] as const)), [promos]);
  const venueLookup = useMemo(() => new Map(venues.map((venue) => [venue.slug, venue] as const)), [venues]);
  const selectedSavedPromo = selectedPromoId
    ? savedPromos.find((promo) => promo.promoId === selectedPromoId) ?? null
    : null;
  const selectedPromo = selectedSavedPromo ? promoLookup.get(selectedSavedPromo.promoId) ?? null : null;
  const selectedVenue = selectedPromo ? venueLookup.get(selectedPromo.venueSlug) ?? null : null;

  return (
    <section className="surface p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-mist">My Cup QR codes</div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-deep">Saved promos</h2>
        </div>
        {savedPromos.length ? (
          <Link href="/promos" className="inline-flex min-h-11 items-center rounded-full border border-line bg-surface px-4 text-sm font-semibold text-deep transition hover:bg-surface-2">
            Browse promos →
          </Link>
        ) : null}
      </div>

      <div className="mt-5">
        {savedPromos.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {savedPromos.map((promo) => (
              (() => {
                const promoMeta = promoLookup.get(promo.promoId);
                const venue = promoMeta ? venueLookup.get(promoMeta.venueSlug) ?? null : null;
                if (!promoMeta) return null;

                return (
                  <button
                    key={promo.promoId}
                    type="button"
                    onClick={() => setSelectedPromoId(promo.promoId)}
                    className="rounded-2xl border border-line bg-surface-2 p-4 text-left transition hover:border-line-strong"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-base font-semibold text-deep">{promoMeta.title}</div>
                        <div className="mt-1 text-sm text-mist">{venue?.name ?? promoMeta.venueSlug}</div>
                      </div>
                      <span className="rounded-full border border-line bg-surface px-3 py-1 text-xs font-semibold text-deep">
                        Show QR
                      </span>
                    </div>
                    <div className="mt-4 flex items-center gap-4">
                      <MockQRCode code={promo.code} className="h-24 w-24 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs uppercase tracking-[0.18em] text-mist">Code</div>
                        <div className="mt-1 text-sm font-semibold tracking-[0.22em] text-deep">{promo.code}</div>
                        <div className="mt-3 text-sm text-mist">
                          Valid until{" "}
                          {new Date(promo.expiresAt).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit"
                          })}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })()
            ))}
          </div>
        ) : (
          <EmptyState
            emoji="🏷️"
            title="No codes yet"
            subtitle="Claim a deal in Promos and it will land here with a QR you can show at the venue."
            action={
              <Link href="/promos" className="inline-flex rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-deep">
                Browse Promos →
              </Link>
            }
          />
        )}
      </div>

      {selectedSavedPromo && selectedPromo ? (
        <QRCodeModal
          savedPromo={selectedSavedPromo}
          promo={selectedPromo}
          venue={selectedVenue}
          onClose={() => setSelectedPromoId(null)}
        />
      ) : null}
    </section>
  );
}
