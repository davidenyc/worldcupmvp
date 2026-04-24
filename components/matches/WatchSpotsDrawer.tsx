"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { WorldCupMatch } from "@/lib/data/matches";
import { CountrySummary, Venue } from "@/lib/types";

function getCountry(countries: CountrySummary[], slug: string | null) {
  if (!slug) return null;
  return countries.find((country) => country.slug === slug) ?? null;
}

function intentLabel(venueIntent: Venue["venueIntent"]) {
  if (venueIntent === "cultural_dining") {
    return "🍽️ Authentic dining";
  }
  if (venueIntent === "both") {
    return "🏆 Both";
  }
  return "📺 Showing games";
}

export function WatchSpotsDrawer({
  open,
  cityKey,
  cityLabel,
  match,
  venues,
  countries,
  onClose
}: {
  open: boolean;
  cityKey: string;
  cityLabel: string;
  match: WorldCupMatch | null;
  venues: Venue[];
  countries: CountrySummary[];
  onClose: () => void;
}) {
  const home = match ? getCountry(countries, match.homeCountry) : null;
  const away = match ? getCountry(countries, match.awayCountry) : null;

  const matchingVenues = (match
    ? venues.filter(
        (venue) =>
          venue.likelySupporterCountry === match.homeCountry ||
          venue.likelySupporterCountry === match.awayCountry ||
          venue.associatedCountries.includes(match.homeCountry) ||
          venue.associatedCountries.includes(match.awayCountry)
      )
    : [])
    .slice()
    .sort((a, b) => (b.gameDayScore ?? 0) - (a.gameDayScore ?? 0) || (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, 5);

  return (
    <>
      <button
        type="button"
        aria-label="Close watch spots drawer"
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-[#0a1628]/20 transition-opacity md:block ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />

      <aside
        className={`fixed inset-x-0 bottom-0 z-50 flex max-h-[88vh] flex-col overflow-hidden border-t border-[#d8e3f5] bg-white text-[#0a1628] shadow-2xl transition-transform duration-300 ease-out md:bottom-4 md:left-auto md:right-4 md:top-[81px] md:w-[28rem] md:rounded-[1.5rem] md:border md:border-[#d8e3f5] ${
          open ? "translate-y-0 md:translate-y-0" : "translate-y-full md:translate-y-0 md:opacity-0 md:pointer-events-none"
        }`}
      >
        <div className="flex items-center justify-between border-b border-[#eef4ff] px-5 py-4">
          <div>
            <div className="text-xs uppercase tracking-[0.24em] text-[#0a1628]/45">Watch spots</div>
            <h3 className="mt-1 text-lg font-semibold text-[#0a1628]">
              {match ? `${home?.name ?? match.homeCountry} vs ${away?.name ?? match.awayCountry}` : "Select a match"}
            </h3>
            <div className="mt-1 text-sm text-[#0a1628]/50">
              {match ? `${cityLabel} · Top venues for this matchup` : "Choose a match to see venues"}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[#d8e3f5] bg-[#f8fbff] px-3 py-2 text-sm font-semibold text-[#0a1628] transition hover:bg-[#eef4ff]"
          >
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 pb-safe md:px-5 md:py-4">
          {!match ? (
            <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-[#d8e3f5] bg-[#f8fbff] p-8 text-center text-[#0a1628]/50">
              Pick a match to see the top venues in {cityLabel}.
            </div>
          ) : matchingVenues.length ? (
            <div className="space-y-3">
              {matchingVenues.map((venue) => {
                const flag = getCountry(countries, venue.likelySupporterCountry)?.flagEmoji ?? "📍";
                const intent = intentLabel(venue.venueIntent);
                return (
                  <div key={venue.id} className="rounded-2xl border border-[#d8e3f5] bg-[#f8fbff] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{flag}</span>
                        <div>
                          <div className="font-semibold text-[#0a1628]">{venue.name}</div>
                          <div className="mt-1 text-sm text-[#0a1628]/50">{venue.address}</div>
                        </div>
                      </div>
                      <Badge className="border border-[#d8e3f5] bg-white text-[#0a1628]">{intent}</Badge>
                    </div>
                    <div className="mt-3 flex items-center gap-3 text-sm text-[#0a1628]/70">
                      <span>⭐ {Number(venue.rating ?? 0).toFixed(1)}</span>
                      <span className="text-[#0a1628]/30">·</span>
                      <span>{venue.neighborhood}</span>
                    </div>
                    <div className="mt-4">
                      <Link
                        href={`/${cityKey}/map?country=${match.homeCountry}&vsCountry=${match.awayCountry}`}
                        className="inline-flex items-center rounded-full bg-[#f4b942] px-4 py-2 text-sm font-semibold text-[#0a1628] transition hover:bg-[#f0c86b]"
                      >
                        View on map →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-[#d8e3f5] bg-[#f8fbff] p-8 text-center text-[#0a1628]/50">
              No cached venues found yet for this matchup in {cityLabel}.
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
