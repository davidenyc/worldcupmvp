import { notFound } from "next/navigation";

import { PromoDetailClient } from "@/components/promos/PromoDetailClient";
import { getPromoSeedById } from "@/lib/data/promos";
import { getMapPageData } from "@/lib/data/repository";

export default async function PromoDetailPage({
  params
}: {
  params: { id: string };
}) {
  const promo = getPromoSeedById(params.id);
  if (!promo) notFound();

  const mapData = await getMapPageData(promo.cityKey);
  const venue = mapData.venues.find((entry) => entry.slug === promo.venueSlug) ?? null;

  return (
    <main className="container-shell py-6 sm:py-10">
      <PromoDetailClient
        promo={promo}
        venueName={venue?.name ?? promo.venueSlug}
        reservationUrl={venue?.reservationUrl}
      />
    </main>
  );
}
