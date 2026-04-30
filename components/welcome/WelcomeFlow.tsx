"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { demoCountries } from "@/lib/data/demo";
import { HOST_CITIES, getHostCity } from "@/lib/data/hostCities";
import { useSession } from "@/lib/hooks/useSession";
import { useUserCity } from "@/lib/hooks/useUserCity";
import { TIER_META, type MembershipTier, useMembership } from "@/lib/store/membership";
import { useOnboardingActions, useUpdateUser, useUser } from "@/lib/store/user";
import { toast } from "@/lib/toast";

type StepId =
  | "identity"
  | "email"
  | "country"
  | "follow"
  | "filters"
  | "groups"
  | "plan"
  | "promos";

const BASE_STEPS: Array<{
  id: StepId;
  required: boolean;
  eyebrow: string;
  title: string;
  body: string;
}> = [
  {
    id: "identity",
    required: false,
    eyebrow: "Your fan ID",
    title: "Who's watching?",
    body: "First name and home city personalize matches, promos, and saved spots."
  },
  {
    id: "email",
    required: false,
    eyebrow: "Email",
    title: "Where should alerts go?",
    body: "Optional. Skip it and add an email later in Account."
  },
  {
    id: "country",
    required: true,
    eyebrow: "Your team",
    title: "Pick your nation.",
    body: "Used to surface your matches, crowd, and country-specific promos."
  },
  {
    id: "follow",
    required: false,
    eyebrow: "Following",
    title: "Any other nations?",
    body: "Pick up to 2 on Free. Fan Pass unlocks all 48."
  },
  {
    id: "filters",
    required: false,
    eyebrow: "Your defaults",
    title: "How do you watch?",
    body: "These pre-fill the venue map every time you open it."
  },
  {
    id: "groups",
    required: false,
    eyebrow: "Groups",
    title: "Bringing friends along?",
    body: "Save your spot now and we’ll loop you in first when groups launch."
  },
  {
    id: "plan",
    required: false,
    eyebrow: "Plan",
    title: "Pick your plan.",
    body: "Free works for one country. Fan Pass unlocks every nation."
  },
  {
    id: "promos",
    required: false,
    eyebrow: "Notifications",
    title: "How should we reach you?",
    body: "Promos and kickoff alerts. Email plus push. All optional."
  }
];

const PLAN_CARD_COPY: Record<
  MembershipTier,
  { cta: string; price: string; kicker?: string; helper: string[] }
> = {
  free: {
    cta: "Continue free",
    price: "$0/mo",
    helper: [
      "Browse all 17 host cities",
      "Save 5 venues",
      "Follow 2 nations",
      "Basic promos"
    ]
  },
  fan: {
    cta: "Try Fan Pass →",
    price: "$4.99/mo",
    kicker: "Most popular",
    helper: [
      "Everything in Free",
      "Unlimited saves and follows",
      "Reservation requests",
      "Priority watch-party invites"
    ]
  },
  elite: {
    cta: "Go Elite →",
    price: "$12.99/mo",
    helper: [
      "Everything in Fan Pass",
      "Venue Concierge",
      "Early access drops",
      "Export saved list"
    ]
  }
};

function validateEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function formatCountrySummary(slugs: string[]) {
  const unique = Array.from(new Set(slugs));
  const names = unique
    .map((slug) => demoCountries.find((country) => country.slug === slug))
    .filter((country): country is (typeof demoCountries)[number] => Boolean(country))
    .map((country) => `${country.flagEmoji} ${country.name}`);

  if (!names.length) return null;
  if (names.length <= 3) return names.join(", ");
  return `${names.slice(0, 3).join(", ")} …and ${names.length - 3} more`;
}

export function WelcomeFlow() {
  const router = useRouter();
  const { user: authUser, loading: authLoading } = useSession();
  const user = useUser();
  const updateUser = useUpdateUser();
  const { tier, setTier } = useMembership();
  const {
    setFirstName,
    setEmail,
    setHomeCity,
    setFavoriteCountry,
    setFollowing,
    setDefaultFilters,
    setPromoOptIns,
    setWantsGroups,
    setExtraPromoOpts,
    setNotificationPermission,
    markWelcomeSeen
  } = useOnboardingActions();
  const { suggestedCity, setUserCity } = useUserCity();

  const [stepIndex, setStepIndex] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [requestingPermission, setRequestingPermission] = useState(false);
  const [firstNameDraft, setFirstNameDraft] = useState(user.firstName ?? "");
  const [homeCityDraft, setHomeCityDraft] = useState(
    user.homeCity
      ? (getHostCity(user.homeCity)?.label ?? user.homeCity)
      : suggestedCity
        ? (getHostCity(suggestedCity)?.label ?? suggestedCity)
        : ""
  );
  const [emailDraft, setEmailDraft] = useState(user.email ?? authUser?.email ?? "");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [favoriteCountryDraft, setFavoriteCountryDraft] = useState(user.favoriteCountrySlug ?? "");
  const [countrySearchDraft, setCountrySearchDraft] = useState("");
  const [followingDraft, setFollowingDraft] = useState(
    user.followingCountrySlugs.length
      ? user.followingCountrySlugs
      : user.favoriteCountrySlug
        ? [user.favoriteCountrySlug]
        : []
  );
  const [defaultFiltersDraft, setDefaultFiltersDraft] = useState(user.defaultFilters);
  const [wantsGroupsDraft, setWantsGroupsDraft] = useState(user.wantsGroups);
  const [promoOptInsDraft, setPromoOptInsDraft] = useState(user.promoOptIns);
  const [notifyMatchAlertsDraft, setNotifyMatchAlertsDraft] = useState(
    user.notifyMatchAlerts || user.promoOptIns.push
  );
  const [notifyNewVenuesDraft, setNotifyNewVenuesDraft] = useState(
    user.notifyNewVenues || user.savedVenuePromoAlerts
  );
  const [notificationPermissionDraft, setNotificationPermissionDraft] = useState<
    NotificationPermission | "unsupported"
  >(user.notificationPermission);

  useEffect(() => {
    document.body.dataset.route = "welcome";
    return () => {
      delete document.body.dataset.route;
    };
  }, []);

  useEffect(() => {
    if (authUser?.email && !user.email) {
      setEmailDraft(authUser.email);
    }
  }, [authUser?.email, user.email]);

  const steps = useMemo(
    () => BASE_STEPS.filter((step) => !(step.id === "email" && authUser)),
    [authUser]
  );

  useEffect(() => {
    if (stepIndex > steps.length - 1) {
      setStepIndex(Math.max(0, steps.length - 1));
    }
  }, [stepIndex, steps.length]);

  const step = steps[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === steps.length - 1;
  const isStepRequired = step?.required ?? false;
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

  const canContinue = useMemo(() => {
    if (!step) return false;

    switch (step.id) {
      case "country":
        return Boolean(favoriteCountryDraft);
      case "email":
        if (authUser) return true;
        return emailDraft.trim().length === 0 || validateEmail(emailDraft);
      default:
        return true;
    }
  }, [authUser, emailDraft, favoriteCountryDraft, step]);

  const celebrationLines = useMemo(() => {
    const lines: string[] = [];
    const favoriteCountry = favoriteCountryDraft
      ? demoCountries.find((country) => country.slug === favoriteCountryDraft)
      : null;
    const cityLabel = resolveHomeCity(homeCityDraft)
      ? (getHostCity(resolveHomeCity(homeCityDraft)!)?.shortLabel ?? homeCityDraft)
      : (getHostCity(suggestedCity ?? "nyc")?.shortLabel ?? "NYC");
    const followingSummary = formatCountrySummary(
      followingDraft.filter((slug) => slug !== favoriteCountryDraft)
    );

    if (favoriteCountry) {
      lines.push(`You're backing ${favoriteCountry.flagEmoji} ${favoriteCountry.name} in ${cityLabel}.`);
    }
    if (followingSummary) {
      lines.push(`Following ${followingSummary}.`);
    }
    if (tier !== "free") {
      lines.push(`${TIER_META[tier].label} perks unlocked.`);
    }
    if (wantsGroupsDraft) {
      lines.push("Group invites coming first to your inbox.");
    }

    return lines.slice(0, 4);
  }, [favoriteCountryDraft, followingDraft, homeCityDraft, suggestedCity, tier, wantsGroupsDraft]);

  function resolveHomeCity(value: string) {
    return getHostCity(value)?.key ?? getHostCity(value.toLowerCase().replace(/\s+/g, "-"))?.key ?? null;
  }

  function commitIdentityStep(skip = false) {
    const resolvedCity = resolveHomeCity(homeCityDraft) ?? suggestedCity ?? user.favoriteCity ?? "nyc";
    const firstName = skip ? (firstNameDraft.trim() || "Fan") : firstNameDraft.trim();
    setFirstName(firstName || "Fan");
    setHomeCity(resolvedCity);
    setUserCity(resolvedCity);
  }

  function handleBack() {
    if (showCelebration) {
      setShowCelebration(false);
      setStepIndex(Math.max(0, steps.length - 1));
      return;
    }
    setStepIndex((current) => Math.max(0, current - 1));
  }

  function handleExit() {
    if (window.confirm("Skip personalization for now? You can resume from your profile.")) {
      markWelcomeSeen();
      router.push("/app");
    }
  }

  function handleSkip() {
    if (!step || isStepRequired) return;

    if (step.id === "identity") {
      commitIdentityStep(true);
    }

    if (step.id === "email") {
      setEmail("");
      setEmailDraft("");
      setEmailError(null);
    }

    if (step.id === "groups") {
      setWantsGroupsDraft(false);
    }

    if (isLast) {
      setShowCelebration(true);
      return;
    }

    setStepIndex((current) => Math.min(steps.length - 1, current + 1));
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

  async function handleNotificationPermission() {
    try {
      if (typeof Notification === "undefined" || typeof Notification.requestPermission !== "function") {
        setNotificationPermissionDraft("unsupported");
        setNotificationPermission("unsupported");
        return;
      }

      setRequestingPermission(true);
      const permission = await Notification.requestPermission();
      setNotificationPermissionDraft(permission);
      setNotificationPermission(permission);

      if (permission === "granted") {
        setNotifyMatchAlertsDraft(true);
        setPromoOptInsDraft((current) => ({ ...current, push: true }));
      }
    } catch {
      setNotificationPermissionDraft("unsupported");
      setNotificationPermission("unsupported");
    } finally {
      setRequestingPermission(false);
    }
  }

  function handleContinue() {
    if (!step || !canContinue) return;

    switch (step.id) {
      case "identity":
        commitIdentityStep(false);
        break;
      case "email": {
        const trimmedEmail = emailDraft.trim();
        if (trimmedEmail && !validateEmail(trimmedEmail)) {
          setEmailError("Enter a valid email or leave it blank for now.");
          return;
        }
        setEmail(trimmedEmail);
        setEmailError(null);
        break;
      }
      case "country":
        setFavoriteCountry(favoriteCountryDraft);
        setFollowingDraft((current) =>
          current.includes(favoriteCountryDraft) ? current : [favoriteCountryDraft, ...current]
        );
        break;
      case "follow":
        setFollowing(Array.from(new Set([favoriteCountryDraft, ...followingDraft].filter(Boolean))));
        break;
      case "filters":
        setDefaultFilters(defaultFiltersDraft);
        break;
      case "groups":
        setWantsGroups(wantsGroupsDraft);
        break;
      case "plan":
        if (tier !== "free") {
          toast.success("Saved your pick. Billing can come later — nothing is charged yet.");
        }
        break;
      case "promos":
        setExtraPromoOpts({
          proximityPromos: promoOptInsDraft.proximityPromos,
          groupPromos: promoOptInsDraft.groupPromos,
          savedVenuePromoAlerts: notifyNewVenuesDraft
        });
        setPromoOptIns({
          email: promoOptInsDraft.email,
          push: notifyMatchAlertsDraft,
          proximityPromos: promoOptInsDraft.proximityPromos,
          groupPromos: promoOptInsDraft.groupPromos,
          savedVenuePromoAlerts: notifyNewVenuesDraft,
          wantsGroups: wantsGroupsDraft,
          notificationPermission: notificationPermissionDraft
        });
        updateUser({
          notifyMatchAlerts: notifyMatchAlertsDraft,
          notifyNewVenues: notifyNewVenuesDraft,
          emailSubscribed: promoOptInsDraft.email
        });
        setShowCelebration(true);
        return;
      default:
        break;
    }

    if (isLast) {
      setShowCelebration(true);
      return;
    }

    setStepIndex((current) => Math.min(steps.length - 1, current + 1));
  }

  function handleOpenCup() {
    markWelcomeSeen();
    const target =
      !authUser
        ? (() => {
            const params = new URLSearchParams({ next: "/me" });
            if (validateEmail(emailDraft)) {
              params.set("email", emailDraft.trim());
              params.set("send", "1");
              params.set("create", "1");
            }
            return `/auth/sign-in?${params.toString()}`;
          })()
        : "/me";

    // Use a hard navigation here because the final onboarding CTA was flaky
    // in some browser contexts when relying on a client-side router transition.
    window.location.assign(target);
  }

  function renderToggleRow(
    label: string,
    enabled: boolean,
    onToggle: () => void,
    detail?: string
  ) {
    return (
      <button
        type="button"
        onClick={onToggle}
        className={`flex min-h-14 w-full items-center justify-between rounded-2xl border px-4 text-left text-sm font-semibold transition ${
          enabled ? "border-gold bg-gold/10 text-deep" : "border-line bg-surface text-deep"
        }`}
      >
        <span className="pr-4">
          <span>{label}</span>
          {detail ? <span className="mt-1 block text-xs font-medium text-mist">{detail}</span> : null}
        </span>
        <span className="shrink-0 text-xs text-mist">{enabled ? "On" : "Off"}</span>
      </button>
    );
  }

  return (
    <div className="mx-auto flex min-h-[100dvh] w-full max-w-[34rem] flex-col items-center px-4 pt-4 sm:px-6 sm:pt-6">
      <div className="flex w-full justify-end sm:items-center sm:justify-between">
        <div className="hidden sm:flex flex-col items-start gap-2">
          <div className="flex items-center justify-center gap-2">
            {steps.map((_, index) => (
              <span
                key={index}
                className={`h-3 w-3 rounded-full transition sm:h-3.5 sm:w-3.5 ${
                  index < stepIndex
                    ? "bg-gold"
                    : index === stepIndex
                      ? "bg-gold ring-2 ring-gold/30"
                      : "bg-[color:var(--border-subtle)]"
                }`}
              />
            ))}
          </div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-mist">
            Step {Math.min(stepIndex + 1, steps.length)} of {steps.length}
          </div>
        </div>
        <button
          type="button"
          onClick={handleExit}
          className="text-xs font-medium text-mist transition hover:text-deep"
        >
          Exit ✕
        </button>
      </div>

      <div className="mt-1 hidden flex-col items-center gap-2 sm:hidden">
        <div className="flex items-center justify-center gap-2">
          {steps.map((_, index) => (
            <span
              key={index}
              className={`h-3 w-3 rounded-full transition sm:h-3.5 sm:w-3.5 ${
                index < stepIndex
                  ? "bg-gold"
                  : index === stepIndex
                    ? "bg-gold ring-2 ring-gold/30"
                    : "bg-[color:var(--border-subtle)]"
              }`}
            />
          ))}
        </div>
        <div className="text-[10px] uppercase tracking-[0.2em] text-mist">
          Step {Math.min(stepIndex + 1, steps.length)} of {steps.length}
        </div>
      </div>

      <section className="mt-4 w-full rounded-[1.5rem] border border-line bg-[radial-gradient(circle_at_top_left,rgba(244,185,66,0.16),transparent_36%),linear-gradient(145deg,var(--bg-surface),var(--bg-surface-elevated))] p-5 pb-[5.25rem] shadow-[0_18px_40px_rgba(15,23,42,0.08)] sm:mt-6 sm:rounded-[2rem] sm:p-7 sm:pb-[5.5rem] dark:shadow-[0_18px_40px_rgba(0,0,0,0.28)]">
        {showCelebration ? (
          <div className="space-y-5 text-center">
            <div className="text-5xl leading-none">🎉</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-mist">Welcome</div>
            <h1 className="text-3xl font-semibold tracking-tight text-deep sm:text-4xl">
              Welcome to GameDay Map{firstNameDraft.trim() ? `, ${firstNameDraft.trim()}` : ""}.
            </h1>
            <div className="space-y-2 text-sm leading-7 text-mist">
              {celebrationLines.length ? celebrationLines.map((line) => <p key={line}>{line}</p>) : (
                <p>Your Cup is ready. We’ll keep your matches, promos, and saved spots in sync.</p>
              )}
              {!authUser ? (
                <p className="text-[color:var(--fg-secondary)]">
                  One quick sign-in keeps this Cup synced across devices.
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={handleOpenCup}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-gold px-5 text-sm font-semibold text-[color:var(--fg-on-accent)]"
            >
              Open my Cup →
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCelebration(false);
                setStepIndex(0);
              }}
              className="text-sm font-semibold text-mist transition hover:text-deep"
            >
              ← Edit choices
            </button>
          </div>
        ) : (
          <>
            <div className="text-[10px] uppercase tracking-[0.16em] text-mist">{step.eyebrow}</div>
            <h1 className="mt-1.5 text-[2.2rem] font-semibold leading-[0.98] tracking-tight text-deep sm:mt-2 sm:text-[3.35rem]">
              {step.title}
            </h1>
            <p className="mt-2 text-sm leading-6 text-mist sm:mt-3 sm:max-w-[32rem] sm:text-lg sm:leading-8">{step.body}</p>

            <div className="mt-4 sm:mt-8">
              {step.id === "identity" ? (
                <div className="space-y-2.5">
                  <label className="block">
                    <span className="text-[13px] font-semibold text-deep sm:text-sm">First name</span>
                    <input
                      value={firstNameDraft}
                      onChange={(event) => setFirstNameDraft(event.target.value.slice(0, 40))}
                      placeholder="Fan"
                      className="mt-2 h-11 w-full rounded-2xl border border-line bg-surface px-4 text-sm text-deep outline-none transition placeholder:text-mist focus:border-gold focus:ring-2 focus:ring-gold/20 sm:h-12"
                    />
                  </label>
                  <label className="block">
                    <span className="text-[13px] font-semibold text-deep sm:text-sm">Home city</span>
                    <input
                      value={homeCityDraft}
                      onChange={(event) => setHomeCityDraft(event.target.value)}
                      placeholder="New York"
                      className="mt-2 h-11 w-full rounded-2xl border border-line bg-surface px-4 text-sm text-deep outline-none transition placeholder:text-mist focus:border-gold focus:ring-2 focus:ring-gold/20 sm:h-12"
                    />
                  </label>
                  <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
                    {citySuggestions.map((city) => (
                      <button
                        key={city.key}
                        type="button"
                        onClick={() => setHomeCityDraft(city.label)}
                        className="inline-flex min-h-10 shrink-0 items-center rounded-full border border-line bg-surface px-3.5 text-[15px] font-semibold text-deep transition hover:bg-surface-2 sm:min-h-11 sm:px-4 sm:text-sm"
                      >
                        {city.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {step.id === "email" ? (
                <div className="space-y-4">
                  <label className="block">
                    <span className="text-sm font-semibold text-deep">Email</span>
                    <input
                      value={emailDraft}
                      onChange={(event) => {
                        setEmailDraft(event.target.value);
                        if (emailError) setEmailError(null);
                      }}
                      placeholder={authLoading ? "Checking sign-in…" : "you@email.com"}
                      autoComplete="email"
                      disabled={authLoading}
                      className="mt-2 h-12 w-full rounded-2xl border border-line bg-surface px-4 text-sm text-deep outline-none transition placeholder:text-mist focus:border-gold focus:ring-2 focus:ring-gold/20 disabled:opacity-70"
                    />
                  </label>
                  <div className="text-xs text-mist">
                    Leave it blank to skip for now, or add one so kickoff alerts have somewhere to go.
                  </div>
                  {emailError ? <div className="text-sm font-medium text-red-500">{emailError}</div> : null}
                  <button
                    type="button"
                    onClick={() => router.push("/auth/sign-in?next=%2Fwelcome")}
                    className="text-sm font-semibold text-deep underline underline-offset-4"
                  >
                    Send me a sign-in code instead and start syncing now
                  </button>
                </div>
              ) : null}

              {step.id === "country" ? (
                <div className="space-y-4">
                  <div className="max-h-[58vh] overflow-y-auto pr-1 sm:max-h-none sm:overflow-visible">
                    <div className="sticky top-0 z-10 -mx-1 rounded-2xl bg-[var(--bg-surface)] px-1 py-2 backdrop-blur">
                      <label className="block">
                        <span className="text-sm font-semibold text-deep">Search countries</span>
                        <input
                          value={countrySearchDraft}
                          onChange={(event) => setCountrySearchDraft(event.target.value)}
                          placeholder="Mexico, USA, Brazil…"
                          className="mt-2 h-12 w-full rounded-2xl border border-line bg-transparent px-4 text-sm text-[color:var(--fg-primary)] outline-none transition placeholder:text-mist focus:border-gold focus:ring-2 focus:ring-gold/20"
                        />
                      </label>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                      {countrySuggestions.map((country) => {
                        const selected = favoriteCountryDraft === country.slug;
                        return (
                          <button
                            key={country.slug}
                            type="button"
                            onClick={() => setFavoriteCountryDraft(country.slug)}
                            className={`flex min-h-16 flex-col items-center justify-center gap-2 rounded-2xl border px-2 py-3 text-center text-xs font-semibold transition sm:min-h-24 ${
                              selected
                                ? "border-gold bg-gold/10 text-deep ring-2 ring-gold/30"
                                : "border-line bg-surface text-deep hover:bg-surface-2"
                            }`}
                          >
                            <span className="text-xl leading-none sm:text-3xl">{country.flagEmoji}</span>
                            <span>{country.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : null}

              {step.id === "follow" ? (
                <div className="space-y-4">
                  {tier === "free" && followingDraft.filter((slug) => slug !== favoriteCountryDraft).length >= followCap ? (
                    <div className="rounded-2xl border border-gold/50 bg-gold/10 p-4 text-sm text-deep">
                      <div className="font-semibold">Following more than 2 nations is a Fan Pass perk.</div>
                      <div className="mt-1 text-mist">You can keep moving now, or unlock all 48 on Fan Pass.</div>
                    </div>
                  ) : null}
                  <div className="max-h-[58vh] overflow-y-auto pr-1 sm:max-h-none sm:overflow-visible">
                    <div className="sticky top-0 z-10 -mx-1 rounded-2xl bg-[var(--bg-surface)] px-1 py-2 backdrop-blur">
                      <label className="block">
                        <span className="text-sm font-semibold text-deep">Search countries</span>
                        <input
                          value={countrySearchDraft}
                          onChange={(event) => setCountrySearchDraft(event.target.value)}
                          placeholder="Add more nations to follow…"
                          className="mt-2 h-12 w-full rounded-2xl border border-line bg-transparent px-4 text-sm text-[color:var(--fg-primary)] outline-none transition placeholder:text-mist focus:border-gold focus:ring-2 focus:ring-gold/20"
                        />
                      </label>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                      {countrySuggestions.map((country) => {
                        const selected = followingDraft.includes(country.slug) || favoriteCountryDraft === country.slug;
                        const locked =
                          tier === "free" &&
                          !selected &&
                          followingDraft.filter((slug) => slug !== favoriteCountryDraft).length >= followCap;
                        return (
                          <button
                            key={country.slug}
                            type="button"
                            onClick={() => toggleFollowingCountry(country.slug)}
                            disabled={country.slug === favoriteCountryDraft || locked}
                            className={`flex min-h-16 flex-col items-center justify-center gap-2 rounded-2xl border px-2 py-3 text-center text-xs font-semibold transition sm:min-h-24 ${
                              selected
                                ? "border-gold bg-gold/10 text-deep ring-2 ring-gold/30"
                                : "border-line bg-surface text-deep hover:bg-surface-2"
                            } ${locked ? "opacity-50" : ""}`}
                          >
                            <span className="text-xl leading-none sm:text-3xl">{country.flagEmoji}</span>
                            <span>{country.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : null}

              {step.id === "filters" ? (
                <div className="space-y-3">
                  {[
                    ["soundOn", "I want sound on for matches"],
                    ["reservationsPossible", "I want reservations possible"],
                    ["outdoorSeating", "I want outdoor seating"]
                  ].map(([key, label]) => {
                    const typedKey = key as keyof typeof defaultFiltersDraft;
                    return renderToggleRow(label, defaultFiltersDraft[typedKey], () =>
                      setDefaultFiltersDraft((current) => ({
                        ...current,
                        [typedKey]: !current[typedKey]
                      }))
                    );
                  })}
                </div>
              ) : null}

              {step.id === "groups" ? (
                <div className="space-y-3">
                  {renderToggleRow(
                    "Yes, save my spot for groups when they launch",
                    wantsGroupsDraft,
                    () => setWantsGroupsDraft((current) => !current),
                    "One-tap invites and supporter crews arrive after MVP."
                  )}
                  {renderToggleRow(
                    "Maybe later",
                    !wantsGroupsDraft,
                    () => setWantsGroupsDraft(false)
                  )}
                </div>
              ) : null}

              {step.id === "plan" ? (
                <div className="grid gap-3">
                  {(["free", "fan", "elite"] as const).map((plan) => {
                    const active = tier === plan;
                    const cardCopy = PLAN_CARD_COPY[plan];
                    return (
                      <button
                        key={plan}
                        type="button"
                        onClick={() => setTier(plan)}
                        className={`rounded-[1.5rem] border p-5 text-left transition ${
                          active ? "border-gold bg-gold/10 ring-2 ring-gold/20" : "border-line bg-surface hover:bg-surface-2"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <div className="text-lg font-semibold text-deep">{TIER_META[plan].label.toUpperCase()}</div>
                              {cardCopy.kicker ? (
                                <span className="inline-flex items-center rounded-full bg-gold px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[color:var(--fg-on-accent)]">
                                  {cardCopy.kicker}
                                </span>
                              ) : null}
                            </div>
                            <div className="mt-1 text-sm text-mist">{cardCopy.price}</div>
                          </div>
                          <span className="inline-flex min-h-10 items-center rounded-full border border-line bg-surface-2 px-4 text-sm font-semibold text-deep">
                            {active ? "Selected" : cardCopy.cta}
                          </span>
                        </div>
                        <ul className="mt-4 space-y-2 text-sm text-mist">
                          {cardCopy.helper.map((feature) => (
                            <li key={feature}>• {feature}</li>
                          ))}
                        </ul>
                      </button>
                    );
                  })}
                  <div className="text-sm text-mist">Pick later in Account → Membership.</div>
                </div>
              ) : null}

              {step.id === "promos" ? (
                <div className="space-y-5">
                  <div className="space-y-3">
                    <div className="text-[10px] uppercase tracking-[0.18em] text-mist">Promos</div>
                    {renderToggleRow(
                      "Email me weekly promos for my country",
                      promoOptInsDraft.email,
                      () => setPromoOptInsDraft((current) => ({ ...current, email: !current.email }))
                    )}
                    {renderToggleRow(
                      "Show me promos when I’m near a venue",
                      promoOptInsDraft.proximityPromos,
                      () =>
                        setPromoOptInsDraft((current) => ({
                          ...current,
                          proximityPromos: !current.proximityPromos
                        }))
                    )}
                    {renderToggleRow(
                      "Group-exclusive promos when groups launch",
                      promoOptInsDraft.groupPromos,
                      () =>
                        setPromoOptInsDraft((current) => ({
                          ...current,
                          groupPromos: !current.groupPromos
                        }))
                    )}
                  </div>
                  <div className="space-y-3">
                    <div className="text-[10px] uppercase tracking-[0.18em] text-mist">Alerts</div>
                    {renderToggleRow(
                      "Push me 30 min before my country plays",
                      notifyMatchAlertsDraft,
                      () => setNotifyMatchAlertsDraft((current) => !current)
                    )}
                    {renderToggleRow(
                      "Push me when a saved venue adds a promo",
                      notifyNewVenuesDraft,
                      () => setNotifyNewVenuesDraft((current) => !current)
                    )}
                    {notificationPermissionDraft === "unsupported" ? (
                      <div className="rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-mist">
                        Push notifications are unavailable in this browser right now. We’ll keep your preference saved.
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          void handleNotificationPermission();
                        }}
                        disabled={requestingPermission || notificationPermissionDraft === "granted"}
                        className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-line bg-surface px-5 text-sm font-semibold text-deep transition hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {notificationPermissionDraft === "granted"
                          ? "Push notifications enabled"
                          : requestingPermission
                            ? "Checking permission…"
                            : "Allow push notifications now"}
                      </button>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </>
        )}
      </section>

      {showCelebration ? null : (
        <div className="mt-2 flex flex-col items-center gap-2 sm:hidden">
          <div className="flex items-center justify-center gap-2">
            {steps.map((_, index) => (
              <span
                key={index}
                className={`h-3 w-3 rounded-full transition ${
                  index < stepIndex
                    ? "bg-gold"
                    : index === stepIndex
                      ? "bg-gold ring-2 ring-gold/30"
                      : "bg-[color:var(--border-subtle)]"
                }`}
              />
            ))}
          </div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-mist">
            Step {Math.min(stepIndex + 1, steps.length)} of {steps.length}
          </div>
        </div>
      )}

      {showCelebration ? null : (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 border-t border-line bg-[var(--bg-page)]/95 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur sm:pointer-events-auto sm:static sm:mt-5 sm:w-full sm:border-t-0 sm:bg-transparent sm:px-0 sm:pb-0 sm:pt-0 sm:backdrop-blur-0">
          <div className="pointer-events-auto mx-auto flex w-full max-w-[34rem] items-center gap-2">
            <button
              type="button"
              onClick={handleBack}
              disabled={isFirst}
              className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-full border border-line bg-surface text-sm font-semibold text-deep transition hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-30"
            >
              ←
            </button>
            {!isStepRequired ? (
              <button
                type="button"
                onClick={handleSkip}
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-line bg-surface px-4 text-sm font-semibold text-deep transition hover:bg-surface-2"
              >
                Skip
              </button>
            ) : null}
            <button
              type="button"
              onClick={handleContinue}
              disabled={!canContinue}
              className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full bg-gold px-5 text-sm font-semibold text-[color:var(--fg-on-accent)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLast ? "Open my Cup →" : "Continue →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
