"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { HOST_CITIES } from "@/lib/data/hostCities";
import { useMembership } from "@/lib/store/membership";
import { useUser, useUpdateUser } from "@/lib/store/user";

export default function ConciergePage() {
  const user = useUser();
  const updateUser = useUpdateUser();
  const { hasFeature } = useMembership();
  const hasAccess = hasFeature("venue_concierge");
  const [city, setCity] = useState(user.favoriteCity || "nyc");
  const [partySize, setPartySize] = useState(6);
  const [vibe, setVibe] = useState("Lively/loud");
  const [countryAtmosphere, setCountryAtmosphere] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [email, setEmail] = useState(user.email);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateUser({ email });
    setSubmitted(true);
  }

  if (!hasAccess) {
    return (
      <main className="min-h-[100dvh] bg-bg px-4 py-10 sm:px-6 lg:px-8">
        <div className="container-shell max-w-3xl">
          <div className="rounded-[2rem] bg-deep px-8 py-12 text-center text-[color:var(--fg-on-strong)]">
            <div className="text-[80px] leading-none">🔒</div>
            <h1 className="mt-5 text-4xl font-bold tracking-tight">Venue Concierge is an Elite feature</h1>
            <p className="mx-auto mt-4 max-w-2xl text-[color:var(--fg-secondary-on-strong)]">
              Tell us your city, crew size, vibe, and supporter mix. Supporter Elite members get a personalized venue shortlist built for their exact matchday plans.
            </p>
            <Link
              href="/membership?feature=venue_concierge&return=%2Fmembership%2Fconcierge"
              className="mt-6 inline-flex rounded-full bg-gold px-6 py-3 text-sm font-bold text-deep"
            >
              Upgrade to Elite — $12.99/mo
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[100dvh] bg-bg px-4 py-10 sm:px-6 lg:px-8">
      <div className="container-shell max-w-3xl">
        <div className="rounded-[2rem] bg-deep px-6 py-8 text-[color:var(--fg-on-strong)]">
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-gold">SUPPORTER ELITE</div>
          <h1 className="mt-3 text-4xl font-bold tracking-tight">👑 Venue Concierge</h1>
          <p className="mt-3 max-w-2xl text-[color:var(--fg-secondary-on-strong)]">
            Tell us what you&apos;re looking for. We&apos;ll find the perfect bar for your group.
          </p>
        </div>

        <div className="mt-8 rounded-[2rem] border border-line bg-white p-6 shadow-sm">
          {submitted ? (
            <div className="space-y-4 text-center">
              <div className="text-6xl text-emerald-600">✅</div>
              <div className="text-3xl font-bold text-deep">Request received!</div>
              <p className="text-sm text-[color:var(--fg-secondary)]">
                We&apos;ll email {email || "you"} with a personalized venue list within 24 hours. In the meantime, explore the map.
              </p>
              <Link
                href={`/${city}/map`}
                className="inline-flex rounded-full bg-gold px-5 py-3 text-sm font-bold text-deep"
              >
                Browse the map →
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="space-y-2 text-sm font-medium text-deep">
                  <span>City</span>
                  <select value={city} onChange={(event) => setCity(event.target.value)} className="h-12 w-full rounded-2xl border border-line bg-white px-4 text-sm text-deep">
                    {HOST_CITIES.map((hostCity) => (
                      <option key={hostCity.key} value={hostCity.key}>
                        {hostCity.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2 text-sm font-medium text-deep">
                  <span>Party size</span>
                  <input type="number" min={1} max={200} value={partySize} onChange={(event) => setPartySize(Number(event.target.value) || 1)} className="h-12 w-full rounded-2xl border border-line px-4 text-sm text-deep" />
                </label>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="space-y-2 text-sm font-medium text-deep">
                  <span>Vibe</span>
                  <select value={vibe} onChange={(event) => setVibe(event.target.value)} className="h-12 w-full rounded-2xl border border-line bg-white px-4 text-sm text-deep">
                    {["Lively/loud", "Quiet & cozy", "Family friendly", "Rowdy fan section", "Mixed"].map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2 text-sm font-medium text-deep">
                  <span>Country atmosphere</span>
                  <input value={countryAtmosphere} onChange={(event) => setCountryAtmosphere(event.target.value)} placeholder="Which country's fans are you watching with?" className="h-12 w-full rounded-2xl border border-line px-4 text-sm text-deep" />
                </label>
              </div>

              <label className="block space-y-2 text-sm font-medium text-deep">
                <span>Special requests</span>
                <textarea value={specialRequests} onChange={(event) => setSpecialRequests(event.target.value.slice(0, 200))} className="min-h-[120px] w-full rounded-2xl border border-line px-4 py-3 text-sm text-deep" placeholder="Accessibility, must-have food, neighborhood preference…" />
              </label>

              <label className="block space-y-2 text-sm font-medium text-deep">
                <span>Your email</span>
                <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="h-12 w-full rounded-2xl border border-line px-4 text-sm text-deep" placeholder="you@example.com" />
              </label>

              <button type="submit" className="inline-flex rounded-full bg-gold px-6 py-3 text-sm font-bold text-deep">
                Send Concierge Request
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
