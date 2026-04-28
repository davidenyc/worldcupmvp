import { PromosPageClient } from "@/components/promos/PromosPageClient";
import { HOST_CITIES, getHostCity } from "@/lib/data/hostCities";
import { getPromosByCity } from "@/lib/data/promos";
import { getMapPageData } from "@/lib/data/repository";

export default async function PromosPage({
  searchParams
}: {
  searchParams?: { city?: string; country?: string; matchId?: string };
}) {
  const requestedCity = getHostCity(searchParams?.city)?.key ?? "nyc";
  const cityOrder = requestedCity
    ? [requestedCity, ...HOST_CITIES.map((city) => city.key).filter((key) => key !== requestedCity)]
    : HOST_CITIES.map((city) => city.key);

  const cityPayloads = await Promise.all(
    cityOrder.map(async (cityKey) => {
      const city = HOST_CITIES.find((entry) => entry.key === cityKey);
      if (!city) return null;

      const mapData = await getMapPageData(city.key);
      const promos = getPromosByCity(city.key, mapData.venues);

      return {
        cityKey: city.key,
        cityLabel: city.label,
        promos,
        venues: mapData.venues.map((venue) => ({
          slug: venue.slug,
          name: venue.name,
          reservationUrl: venue.reservationUrl,
          neighborhood: venue.neighborhood
        }))
      };
    })
  );

  const populatedPayloads = cityPayloads.filter(
    (section): section is NonNullable<typeof section> => Boolean(section && section.promos.length)
  );

  return <PromosPageClient initialCity={requestedCity} cityPayloads={populatedPayloads} />;
}
