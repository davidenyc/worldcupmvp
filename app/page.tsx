import type { Metadata } from "next";

import { HomeEntryGate } from "@/components/marketing/HomeEntryGate";
import { MarketingLanding } from "@/components/marketing/MarketingLanding";
import { getSiteUrl } from "@/lib/seo/metadata";

export const metadata: Metadata = {
  title: "Find your World Cup 2026 watch party · GameDay Map",
  description: "17 host cities. 48 nations. Watch parties planned by fans, ranked by who actually shows up.",
  openGraph: {
    images: ["/api/og?type=home"]
  },
  twitter: {
    card: "summary_large_image",
    images: ["/api/og?type=home"]
  }
};

export default function HomePage() {
  const siteUrl = getSiteUrl();
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "GameDay Map",
    url: siteUrl,
    description:
      "17 host cities. 48 nations. Watch parties planned by fans, ranked by who actually shows up.",
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <HomeEntryGate />
      <MarketingLanding />
    </>
  );
}
