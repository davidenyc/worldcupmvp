// Fullscreen modal for /me that expands a saved promo QR with venue and expiry context.
"use client";

import { QRCodeImage } from "@/components/ui/QRCodeImage";
import type { Promo, SavedPromo } from "@/lib/data/promos";
import type { RankedVenue } from "@/lib/types";

export function QRCodeModal({
  savedPromo,
  promo,
  venue,
  onClose
}: {
  savedPromo: SavedPromo;
  promo: Promo;
  venue: RankedVenue | null;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/65 p-4 sm:items-center">
      <button type="button" aria-label="Close QR modal" className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-[2rem] border border-line bg-[var(--bg-page)] p-6 shadow-popover">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm uppercase tracking-[0.2em] text-mist">Show at venue</div>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-deep">{promo.title}</h3>
            <p className="mt-2 text-sm leading-6 text-mist">
              {venue?.name ?? promo.venueSlug} · valid until{" "}
              {new Date(savedPromo.expiresAt).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit"
              })}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-11 items-center rounded-full border border-line bg-surface px-4 text-sm font-semibold text-deep transition hover:bg-surface-2"
          >
            Close
          </button>
        </div>

        <div className="mt-6 rounded-[1.75rem] border border-line bg-surface p-4">
          <QRCodeImage
            code={savedPromo.code}
            template={promo.qrTemplate}
            alt={`${promo.title} QR code`}
            className="mx-auto h-72 w-72 max-w-full"
          />
          <div className="mt-4 text-center">
            <div className="text-xs uppercase tracking-[0.24em] text-mist">Backup code</div>
            <div className="mt-2 text-2xl font-semibold tracking-[0.24em] text-deep">{savedPromo.code}</div>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-line bg-surface-2 p-4 text-sm text-mist">
          {venue?.address ? `${venue.address}. ` : ""}
          {promo.body}
        </div>
      </div>
    </div>
  );
}
