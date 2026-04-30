import type { Metadata } from "next";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { notFound } from "next/navigation";

import { MapPageClient } from "@/components/map/MapPageClient";
import { getMapPageData } from "@/lib/data/repository";
import { getHostCity } from "@/lib/data/hostCities";
import { buildMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbList, toAbsoluteUrl } from "@/lib/seo/schema";

async function getCityGuideIntro(cityKey: string) {
  try {
    const city = getHostCity(cityKey);
    if (!city) return null;
    const code = city.shortLabel.toUpperCase();
    const filePath = path.join(process.cwd(), "mvp/content/cities", `${code}.md`);
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

export async function generateMetadata({
  params
}: {
  params: { city: string };
}): Promise<Metadata> {
  const city = getHostCity(params.city);
  if (!city) {
    return buildMetadata({
      title: "City map",
      description: "Find World Cup 2026 watch parties near you."
    });
  }

  const data = await getMapPageData(city.key);
  const neighborhoods = Array.from(new Set(data.venues.map((venue) => venue.neighborhood))).slice(0, 3);
  const description = `Find the best ${city.label} bars and restaurants to watch World Cup 2026 matches with fans from your country. ${data.venues.length} curated venues across ${neighborhoods.join(", ")}.`;
  return buildMetadata({
    title: `${city.label} map`,
    description,
    path: `/${city.key}/map`,
    image: `/api/og?type=city-map&city=${city.key}`
  });
}

export default async function MapPage({
  params
}: {
  params: { city: string };
}) {
  const city = getHostCity(params.city);
  if (!city) notFound();

  const [data, cityGuideIntro] = await Promise.all([getMapPageData(city.key), getCityGuideIntro(city.key)]);
  const localBusinessSchemas = data.venues
    .slice()
    .sort((left, right) => (right.reviewCount ?? 0) - (left.reviewCount ?? 0) || (right.rating ?? 0) - (left.rating ?? 0))
    .slice(0, 10)
    .map((venue) => ({
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name: venue.name,
      description: venue.description,
      address: venue.address,
      telephone: venue.phone ?? undefined,
      servesCuisine: venue.cuisineTags?.length ? venue.cuisineTags : undefined,
      areaServed: city.label,
      url: toAbsoluteUrl(`/venue/${venue.slug}`),
      ...(venue.rating && venue.reviewCount
        ? {
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: venue.rating,
              reviewCount: venue.reviewCount
            }
          }
        : {})
    }));
  const breadcrumbSchema = buildBreadcrumbList([
    { name: "Home", path: "/" },
    { name: city.label, path: `/${city.key}` },
    { name: "Map", path: `/${city.key}/map` }
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {localBusinessSchemas.length ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchemas) }}
        />
      ) : null}
      <MapPageClient data={data} city={city.key} cityGuideIntro={cityGuideIntro} />
    </>
  );
}
