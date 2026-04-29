import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function AboutPage() {
  return (
    <div className="container-shell py-6 sm:py-10">
      <div className="max-w-4xl">
        <Badge>About GameDay Map</Badge>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-deep sm:text-5xl">
          Built for World Cup 2026 fans looking for the right room
        </h1>
        <p className="mt-4 text-base leading-7 text-mist sm:mt-5 sm:text-lg sm:leading-8">
          GameDay Map exists because the best World Cup room is rarely the nearest sports bar. Fans want the place
          where the right diaspora actually gathers, where the TVs are set for the match that matters, and where
          the city feels like it belongs to supporters for ninety minutes. We built it to help people land in the
          right room faster across all 17 host cities.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:mt-10 md:grid-cols-3">
        <div className="surface p-5 md:col-span-2">
          <h2 className="text-xl font-semibold text-deep">How we source fan-group venue data</h2>
          <p className="mt-3 text-sm leading-6 text-mist">
            The map blends Google Places discovery with community submissions, editorial review, and crowd-specific
            tagging so a venue can reflect both the city and the supporters who actually show up there on match day.
          </p>
        </div>
        <div className="surface p-5">
          <h2 className="text-xl font-semibold text-deep">Privacy</h2>
          <p className="mt-3 text-sm leading-6 text-mist">
            We keep personalization lightweight and only use what helps your Cup feel like yours.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="surface p-5">
          <h2 className="text-xl font-semibold text-deep">How to submit a venue</h2>
          <p className="mt-3 text-sm leading-6 text-mist">
            Use the Submit a Venue flow to send in a bar, restaurant, or supporter hangout that deserves to be on
            the map.
          </p>
          <Link href="/submit" className="mt-4 inline-flex min-h-11 items-center rounded-full bg-gold px-4 text-sm font-semibold text-[color:var(--fg-on-accent)]">
            Submit a venue →
          </Link>
        </div>
        <div className="surface p-5">
          <h2 className="text-xl font-semibold text-deep">Contact</h2>
          <p className="mt-3 text-sm leading-6 text-mist">
            Venue owners, supporter groups, and local partners can send updates, corrections, and collaboration
            ideas anytime.
          </p>
          <Link href="/contact" className="mt-4 inline-flex min-h-11 items-center rounded-full border border-line bg-surface px-4 text-sm font-semibold text-deep transition hover:bg-surface-2">
            Email the team →
          </Link>
        </div>
      </div>
    </div>
  );
}
