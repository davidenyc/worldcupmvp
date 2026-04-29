import { USAHomepage } from "@/components/home/USAHomepage";

export default function AppHomePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "GameDay Map",
    url: "https://gamedaymap.com/app",
    description:
      "Find the best bars and restaurants to watch World Cup 2026 with fans from your country."
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
