// QR code section for /me listing claimed promos or an empty state pointing to /promos.
"use client";

import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import type { SavedPromo } from "@/lib/data/promos";

export function MyQRCodes({
  savedPromos
}: {
  savedPromos: SavedPromo[];
}) {
  return (
    <section className="surface p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm uppercase tracking-[0.2em] text-mist">My QR codes</div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-deep">Saved promos</h2>
        </div>
        <Link href="/promos" className="inline-flex min-h-11 items-center rounded-full border border-line bg-surface px-4 text-sm font-semibold text-deep transition hover:bg-surface-2">
          Browse promos →
        </Link>
      </div>

      <div className="mt-5">
        {savedPromos.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {savedPromos.map((promo) => (
              <div key={promo.promoId} className="rounded-2xl border border-line bg-surface-2 p-4">
                <div className="text-base font-semibold text-deep">{promo.code}</div>
                <div className="mt-1 text-sm text-mist">Valid until {new Date(promo.expiresAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</div>
              </div>
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
    </section>
  );
}
