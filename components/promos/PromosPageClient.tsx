// Client hub for /promos that filters the seeded deals and renders featured, live, country, and city sections.
"use client";

import Link from "next/link";
import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { EmptyState } from "@/components/ui/EmptyState";
import { PromoCard } from "@/components/promos/PromoCard";
import { PromoCarousel } from "@/components/promos/PromoCarousel";
import { PromoCityGrid } from "@/components/promos/PromoCityGrid";
import { PromoFilterBar } from "@/components/promos/PromoFilterBar";
import { PromosHero } from "@/components/promos/PromosHero";
import { PromoRecord, isPromoActive } from "@/lib/data/promos";
import { useUser } from "@/lib/store/user";

type VenueMeta = {
  slug: string;
  name: string;
  reservationUrl?: string;
  neighborhood?: string;
};

type CityPayload = {
  cityKey: string;
  cityLabel: string;
  promos: PromoRecord[];
  venues: VenueMeta[];
};

const FEATURED_COUNTRIES = ["brazil", "mexico", "england", "france", "usa", "argentina"];

export function PromosPageClient({
  initialCity,
  cityPayloads
}: {
  initialCity: string;
  cityPayloads: CityPayload[];
}) {
  const user = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeCity = searchParams.get("city");
  const activeCountry = searchParams.get("country");
  const activeMatchId = searchParams.get("matchId");
  const activeFilter = searchParams.get("filter");
  const preferredCountries = user.followedCountries.length ? user.followedCountries : FEATURED_COUNTRIES;

  const allPromos = useMemo(() => cityPayloads.flatMap((payload) => payload.promos), [cityPayloads]);
  const venueLookup = useMemo(
    () =>
      Object.fromEntries(
        cityPayloads.flatMap((payload) =>
          payload.venues.map((venue) => [venue.slug, { name: venue.name, reservationUrl: venue.reservationUrl }] as const)
        )
      ),
    [cityPayloads]
  );

  const filteredPromos = useMemo(() => {
    return allPromos.filter((promo) => {
      if (activeCity && promo.city_key !== activeCity) return false;
      if (activeCountry && !promo.country_slugs.includes(activeCountry)) return false;
      if (activeMatchId && !promo.match_ids.includes(activeMatchId)) return false;
      if (activeFilter === "today" && !isPromoActive(promo)) return false;
      return true;
    });
  }, [activeCity, activeCountry, activeFilter, activeMatchId, allPromos]);

  const featuredPromos = useMemo(
    () =>
      filteredPromos
        .filter((promo) => promo.sponsored)
        .sort((a, b) => (a.sponsorship_tier ?? 99) - (b.sponsorship_tier ?? 99))
        .slice(0, 3),
    [filteredPromos]
  );

  const livePromos = useMemo(() => {
    const liveNow = filteredPromos
      .filter((promo) => isPromoActive(promo))
      .sort((a, b) => Date.parse(a.end_iso) - Date.parse(b.end_iso));
    return liveNow.length ? liveNow : filteredPromos.slice(0, 6);
  }, [filteredPromos]);

  const carousels = useMemo(
    () =>
      preferredCountries.map((country) => ({
        country,
        promos: filteredPromos.filter((promo) => promo.country_slugs.includes(country)).slice(0, 8)
      })).filter((group) => group.promos.length),
    [filteredPromos, preferredCountries]
  );

  const countsByCity = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredPromos.forEach((promo) => {
      counts[promo.city_key] = (counts[promo.city_key] ?? 0) + 1;
    });
    return counts;
  }, [filteredPromos]);

  const defaultCountry = allPromos.find((promo) => promo.country_slugs.length > 0)?.country_slugs[0];
  const defaultMatchId = allPromos.find((promo) => promo.match_ids.length > 0)?.match_ids[0];
  const currentCityLabel =
    cityPayloads.find((payload) => payload.cityKey === (activeCity ?? initialCity))?.cityLabel ?? "New York";

  function setCity(cityKey: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (cityKey) params.set("city", cityKey);
    else params.delete("city");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <main className="container-shell space-y-8 py-6 sm:py-10">
      <section className="space-y-5">
        <PromosHero cityLabel={currentCityLabel} />
        <PromoFilterBar
          defaultCity={initialCity}
          defaultCountry={defaultCountry}
          defaultMatchId={defaultMatchId}
        />
      </section>

      {featuredPromos.length ? (
        <section id="promo-board" className="space-y-4">
          <div>
            <div className="text-sm uppercase tracking-[0.18em] text-mist">Featured</div>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-deep">Paid placements and marquee perks</h2>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {featuredPromos.map((promo) => (
              <PromoCard
                key={promo.id}
                promo={promo}
                venueName={venueLookup[promo.venue_id]?.name ?? "Partner venue"}
                reservationUrl={venueLookup[promo.venue_id]?.reservationUrl}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section id={featuredPromos.length ? undefined : "promo-board"} className="space-y-4">
        <div>
          <div className="text-sm uppercase tracking-[0.18em] text-mist">Live now / today</div>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-deep">Deals you can claim right now</h2>
        </div>
        {livePromos.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {livePromos.map((promo) => (
              <PromoCard
                key={promo.id}
                promo={promo}
                venueName={venueLookup[promo.venue_id]?.name ?? "Partner venue"}
                reservationUrl={venueLookup[promo.venue_id]?.reservationUrl}
                compact
              />
            ))}
          </div>
        ) : (
          <EmptyState
            emoji="🏷️"
            title="No promos match this filter yet"
            subtitle="Try another city or clear the country and match filters to see the full deal board."
            action={
              <button
                type="button"
                onClick={() => router.replace("/promos", { scroll: false })}
                className="inline-flex rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-deep"
              >
                Clear filters →
              </button>
            }
          />
        )}
      </section>

      {carousels.map((group) => (
        <PromoCarousel
          key={group.country}
          title={group.country.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())}
          promos={group.promos}
          venueLookup={venueLookup}
        />
      ))}

      <PromoCityGrid countsByCity={countsByCity} activeCity={activeCity} onSelect={setCity} />

      <section className="rounded-[2rem] border border-line bg-surface p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm uppercase tracking-[0.18em] text-mist">Partners</div>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-deep">Run a bar or restaurant?</h2>
            <p className="mt-2 text-sm text-mist">List your matchday promo for free and get in front of traveling fans.</p>
          </div>
          <Link href="/submit?type=promo" className="inline-flex min-h-11 items-center rounded-full bg-gold px-5 text-sm font-semibold text-deep">
            List your promo →
          </Link>
        </div>
      </section>
    </main>
  );
}
