import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getHostCity } from "@/lib/data/hostCities";
import { buildMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({
  params
}: {
  params: { city: string };
}): Promise<Metadata> {
  const city = getHostCity(params.city);
  return buildMetadata({
    title: city ? `${city.label} watch parties` : "Host city watch parties",
    description: city
      ? `Jump into ${city.label} World Cup watch parties, fan rooms, and venue picks before you open the full city map.`
      : "Open a host city landing page and jump into the right World Cup map fast.",
    path: city ? `/${city.key}` : undefined
  });
}

export default function CityLandingPage({
  params
}: {
  params: { city: string };
}) {
  redirect(`/${params.city}/map`);
}
