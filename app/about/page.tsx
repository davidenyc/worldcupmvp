import { Badge } from "@/components/ui/badge";

const sections = [
  {
    title: "What it is",
    body:
      "GameDay Map helps supporters find the best bars and restaurants to watch World Cup 2026 with fans from their country."
  },
  {
    title: "Who built it",
    body:
      "Built for the World Cup 2026 run-up as a fan-first venue finder focused on real host-city energy, not generic listings."
  },
  {
    title: "How to submit a venue",
    body:
      "Use the Submit a Venue flow to send in a bar, restaurant, or supporter hangout that deserves to be on the map."
  },
  {
    title: "How to get listed",
    body:
      "Venue owners, supporter groups, and local partners can submit details, updates, and matchday information for review."
  }
];

export default function AboutPage() {
  return (
    <div className="container-shell py-6 sm:py-10">
      <div className="max-w-4xl">
        <Badge>About GameDay Map</Badge>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-deep sm:text-5xl">
          Built for World Cup 2026 fans looking for the right room
        </h1>
        <p className="mt-4 text-base leading-7 text-navy/72 sm:mt-5 sm:text-lg sm:leading-8">
          GameDay Map is a production World Cup 2026 web app for fans who want to find the best place to watch,
          meet their crowd, and turn matchday into a real event.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:mt-10 md:grid-cols-2">
        {sections.map((section) => (
          <div key={section.title} className="surface p-5">
            <h2 className="text-xl font-semibold">{section.title}</h2>
            <p className="mt-3 text-sm leading-6 text-navy/72">{section.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
