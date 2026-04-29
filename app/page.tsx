import type { Metadata } from "next";

import { HomeEntryGate } from "@/components/marketing/HomeEntryGate";
import { MarketingLanding } from "@/components/marketing/MarketingLanding";

export const metadata: Metadata = {
  title: "GameDay Map · Find your World Cup 2026 watch party",
  description: "Find World Cup 2026 watch parties, fan bars, and supporter rooms across all 17 host cities.",
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
      "Find the best bars and restaurants to watch World Cup 2026 with fans from your country."
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <HomeEntryGate>
        <MarketingLanding />
      </HomeEntryGate>
    </>
  );
}
