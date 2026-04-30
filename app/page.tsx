import type { Metadata } from "next";

import { HomeEntryGate } from "@/components/marketing/HomeEntryGate";
import { MarketingLanding } from "@/components/marketing/MarketingLanding";

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
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "GameDay Map",
    url: "https://gamedaymap.com",
    description:
      "17 host cities. 48 nations. Watch parties planned by fans, ranked by who actually shows up."
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
