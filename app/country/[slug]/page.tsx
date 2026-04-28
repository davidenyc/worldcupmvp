import type { Metadata } from "next";
import { readFile } from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import { notFound } from "next/navigation";

import { EmptyState } from "@/components/ui/EmptyState";
import { demoCountries } from "@/lib/data/demo";
import { HOST_CITIES, getHostCity } from "@/lib/data/hostCities";
import { worldCup2026Matches } from "@/lib/data/matches";
import { getAllCountries, getMapPageData } from "@/lib/data/repository";

async function getCountryVenueBuckets() {
  const cityResults = await Promise.all(
    HOST_CITIES.map(async (city) => ({ city, data: await getMapPageData(city.key) }))
  );

  return cityResults.map(({ city, data }) => ({
    city,
    venues: data.venues.filter((venue) => venue.likelySupporterCountry)
  }));
}

async function getCountryGuideIntro(slug: string) {
  try {
    const filePath = path.join(process.cwd(), "mvp/content/countries", `${slug}.md`);
    const raw = await readFile(filePath, "utf8");
    const withoutFrontmatter = raw.replace(/^---[\s\S]*?---\n*/, "");
    const withoutHeading = withoutFrontmatter.replace(/^# .*\n+/, "");
    const paragraphs = withoutHeading
      .split(/\n\s*\n/)
      .map((block) => block.replace(/^##.*$/gm, "").trim())
      .filter(Boolean);
    return paragraphs[0] ?? null;
  } catch {
    return null;
  }
}

export async function generateStaticParams() {
  return demoCountries.map((country) => ({ slug: country.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const countries = await getAllCountries();
  const country = countries.find((item) => item.slug === params.slug);

  if (!country) {
    return {
      title: "GameDay Map",
      description: "World Cup 2026 fan venue finder."
    };
  }

  return {
    title: `Best ${country.name} Watch Party Bars in the US | GameDay Map`,
    description: `Find every ${country.name} bar and restaurant across all 17 World Cup 2026 host cities. Find your fellow supporters and watch the games together.`
  };
}

export default async function CountryPage({ params }: { params: { slug: string } }) {
  try {
    const [countries, buckets, guideIntro] = await Promise.all([
      getAllCountries(),
      getCountryVenueBuckets(),
      getCountryGuideIntro(params.slug)
    ]);
    const country = countries.find((item) => item.slug === params.slug);

    if (!country) notFound();

    const citySections = buckets
      .map((bucket) => ({
        city: bucket.city,
        venues: bucket.venues.filter((venue) => venue.likelySupporterCountry === params.slug)
      }))
      .filter((section) => section.venues.length > 0);

    const venueCount = citySections.reduce((sum, section) => sum + section.venues.length, 0);
    const matches = worldCup2026Matches
      .filter(
        (match) =>
          match.homeCountry === params.slug ||
          match.awayCountry === params.slug ||
          match.homeCountry === "tbd"
      )
      .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));

    return (
      <main className="bg-[#f7fafc] pb-12">
        <section className="bg-[#0a1628] px-4 py-14 text-white sm:px-6 lg:px-8">
          <div className="container-shell">
            <div className="text-[80px] leading-none">{country.flagEmoji || "🏳"}</div>
            <h1 className="mt-4 text-4xl font-bold tracking-tight">{country.name}</h1>
            <div className="mt-3 text-lg text-white/70">
              {venueCount} venues · {citySections.length} cities
            </div>
            <div className="mt-2 text-sm uppercase tracking-[0.24em] text-[#f4b942]">Find your supporters</div>
          </div>
        </section>

        <div className="container-shell space-y-10 px-4 py-8 sm:px-6 lg:px-8">
          {guideIntro ? (
            <section className="rounded-[1.75rem] border border-[#d8e3f5] bg-white p-5 text-[#0a1628] shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0a1628]/45">Country guide</div>
              <p className="mt-3 max-w-3xl text-base leading-7 text-[#0a1628]/78">{guideIntro}</p>
            </section>
          ) : null}
          {citySections.length ? (
            citySections.map((section) => (
              <section key={section.city.key} className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold text-[#0a1628]">{section.city.label}</h2>
                    <div className="text-sm text-[#0a1628]/60">{section.venues.length} venues for {country.name} fans</div>
                  </div>
                  <Link href={`/${section.city.key}/map?countries=${params.slug}`} className="text-sm font-semibold text-[#0a1628] underline">
                    View all in {section.city.label} →
                  </Link>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {section.venues.slice(0, 4).map((venue) => (
                    <Link key={venue.id} href={`/venue/${venue.slug}`} className="min-w-[260px] rounded-[1.5rem] border border-[#d8e3f5] bg-white p-4 shadow-sm">
                      <div className="text-lg font-semibold text-[#0a1628]">{venue.name}</div>
                      <div className="mt-1 text-sm text-[#0a1628]/60">{venue.neighborhood}</div>
                      <div className="mt-2 text-xs text-[#0a1628]/55">
                        {(venue.rating ?? 0).toFixed(1)} · {venue.venueIntent.replace(/_/g, " ")}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ))
          ) : (
            <EmptyState
              emoji="🏳"
              title={`No venues found for ${country.name} yet`}
              action={
                <Link href="/submit" className="inline-flex rounded-full bg-[#f4b942] px-5 py-2.5 text-sm font-bold text-[#0a1628]">
                  Submit a venue →
                </Link>
              }
            />
          )}

          <section className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-[#0a1628]">Upcoming Matches</h2>
            </div>
            {matches.length ? (
              <div className="grid gap-4">
                {matches.map((match) => {
                  const isTbd = match.homeCountry === "tbd";
                  const opponent = match.homeCountry === params.slug ? match.awayCountry : match.homeCountry;
                  const hostCityKey = getHostCity(match.city)?.key ?? "nyc";
                  return (
                    <div key={match.id} className="rounded-[1.5rem] border border-[#d8e3f5] bg-white p-4">
                      <div className="font-semibold text-[#0a1628]">
                        {new Date(match.startsAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
                      </div>
                      <div className="mt-1 text-sm text-[#0a1628]/60">
                        {isTbd ? "Potential knockout match" : `vs ${opponent}`} · {match.stadiumName}, {match.city}
                      </div>
                      <Link
                        href={isTbd ? "/nyc/matches" : `/${hostCityKey}/map?countries=${params.slug}`}
                        className="mt-3 inline-flex text-sm font-semibold text-[#0a1628] underline"
                      >
                        {isTbd ? "View full schedule →" : "Find bars →"}
                      </Link>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-[1.5rem] border border-[#d8e3f5] bg-white p-4 text-sm text-[#0a1628]/60">
                No matches found — explore the full schedule. <Link href="/nyc/matches" className="font-semibold underline">Go to matches</Link>
              </div>
            )}
          </section>
        </div>
      </main>
    );
  } catch {
    notFound();
  }
}
