import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PromoDetailClient } from "@/components/promos/PromoDetailClient";
import { getHostCity } from "@/lib/data/hostCities";
import { getPromoSeedById } from "@/lib/data/promos";
import { getMapPageData } from "@/lib/data/repository";
import { buildMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbList } from "@/lib/seo/schema";

export async function generateMetadata({
  params
}: {
  params: { id: string };
}): Promise<Metadata> {
  const promo = getPromoSeedById(params.id);

  if (!promo) {
    return buildMetadata({
      title: "Promo not found",
      description: "This GameDay Map promo could not be found or is no longer available.",
      path: `/promos/${params.id}`,
      robots: {
        index: false,
        follow: false
      }
    });
  }

  const cityLabel = getHostCity(promo.cityKey)?.label ?? promo.cityKey.toUpperCase();

  return buildMetadata({
    title: promo.title,
    description: `${promo.title} at ${cityLabel}. Save the deal to My Cup and pull up with the right QR before the room fills.`,
    path: `/promos/${promo.id}`,
    image: `/api/og?type=promos&city=${promo.cityKey}`
  });
}

export default async function PromoDetailPage({
  params
}: {
  params: { id: string };
}) {
  const promo = getPromoSeedById(params.id);
  if (!promo) notFound();

  const mapData = await getMapPageData(promo.cityKey);
  const venue = mapData.venues.find((entry) => entry.slug === promo.venueSlug) ?? null;
  const breadcrumbSchema = buildBreadcrumbList([
    { name: "Home", path: "/" },
    { name: "Promos", path: "/promos" },
    { name: promo.title, path: `/promos/${promo.id}` }
  ]);

  return (
    <main className="container-shell py-6 sm:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <PromoDetailClient
        promo={promo}
        venueName={venue?.name ?? promo.venueSlug}
        reservationUrl={venue?.reservationUrl}
      />
    </main>
  );
}
