import { Badge } from "@/components/ui/badge";

const principles = [
  "No scraping of restricted consumer platforms",
  "Mock/demo data first, then official APIs and partner feeds",
  "Provider-agnostic map and venue sourcing layer",
  "Curation plus user submissions with moderation",
  "Ranking transparency with explicit reasons"
];

export default function AboutPage() {
  return (
    <div className="container-shell py-10">
      <div className="max-w-4xl">
        <Badge>About GameDay Map</Badge>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight text-deep">Built for game-day discovery, not scraping hacks.</h1>
        <p className="mt-5 text-lg leading-8 text-navy/72">
          GameDay Map helps supporters find restaurants, bars, cafes, and fan hubs in NYC that match their national team or culture. The MVP is designed around mock data, modular providers, and future official integrations.
        </p>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {principles.map((principle) => (
          <div key={principle} className="surface p-5">
            <h2 className="text-xl font-semibold">{principle}</h2>
          </div>
        ))}
      </div>
    </div>
  );
}
