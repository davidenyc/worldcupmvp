import type { Metadata } from "next";

import { MapPageClient } from "@/components/map/MapPageClient";
import { getAllCountries, getMapPageData } from "@/lib/data/repository";
import { getHostCity } from "@/lib/data/hostCities";

export async function generateMetadata({
  params,
  searchParams
}: {
  params: { city: string };
  searchParams?: Record<string, string | string[] | undefined>;
}): Promise<Metadata> {
  const city = getHostCity(params.city) ?? getHostCity("nyc");
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
      title: `${country.name} vs ${vsCountry.name} watch spots in ${city?.label ?? "the host cities"} · GameDay Map`,
      description: `Find the best places in ${city?.label ?? "the host city"} to watch ${country.name} vs ${vsCountry.name} at the 2026 World Cup.`
    };
  }

  if (city?.country === "canada") {
    return {
      title: `${city.label} World Cup 2026 fan experience · GameDay Map`,
      description: `Find the best bars and restaurants to watch the 2026 World Cup in ${city.label}, Canada.`
    };
  }

  if (city?.country === "mexico") {
    return {
      title: `${city.label} World Cup 2026 fan experience · GameDay Map`,
      description: `Encuentra los mejores bares y restaurantes para ver el Mundial 2026 en ${city.label}.`
    };
  }

  if (country) {
    return {
      title: `${country.name} World Cup watch spots in ${city?.label ?? "the host cities"} · GameDay Map`,
      description: `Find the best bars and restaurants to watch ${country.name} at the 2026 World Cup in ${city?.label ?? "the host city"}.`
    };
  }

  return {
    title: `${city?.label ?? "the host cities"} World Cup 2026 fan experience · GameDay Map`,
    description: `Explore World Cup 2026 supporter spots across ${city?.label ?? "the host cities"} with flags, filters, match schedules, and shareable map views.`
  };
}

export default async function MapPage({
  params
}: {
  params: { city: string };
}) {
  const city = params.city ?? "nyc";
  const data = await getMapPageData(city);
  return <MapPageClient data={data} city={city} />;
}
