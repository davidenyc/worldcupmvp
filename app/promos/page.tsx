import Link from "next/link";

import { PromoCard } from "@/components/promos/PromoCard";
import { PromoFilterBar } from "@/components/promos/PromoFilterBar";
import { PromosHero } from "@/components/promos/PromosHero";
import { HOST_CITIES, getHostCity } from "@/lib/data/hostCities";
import { getAllPromos, getPromosByCity } from "@/lib/data/promos";
import { getMapPageData } from "@/lib/data/repository";

export default async function PromosPage({
  searchParams
}: {
  searchParams?: { city?: string; country?: string; matchId?: string };
}) {
  const requestedCity = getHostCity(searchParams?.city)?.key ?? null;
  const allPromos = getAllPromos();
  const defaultCountry = allPromos.find((promo) => promo.countrySlugs.length > 0)?.countrySlugs[0];
  const defaultMatchId = allPromos.find((promo) => (promo.matchIds ?? []).length > 0)?.matchIds?.[0];
  const cityOrder = requestedCity
    ? [requestedCity, ...HOST_CITIES.map((city) => city.key).filter((key) => key !== requestedCity)]
    : HOST_CITIES.map((city) => city.key);

  const citySections = await Promise.all(
    cityOrder.map(async (cityKey) => {
      const city = HOST_CITIES.find((entry) => entry.key === cityKey);
      if (!city) return null;

      const mapData = await getMapPageData(city.key);
      const promos = getPromosByCity(city.key, mapData.venues).slice(0, 4);
      const venueLookup = new Map(mapData.venues.map((venue) => [venue.slug, venue] as const));

      return {
        city,
        promos,
        venueLookup
      };
    })
  );

  const populatedSections = citySections.filter(
    (section): section is NonNullable<typeof section> => Boolean(section && section.promos.length)
  );

  return (
    <main className="container-shell space-y-8 py-6 sm:py-10">
      <section className="space-y-5">
        <PromosHero cityLabel={getHostCity(requestedCity ?? "nyc")?.label ?? "New York"} />
        <PromoFilterBar
          defaultCity={requestedCity ?? "nyc"}
          defaultCountry={defaultCountry}
          defaultMatchId={defaultMatchId}
        />
      </section>

      {populatedSections.map(({ city, promos, venueLookup }) => (
        <section key={city.key} className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-sm uppercase tracking-[0.18em] text-mist">{city.label}</div>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-deep">
                Promos in {city.label}
              </h2>
            </div>
            <Link
              href={`/${city.key}/map`}
              className="inline-flex min-h-11 items-center rounded-full border border-line bg-white px-4 text-sm font-semibold text-ink transition hover:bg-surface"
            >
              Browse the map →
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {promos.map((promo) => {
              const venue = venueLookup.get(promo.venue_id);
              return (
                <PromoCard
                  key={promo.id}
                  promo={promo}
                  venueName={venue?.name ?? "Partner venue"}
                  reservationUrl={venue?.reservationUrl}
                  compact
                />
              );
            })}
          </div>
        </section>
      ))}
    </main>
  );
}
