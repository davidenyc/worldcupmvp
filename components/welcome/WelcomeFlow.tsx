// Six-step onboarding shell for /welcome with progress dots and a sticky footer navigator.
"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { demoCountries } from "@/lib/data/demo";
import { HOST_CITIES, getHostCity } from "@/lib/data/hostCities";
import { useUserCity } from "@/lib/hooks/useUserCity";
import { useOnboardingActions, useUser } from "@/lib/store/user";
import { TIER_META, useMembership } from "@/lib/store/membership";
import { toast } from "@/lib/toast";

const STEPS = [
  {
    eyebrow: "Step 1 of 6",
    title: "Tell us your name and home city.",
    body: "We’ll use this to personalize your Cup across the map, promos, and saved venues."
  },
  {
    eyebrow: "Step 2 of 6",
    title: "Pick the country you’re backing most.",
    body: "This becomes the headline nation we rank bars and promos around."
  },
  {
    eyebrow: "Step 3 of 6",
    title: "Follow any other nations you care about.",
    body: "You can always skip and add more later."
  },
  {
    eyebrow: "Step 4 of 6",
    title: "Set your default match-day filters.",
    body: "These become your map defaults when you jump into a city."
  },
  {
    eyebrow: "Step 5 of 6",
    title: "Choose your plan for the demo.",
    body: "Fan Pass and Elite unlock perks instantly here, with no payment flow yet."
  },
  {
    eyebrow: "Step 6 of 6",
    title: "Decide how you want promos and alerts.",
    body: "These are preference flags only for now, so you can change them anytime."
  }
] as const;

export function WelcomeFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useUser();
  const { tier, setTier } = useMembership();
  const { setFirstName, setHomeCity, setFavoriteCountry, setFollowing, setDefaultFilters, markWelcomeSeen } = useOnboardingActions();
  const { suggestedCity, setUserCity } = useUserCity();
  const [stepIndex, setStepIndex] = useState(0);
  const [firstNameDraft, setFirstNameDraft] = useState(user.firstName ?? "");
  const [homeCityDraft, setHomeCityDraft] = useState(
    user.homeCity
      ? (getHostCity(user.homeCity)?.label ?? user.homeCity)
      : suggestedCity
        ? (getHostCity(suggestedCity)?.label ?? suggestedCity)
        : ""
  );
  const [favoriteCountryDraft, setFavoriteCountryDraft] = useState(user.favoriteCountrySlug ?? "");
  const [countrySearchDraft, setCountrySearchDraft] = useState("");
  const [followingDraft, setFollowingDraft] = useState(user.followingCountrySlugs);
  const [defaultFiltersDraft, setDefaultFiltersDraft] = useState(user.defaultFilters);
  const step = STEPS[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === STEPS.length - 1;
  const followCap = tier === "free" ? 2 : 48;
  const citySuggestions = useMemo(() => {
    const query = homeCityDraft.trim().toLowerCase();
    if (!query) return HOST_CITIES.slice(0, 6);
    return HOST_CITIES.filter(
      (city) =>
        city.label.toLowerCase().includes(query) ||
        city.shortLabel.toLowerCase().includes(query) ||
        city.key.toLowerCase().includes(query)
    ).slice(0, 6);
  }, [homeCityDraft]);
  const countrySuggestions = useMemo(() => {
    const query = countrySearchDraft.trim().toLowerCase();
    return demoCountries.filter((country) => {
      if (!query) return true;
      return (
        country.name.toLowerCase().includes(query) ||
        country.slug.toLowerCase().includes(query) ||
        country.fifaCode.toLowerCase().includes(query)
      );
    });
  }, [countrySearchDraft]);

  function resolveHomeCity(value: string) {
    return getHostCity(value)?.key ?? getHostCity(value.toLowerCase().replace(/\s+/g, "-"))?.key ?? null;
  }

  function commitStepOne(skip = false) {
    const resolvedCity = resolveHomeCity(homeCityDraft) ?? suggestedCity ?? user.favoriteCity ?? "nyc";
    const firstName = skip ? (firstNameDraft.trim() || "Fan") : firstNameDraft.trim();
    setFirstName(firstName || "Fan");
    setHomeCity(resolvedCity);
    setUserCity(resolvedCity);
  }

  function handleBack() {
    setStepIndex((current) => Math.max(0, current - 1));
  }

  function handleSkip() {
    if (stepIndex === 0) {
      commitStepOne(true);
    }
    if (stepIndex === 1) return;
    if (searchParams.get("skip") === "1" && isLast) {
      markWelcomeSeen();
      router.push("/me");
      return;
    }
    setStepIndex((current) => Math.min(STEPS.length - 1, current + 1));
  }

  function handleContinue() {
    if (stepIndex === 0) {
      commitStepOne(false);
    }
    if (stepIndex === 1) {
      if (!favoriteCountryDraft) return;
      setFavoriteCountry(favoriteCountryDraft);
      setFollowingDraft((current) =>
        current.includes(favoriteCountryDraft) ? current : [favoriteCountryDraft, ...current]
      );
    }
    if (stepIndex === 2) {
      setFollowing(followingDraft);
    }
    if (stepIndex === 3) {
      setDefaultFilters(defaultFiltersDraft);
    }
    if (stepIndex === 4 && tier !== "free") {
      toast.success("Payment coming soon — your perks are unlocked for the demo.");
    }
    if (isLast) {
      markWelcomeSeen();
      router.push("/me");
      return;
    }
    setStepIndex((current) => Math.min(STEPS.length - 1, current + 1));
  }

  function toggleFollowingCountry(countrySlug: string) {
    setFollowingDraft((current) => {
      if (current.includes(countrySlug)) {
        return current.filter((entry) => entry !== countrySlug);
      }
      if (tier === "free" && current.length >= followCap) {
        return current;
      }
      return [...current, countrySlug];
    });
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-[35rem] flex-col px-4 pb-28 pt-8 sm:px-6">
      <div className="flex items-center justify-center gap-2">
        {STEPS.map((_, index) => (
          <span
            key={index}
            className={`h-2.5 w-2.5 rounded-full transition ${index <= stepIndex ? "bg-gold" : "bg-[color:var(--border-subtle)]"}`}
          />
        ))}
      </div>

      <section className="mt-8 rounded-[2rem] border border-line bg-[radial-gradient(circle_at_top_left,rgba(244,185,66,0.16),transparent_36%),linear-gradient(145deg,var(--bg-surface),var(--bg-surface-elevated))] p-6 sm:p-8">
        <div className="text-[10px] uppercase tracking-[0.18em] text-mist">{step.eyebrow}</div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-deep sm:text-4xl">{step.title}</h1>
        <p className="mt-3 text-sm leading-7 text-mist sm:text-base">{step.body}</p>

        <div className="mt-8">
          {stepIndex === 0 ? (
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-semibold text-deep">First name</span>
                <input
                  value={firstNameDraft}
                  onChange={(event) => setFirstNameDraft(event.target.value.slice(0, 40))}
                  placeholder="Fan"
                  className="mt-2 h-12 w-full rounded-2xl border border-line bg-surface px-4 text-sm text-deep outline-none placeholder:text-mist"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-deep">Home city</span>
                <input
                  value={homeCityDraft}
                  onChange={(event) => setHomeCityDraft(event.target.value)}
                  placeholder="New York"
                  className="mt-2 h-12 w-full rounded-2xl border border-line bg-surface px-4 text-sm text-deep outline-none placeholder:text-mist"
                />
              </label>
              <div className="flex flex-wrap gap-2">
                {citySuggestions.map((city) => (
                  <button
                    key={city.key}
                    type="button"
                    onClick={() => setHomeCityDraft(city.label)}
                    className="inline-flex min-h-11 items-center rounded-full border border-line bg-surface px-4 text-sm font-semibold text-deep"
                  >
                    {city.label}
                  </button>
                ))}
              </div>
            </div>
          ) : stepIndex === 1 ? (
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-semibold text-deep">Search countries</span>
                <input
                  value={countrySearchDraft}
                  onChange={(event) => setCountrySearchDraft(event.target.value)}
                  placeholder="Mexico, USA, Brazil…"
                  className="mt-2 h-12 w-full rounded-2xl border border-line bg-surface px-4 text-sm text-deep outline-none placeholder:text-mist"
                />
              </label>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {countrySuggestions.map((country) => {
                  const selected = favoriteCountryDraft === country.slug;
                  return (
                    <button
                      key={country.slug}
                      type="button"
                      onClick={() => setFavoriteCountryDraft(country.slug)}
                      className={`flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl border px-2 text-center text-xs font-semibold transition ${
                        selected
                          ? "border-gold bg-gold/10 text-deep ring-2 ring-gold/30"
                          : "border-line bg-surface text-deep"
                      }`}
                    >
                      <span className="text-3xl leading-none">{country.flagEmoji}</span>
                      <span>{country.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : stepIndex === 2 ? (
            <div className="space-y-4">
              {tier === "free" && followingDraft.length >= followCap ? (
                <div className="rounded-2xl border border-gold/50 bg-gold/10 p-4 text-sm text-deep">
                  <div className="font-semibold">Following more than 2 nations is a Fan Pass perk.</div>
                  <div className="mt-1 text-mist">$4.99/mo in the full product. For now, you can skip and keep moving.</div>
                </div>
              ) : null}
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {countrySuggestions.map((country) => {
                  const selected = followingDraft.includes(country.slug) || favoriteCountryDraft === country.slug;
                  const locked = tier === "free" && !selected && followingDraft.length >= followCap;
                  return (
                    <button
                      key={country.slug}
                      type="button"
                      onClick={() => toggleFollowingCountry(country.slug)}
                      disabled={country.slug === favoriteCountryDraft || locked}
                      className={`flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl border px-2 text-center text-xs font-semibold transition ${
                        selected
                          ? "border-gold bg-gold/10 text-deep ring-2 ring-gold/30"
                          : "border-line bg-surface text-deep"
                      } ${locked ? "opacity-50" : ""}`}
                    >
                      <span className="text-3xl leading-none">{country.flagEmoji}</span>
                      <span>{country.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : stepIndex === 3 ? (
            <div className="space-y-3">
              {[
                ["soundOn", "I want sound on for matches"],
                ["reservationsPossible", "I want reservations possible"],
                ["outdoorSeating", "I want outdoor seating"]
              ].map(([key, label]) => {
                const typedKey = key as keyof typeof defaultFiltersDraft;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() =>
                      setDefaultFiltersDraft((current) => ({
                        ...current,
                        [typedKey]: !current[typedKey]
                      }))
                    }
                    className={`flex min-h-14 w-full items-center justify-between rounded-2xl border px-4 text-left text-sm font-semibold transition ${
                      defaultFiltersDraft[typedKey]
                        ? "border-gold bg-gold/10 text-deep"
                        : "border-line bg-surface text-deep"
                    }`}
                  >
                    <span>{label}</span>
                    <span className="text-xs text-mist">{defaultFiltersDraft[typedKey] ? "On" : "Off"}</span>
                  </button>
                );
              })}
            </div>
          ) : stepIndex === 4 ? (
            <div className="grid gap-3">
              {(["free", "fan", "elite"] as const).map((plan) => {
                const active = tier === plan;
                return (
                  <button
                    key={plan}
                    type="button"
                    onClick={() => setTier(plan)}
                    className={`rounded-[1.5rem] border p-5 text-left transition ${
                      active ? "border-gold bg-gold/10 ring-2 ring-gold/20" : "border-line bg-surface"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="text-lg font-semibold text-deep">{TIER_META[plan].label}</div>
                        <div className="mt-1 text-sm text-mist">
                          {plan === "free" ? "Continue free" : `${TIER_META[plan].price}/mo · demo unlock`}
                        </div>
                      </div>
                      <span className="inline-flex min-h-10 items-center rounded-full border border-line bg-surface-2 px-4 text-sm font-semibold text-deep">
                        {active ? "Selected" : plan === "free" ? "Continue free" : plan === "fan" ? "Start Fan Pass" : "Go Elite"}
                      </span>
                    </div>
                    <ul className="mt-4 space-y-2 text-sm text-mist">
                      {TIER_META[plan].features.slice(0, 4).map((feature) => (
                        <li key={feature}>{feature}</li>
                      ))}
                    </ul>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-line bg-surface px-5 py-10 text-center text-sm text-mist">
              Step content lands here in the next commits.
            </div>
          )}
        </div>
      </section>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 border-t border-line bg-[var(--bg-page)]/95 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur">
        <div className="pointer-events-auto mx-auto flex w-full max-w-[35rem] items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleBack}
            disabled={isFirst}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-line bg-surface px-4 text-sm font-semibold text-deep disabled:cursor-not-allowed disabled:opacity-40"
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleSkip}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-line bg-surface px-4 text-sm font-semibold text-deep"
          >
            Skip
          </button>
          <button
            type="button"
            onClick={handleContinue}
            disabled={stepIndex === 1 && !favoriteCountryDraft}
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full bg-gold px-5 text-sm font-semibold text-deep disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLast ? "Finish →" : "Continue →"}
          </button>
        </div>
      </div>
    </div>
  );
}
