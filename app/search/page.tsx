import { SearchPageClient } from "@/components/search/SearchPageClient";
import { HOST_CITIES } from "@/lib/data/hostCities";
import { getMapPageData } from "@/lib/data/repository";

export default async function SearchPage({
  searchParams
}: {
  searchParams?: { city?: string };
}) {
  const cityOptions = HOST_CITIES;
  const initialCity = searchParams?.city && cityOptions.some((item) => item.key === searchParams.city)
    ? searchParams.city
    : "nyc";

  const venuesByCity = Object.fromEntries(
    await Promise.all(
      cityOptions.map(async (city) => [city.key, (await getMapPageData(city.key)).venues] as const)
    )
  );

  return <SearchPageClient initialCity={initialCity} venuesByCity={venuesByCity} />;
}
