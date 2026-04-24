import type { Metadata } from "next";

import { MatchSchedule } from "@/components/matches/MatchSchedule";
import { getAllCountries } from "@/lib/data/repository";
import { worldCup2026Matches } from "@/lib/data/matches";

export const metadata: Metadata = {
  title: "World Cup 2026 Match Schedule · GameDay Map",
  description: "Browse the full 2026 World Cup schedule and jump into NYC watch spots for any match."
};

export default async function MatchesPage() {
  const countries = await getAllCountries();
  const matches = worldCup2026Matches.slice().sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));

  return (
    <div className="container-shell py-10">
      <div className="mb-8 space-y-3">
        <div className="text-sm uppercase tracking-[0.2em] text-mist">World Cup 2026</div>
        <h1 className="text-5xl font-semibold tracking-tight text-deep">World Cup 2026 · Match Schedule</h1>
        <p className="max-w-2xl text-lg leading-8 text-navy/72">Click any match to find watch spots in NYC</p>
      </div>
      <MatchSchedule countries={countries} matches={matches} />
    </div>
  );
}
