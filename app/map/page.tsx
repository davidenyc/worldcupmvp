import type { Metadata } from "next";

import { MapPageClient } from "@/components/map/MapPageClient";
import { getAllCountries, getMapPageData } from "@/lib/data/repository";

export async function generateMetadata({
  searchParams
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}): Promise<Metadata> {
  const countrySlug = searchParams?.country;
  const vsCountrySlug = searchParams?.vsCountry;
  const countries = await getAllCountries();
  const country = Array.isArray(countrySlug)
    ? countries.find((item) => item.slug === countrySlug[0])
    : countries.find((item) => item.slug === countrySlug);
  const vsCountry = Array.isArray(vsCountrySlug)
    ? countries.find((item) => item.slug === vsCountrySlug[0])
    : countries.find((item) => item.slug === vsCountrySlug);

  if (country && vsCountry) {
    return {
      title: `${country.name} vs ${vsCountry.name} watch spots in NYC · GameDay Map`,
      description: `Find the best places in New York City to watch ${country.name} vs ${vsCountry.name} at the 2026 World Cup.`
    };
  }

  if (country) {
    return {
      title: `${country.name} World Cup watch spots in NYC · GameDay Map`,
      description: `Find the best bars and restaurants to watch ${country.name} at the 2026 World Cup in New York City.`
    };
  }

  return {
    title: "NYC World Cup 2026 Fan Map · Find your watch spot",
    description: "Explore World Cup 2026 supporter spots across NYC with flags, filters, match schedules, and shareable map views."
  };
}

export default async function MapPage() {
  const data = await getMapPageData();
  return <MapPageClient data={data} />;
}
