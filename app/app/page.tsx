import type { Metadata } from "next";

import { USAHomepage } from "@/components/home/USAHomepage";
import { getHostCity } from "@/lib/data/hostCities";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const profile = user
    ? await prisma.profile.findUnique({
        where: { id: user.id },
        select: { homeCity: true, favoriteCity: true }
      })
    : null;
  const cityKey = profile?.homeCity ?? profile?.favoriteCity ?? "nyc";
  const cityLabel = getHostCity(cityKey)?.label ?? "New York";

  return {
    title: `Tonight's World Cup watch parties in ${cityLabel} · GameDay Map`,
    description: "Live venue counts and crowd signals for every match. Find your spot before kickoff.",
    openGraph: {
      images: [`/api/og?type=tonight&city=${cityKey}`]
    },
    twitter: {
      card: "summary_large_image",
      images: [`/api/og?type=tonight&city=${cityKey}`]
    }
  };
}

export default function AppHomePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "GameDay Map",
    url: "https://gamedaymap.com/app",
    description:
      "Live venue counts and crowd signals for every match. Find your spot before kickoff."
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <USAHomepage />
    </>
  );
}
