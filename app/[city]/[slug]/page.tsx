import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getHostCity } from "@/lib/data/hostCities";
import { buildMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({
  params
}: {
  params: { city: string; slug: string };
}): Promise<Metadata> {
  const city = getHostCity(params.city);
  return buildMetadata({
    title: city ? `${city.label} venue redirect` : "Venue redirect",
    description: city
      ? `Redirecting to the GameDay Map venue page for a World Cup watch spot in ${city.label}.`
      : "Redirecting to the latest GameDay Map venue page.",
    path: city ? `/${city.key}/${params.slug}` : undefined,
    robots: {
      index: false,
      follow: true
    }
  });
}

export default function LegacyCityVenuePage({
  params
}: {
  params: { city: string; slug: string };
}) {
  redirect(`/venue/${params.slug}`);
}
