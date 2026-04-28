// Horizontal promo carousel used on /promos for country-specific deal groupings.
"use client";

import { PromoCard } from "@/components/promos/PromoCard";
import type { PromoRecord } from "@/lib/data/promos";

type VenueMeta = {
  name: string;
  reservationUrl?: string;
};

export function PromoCarousel({
  title,
  promos,
  venueLookup
}: {
  title: string;
  promos: PromoRecord[];
  venueLookup: Record<string, VenueMeta>;
}) {
  if (!promos.length) return null;

  return (
    <section className="space-y-4">
      <div>
        <div className="text-sm uppercase tracking-[0.18em] text-mist">By country</div>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-deep">{title}</h2>
      </div>
      <div className="flex snap-x gap-4 overflow-x-auto pb-2">
        {promos.map((promo) => (
          <div key={promo.id} className="min-w-[18rem] snap-start md:min-w-[20rem]">
            <PromoCard
              promo={promo}
              venueName={venueLookup[promo.venue_id]?.name ?? "Partner venue"}
              reservationUrl={venueLookup[promo.venue_id]?.reservationUrl}
              compact
            />
          </div>
        ))}
      </div>
    </section>
  );
}
