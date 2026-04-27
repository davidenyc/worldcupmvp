import Link from "next/link";

import { EmailCaptureBanner } from "@/components/marketing/EmailCaptureBanner";
import { EmptyState } from "@/components/ui/EmptyState";
import { CountdownTimer } from "@/components/ui/CountdownTimer";
import { HOST_CITIES } from "@/lib/data/hostCities";
import { worldCup2026Matches } from "@/lib/data/matches";
import { getAllCountries, getMapPageData } from "@/lib/data/repository";

function resolveCityKey(cityLabel: string, stadiumName?: string) {
  const normalizedCity = cityLabel.toLowerCase();
  const normalizedStadium = (stadiumName ?? "").toLowerCase();

  return (
    HOST_CITIES.find(
      (city) =>
        city.label.toLowerCase() === normalizedCity ||
        city.stadiumName.toLowerCase() === normalizedStadium ||
        city.label.toLowerCase().includes(normalizedCity)
    )?.key ?? "nyc"
  );
}

export default async function TonightPage() {
  const now = Date.now();
  const kickoffTime = Date.parse("2026-06-11T18:00:00.000Z");
  const upcoming = worldCup2026Matches
    .filter((match) => Date.parse(match.startsAt) >= now)
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));
  const tonightMatches = upcoming.filter((match) => Date.parse(match.startsAt) <= now + 24 * 60 * 60 * 1000);
  const firstSixMatches = upcoming.slice(0, 6);
  const isPreTournament = now < kickoffTime;
  const displayMatches = isPreTournament ? firstSixMatches : tonightMatches.length > 0 ? tonightMatches : firstSixMatches;
  const isTournamentOver = upcoming.length === 0;

  const [countries, cityData] = await Promise.all([getAllCountries(), getMapPageData("nyc")]);
  const suggested = cityData.venues.slice(0, 5);
  const firstMatch = firstSixMatches[0];

  return (
    <main>
      <section className="bg-[#0a1628] py-10 text-white">
        <div className="container-shell">
          <div className="text-sm uppercase tracking-[0.2em] text-[#f4b942]">⚽ Tonight&apos;s Matches</div>
          <h1 className="mt-3 text-4xl font-semibold">Find a bar for today&apos;s games</h1>
          <p className="mt-3 text-white/70">Find a bar for today&apos;s games across all 17 host cities.</p>
        </div>
      </section>

      <div className="container-shell space-y-8 py-8">
        <EmailCaptureBanner />

        {isPreTournament && firstMatch ? (
          <section className="rounded-[2rem] border border-[#d8e3f5] bg-white p-6">
            <div className="text-2xl font-bold text-[#0a1628]">World Cup 2026 starts in</div>
            <div className="mt-4">
              <CountdownTimer
                targetDate="2026-06-11T18:00:00.000Z"
                label={`Until kickoff — ${new Date(firstMatch.startsAt).toLocaleString("en-US", {
                  dateStyle: "full",
                  timeStyle: "short"
                })}`}
              />
            </div>
            <div className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-[#0a1628]/45">
              Coming up — first matches:
            </div>
          </section>
        ) : null}

        {isTournamentOver ? (
          <EmptyState
            emoji="🏆"
            title="The 2026 World Cup has ended. What a tournament!"
            action={
              <Link href="/" className="inline-flex rounded-full bg-[#f4b942] px-5 py-2.5 text-sm font-bold text-[#0a1628]">
                Back to home
              </Link>
            }
          />
        ) : (
          <section className="space-y-4">
            {displayMatches.map((match) => {
              const isTbd = match.homeCountry === "tbd";
              const home = countries.find((country) => country.slug === match.homeCountry);
              const away = countries.find((country) => country.slug === match.awayCountry);
              const cityKey = resolveCityKey(match.city, match.stadiumName);

              return (
                <div key={match.id} className="surface p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    {isTbd ? (
                      <div className="text-xl font-semibold text-[#0a1628]">
                        🏆 TBD vs TBD —{" "}
                        {new Date(match.startsAt).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short"
                        })}{" "}
                        · {match.stadiumName}, {match.city}
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-wrap items-center gap-3 text-xl font-semibold">
                          <span>{home?.flagEmoji ?? "🏳"}</span>
                          <span>{home?.name ?? match.homeCountry}</span>
                          <span className="text-[#0a1628]/35">VS</span>
                          <span>{away?.flagEmoji ?? "🏳"}</span>
                          <span>{away?.name ?? match.awayCountry}</span>
                        </div>
                        <div className="text-sm text-navy/70">
                          {new Date(match.startsAt).toLocaleString(undefined, {
                            dateStyle: "medium",
                            timeStyle: "short"
                          })}
                        </div>
                      </>
                    )}
                  </div>
                  <div className="mt-2 text-sm text-navy/60">
                    {match.stageLabel ?? match.stage} · {match.stadiumName}, {match.city}
                  </div>
                  <Link
                    href={isTbd ? "/nyc/map" : `/${cityKey}/map?countries=${match.homeCountry},${match.awayCountry}`}
                    className="mt-4 inline-flex rounded-full bg-[#f4b942] px-4 py-2 text-sm font-bold text-[#0a1628]"
                  >
                    {isTbd ? "Watch at a venue →" : "Find bars for this match →"}
                  </Link>
                </div>
              );
            })}
          </section>
        )}

        <section>
          <div className="text-sm uppercase tracking-[0.2em] text-mist">Where to watch in New York</div>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {suggested.map((venue) => (
              <div key={venue.id} className="surface p-4">
                <Link href={`/venue/${venue.slug}`} className="font-semibold text-deep">
                  {venue.name}
                </Link>
                <div className="mt-2 text-sm text-navy/60">{venue.neighborhood}</div>
                <div className="mt-1 text-xs text-navy/55">
                  {(venue.rating ?? 0).toFixed(1)} · {venue.venueIntent.replace(/_/g, " ")}
                </div>
              </div>
            ))}
          </div>
          <Link href="/nyc/map" className="mt-5 inline-flex text-sm font-semibold text-[#0a1628] underline">
            View all NYC venues →
          </Link>
        </section>
      </div>
    </main>
  );
}
