// First-touch marketing landing used on / before a user has personalized or signed in.
import Link from "next/link";

import { EmailCaptureBanner } from "@/components/marketing/EmailCaptureBanner";
import { HOST_CITIES } from "@/lib/data/hostCities";
import { getAllCountries, getMapPageData } from "@/lib/data/repository";

const howItWorks = [
  {
    title: "Pick your city",
    body: "Start with the host city where you’ll actually be watching, not a generic national guide."
  },
  {
    title: "Find your crowd",
    body: "Filter by country and match so the room already leans toward your fan diaspora."
  },
  {
    title: "Lock the plan",
    body: "Save the right bar, promo, or venue before kickoff turns the city into chaos."
  }
];

const featuredFanGroups = [
  { name: "NYC Argentina Crew", city: "New York", crowd: "Blue-and-white all day." },
  { name: "LA México Locos", city: "Los Angeles", crowd: "Big screens, louder songs, and late goals." },
  { name: "Toronto Red Wave", city: "Toronto", crowd: "Canada nights and away-match energy." },
  { name: "Miami Brazil Block", city: "Miami", crowd: "Flags, drums, and early arrivals." },
  { name: "Seattle England End", city: "Seattle", crowd: "Pub-first, chants-second." },
  { name: "Dallas Colombia Corner", city: "Dallas", crowd: "One room, one heartbeat." }
];

export async function MarketingLanding() {
  const [countries, cityVenueGroups] = await Promise.all([
    getAllCountries(),
    Promise.all(HOST_CITIES.map((city) => getMapPageData(city.key)))
  ]);

  const venueCount = cityVenueGroups.reduce((total, payload) => total + payload.venues.length, 0);

  return (
    <main className="bg-bg text-deep">
      <section className="bg-deep text-[color:var(--fg-on-strong)]">
        <div className="container-shell py-16 sm:py-20">
          <div className="max-w-4xl">
            <div className="text-xs uppercase tracking-[0.3em] text-[color:var(--fg-secondary-on-strong)]">
              World Cup 2026
            </div>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Find your watch party for World Cup 2026.
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-[color:var(--fg-secondary-on-strong)]">
              17 host cities · 48 nations · every fan diaspora.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/welcome"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-gold px-6 text-base font-semibold text-[color:var(--fg-on-accent)]"
              >
                Personalize my Cup →
              </Link>
              <Link
                href="/nyc/map"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 px-6 text-base font-semibold text-[color:var(--fg-on-strong)]"
              >
                See the map →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-bg">
        <div className="container-shell space-y-10 py-10 sm:space-y-12 sm:py-14">
          <section>
            <div className="text-xs uppercase tracking-[0.22em] text-mist">How it works</div>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-deep">
              Find the right room before kickoff.
            </h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {howItWorks.map((step, index) => (
                <div key={step.title} className="surface p-5">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gold text-sm font-bold text-[color:var(--fg-on-accent)]">
                    {index + 1}
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-deep">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--fg-secondary)]">{step.body}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-[0.22em] text-mist">Featured fan groups</div>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-deep">
                  Sample the rooms where supporters already gather.
                </h2>
              </div>
              <Link href="/groups" className="text-sm font-semibold text-deep">
                Explore groups →
              </Link>
            </div>
            <div className="mt-6 flex gap-4 overflow-x-auto pb-2">
              {featuredFanGroups.map((group) => (
                <div key={group.name} className="surface min-w-[16rem] flex-1 p-5 sm:min-w-[18rem]">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-mist">{group.city}</div>
                  <div className="mt-2 text-xl font-semibold text-deep">{group.name}</div>
                  <p className="mt-3 text-sm leading-6 text-[color:var(--fg-secondary)]">{group.crowd}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            {[
              { label: "Host cities", value: HOST_CITIES.length.toString().padStart(2, "0") },
              { label: "Nations tracked", value: countries.length.toString() },
              { label: "Verified venues", value: venueCount.toLocaleString() }
            ].map((metric) => (
              <div key={metric.label} className="surface p-6">
                <div className="text-[10px] uppercase tracking-[0.18em] text-mist">{metric.label}</div>
                <div className="mt-3 text-4xl font-semibold tracking-tight text-deep">{metric.value}</div>
              </div>
            ))}
          </section>

          <EmailCaptureBanner />

          <footer className="flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-line pt-6 text-sm text-[color:var(--fg-secondary)]">
            <Link href="/about" className="font-medium text-deep">
              About
            </Link>
            <Link href="/privacy" className="font-medium text-deep">
              Privacy
            </Link>
            <Link href="/terms" className="font-medium text-deep">
              Terms
            </Link>
            <span className="sm:ml-auto">World Cup 2026 watch parties for real supporter rooms.</span>
          </footer>
        </div>
      </section>
    </main>
  );
}
