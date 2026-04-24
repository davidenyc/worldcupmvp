import { Badge } from "@/components/ui/badge";

const principles = [
  "No scraping of restricted consumer platforms",
  "Curated venue data with room for official APIs and partner feeds",
  "Provider-agnostic map and venue sourcing layer",
  "Curation plus user submissions with moderation",
  "Ranking transparency with explicit reasons"
];

export default function AboutPage() {
  return (
    <div className="container-shell py-6 sm:py-10">
      <div className="max-w-4xl">
        <Badge>About GameDay Map</Badge>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-deep sm:text-5xl">Built for game-day discovery, not scraping hacks</h1>
        <p className="mt-4 text-base leading-7 text-navy/72 sm:mt-5 sm:text-lg sm:leading-8">
          GameDay Map helps supporters find restaurants, bars, cafes, and fan hubs across the 2026 World Cup host cities that match their national team or culture. The product is built around curated venue data, modular providers, and future official integrations.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:mt-10 md:grid-cols-2">
        {principles.map((principle) => (
          <div key={principle} className="surface p-5">
            <h2 className="text-xl font-semibold">{principle}</h2>
          </div>
        ))}
      </div>
    </div>
  );
}
