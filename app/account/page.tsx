"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { TierBadge } from "@/components/membership/TierBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { HOST_CITIES } from "@/lib/data/hostCities";
import { demoCountries } from "@/lib/data/demo";
import { useUserCity } from "@/lib/hooks/useUserCity";
import { useFavoritesStore } from "@/lib/store/favorites";
import { useGroups } from "@/lib/store/groups";
import { TIER_META, useMembership } from "@/lib/store/membership";
import { useReviews } from "@/lib/store/reviews";
import { useTheme } from "@/lib/store/theme";
import { useOnboardingActions, useResetUser, useUpdateUser, useUser } from "@/lib/store/user";
import { toast } from "@/lib/toast";

const AVATAR_EMOJIS = ["⚽", "🏆", "🥇", "🎯", "🍺", "🎉", "🔥", "❤️", "🦁", "🦅", "🌟", "👑", "🎪", "🏟️", "🌍", "🌎", "🌏", "🎸", "🥁", "🎺"] as const;
const LANGUAGES = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇲🇽" },
  { code: "pt", label: "Português", flag: "🇧🇷" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "ar", label: "العربية", flag: "🇲🇦" },
  { code: "nl", label: "Nederlands", flag: "🇳🇱" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
  { code: "ko", label: "한국어", flag: "🇰🇷" },
  { code: "zh-CN", label: "中文", flag: "🇨🇳" },
  { code: "pl", label: "Polski", flag: "🇵🇱" },
  { code: "hr", label: "Hrvatski", flag: "🇭🇷" }
] as const;

function getInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);
  if (!parts.length) return "GM";
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "GM";
}

function SectionCard({
  title,
  children,
  dark = false
}: {
  title: string;
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <section
      className={`rounded-[1.75rem] p-5 shadow-sm ring-1 ${
        dark
          ? "bg-[var(--bg-surface-strong)] text-[color:var(--fg-on-strong)] ring-[color:var(--border-strong)]"
          : "bg-[var(--bg-surface)] text-[color:var(--fg-primary)] ring-[color:var(--border-subtle)]"
      }`}
    >
      <h2 className={`text-xl font-semibold ${dark ? "text-[color:var(--fg-on-strong)]" : "text-deep"}`}>{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Toggle({
  checked,
  onClick,
  disabled = false
}: {
  checked: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={onClick}
      className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${
        disabled
          ? "cursor-not-allowed bg-[color:var(--border-subtle)] opacity-60"
          : checked
            ? "bg-gold"
            : "bg-[color:var(--border-subtle)]"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 rounded-full bg-white shadow transition ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

export default function AccountPage() {
  const router = useRouter();
  const user = useUser();
  const updateUser = useUpdateUser();
  const resetUser = useResetUser();
  const { resetOnboarding } = useOnboardingActions();
  const { setUserCity } = useUserCity();
  const { theme, setTheme } = useTheme();
  const { tier, reset: resetMembership } = useMembership();
  const favorites = useFavoritesStore((state) => state.favorites);
  const resetFavorites = useFavoritesStore((state) => state.resetFavorites);
  const groups = useGroups((state) => state.groups);
  const resetGroups = useGroups((state) => state.reset);
  const reviewCount = useReviews((state) => state.reviews.filter((review) => review.userId === user.id).length);
  const resetReviews = useReviews((state) => state.reset);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(user.displayName);
  const [emailDraft, setEmailDraft] = useState(user.email);
  const [showSavedFlash, setShowSavedFlash] = useState(false);
  const [confirmClearSaved, setConfirmClearSaved] = useState(false);
  const [confirmResetAll, setConfirmResetAll] = useState(false);
  const [confirmReplayOnboarding, setConfirmReplayOnboarding] = useState(false);
  const [showInstallRow, setShowInstallRow] = useState(false);

  useEffect(() => {
    setNameDraft(user.displayName);
    setEmailDraft(user.email);
  }, [user.displayName, user.email]);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    const appleStandalone = "standalone" in window.navigator && window.navigator.standalone === true;
    const isMobile = window.innerWidth < 1024;
    setShowInstallRow(isMobile && !standalone && !appleStandalone);
  }, []);

  useEffect(() => {
    if (!showSavedFlash) return;
    const timeout = window.setTimeout(() => setShowSavedFlash(false), 1200);
    return () => window.clearTimeout(timeout);
  }, [showSavedFlash]);

  const joinedLabel = useMemo(() => {
    if (!user.joinedAt) return "April 2026";
    const date = new Date(user.joinedAt);
    if (Number.isNaN(date.getTime())) return "April 2026";
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }, [user.joinedAt]);

  const myGroupsCount = groups.filter((group) => group.creatorId === user.id).length;
  const currentTierFeatures = TIER_META[tier].features;
  const lockedFeatures =
    tier === "free"
      ? [...TIER_META.fan.features.slice(1, 5), ...TIER_META.elite.features.slice(1, 4)]
      : tier === "fan"
        ? TIER_META.elite.features.slice(1, 6)
        : [];

  function saveDisplayName() {
    updateUser({ displayName: nameDraft.trim() || "Fan" });
    setEditingName(false);
    setShowSavedFlash(true);
  }

  function toggleFavoriteCountry(slug: string) {
    const exists = user.favoriteCountries.includes(slug);
    const nextCountries = exists
      ? user.favoriteCountries.filter((item) => item !== slug)
      : user.favoriteCountries.length >= 5
        ? user.favoriteCountries
        : [...user.favoriteCountries, slug];

    if (!exists && user.favoriteCountries.length >= 5) {
      toast.error("You can select up to 5 countries.");
      return;
    }

    updateUser({ favoriteCountries: nextCountries });
  }

  function applyLanguage(code: string) {
    if (code === "en") {
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    } else {
      document.cookie = `googtrans=/en/${code}; path=/`;
    }
    updateUser({ language: code });
    window.location.reload();
  }

  function saveEmail() {
    updateUser({ email: emailDraft.trim() });
    toast.success("✓ Saved");
  }

  function handleResetAll() {
    resetFavorites();
    resetGroups();
    resetReviews();
    resetMembership();
    resetUser();
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.localStorage.clear();
    toast("All data cleared");
    router.push("/");
  }

  function handleReplayOnboarding() {
    resetOnboarding();
    resetMembership();
    toast.success("Demo mode reset. Starting onboarding again.");
    router.push("/welcome");
  }

  return (
    <main className="min-h-[100dvh] bg-bg px-4 py-8 sm:px-6 lg:px-8">
      <div className="container-shell space-y-6">
        <SectionCard title="Account" dark>
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-5">
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker((current) => !current)}
                  className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-gold bg-[var(--bg-avatar-deep)] text-2xl font-black tracking-[0.08em] text-gold"
                >
                  {user.avatarEmoji && user.avatarEmoji !== "⚽" ? user.avatarEmoji : getInitials(user.displayName)}
                </button>
                {showEmojiPicker ? (
                  <div className="grid grid-cols-5 gap-2 rounded-2xl bg-white/10 p-3">
                    {AVATAR_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => {
                          updateUser({ avatarEmoji: emoji });
                          setShowEmojiPicker(false);
                        }}
                        className="rounded-xl bg-white/10 py-2 text-2xl"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="space-y-3">
                {editingName ? (
                  <input
                    value={nameDraft}
                    onChange={(event) => setNameDraft(event.target.value)}
                    onBlur={saveDisplayName}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") saveDisplayName();
                    }}
                    autoFocus
                    className="rounded-full border border-gold bg-surface px-4 py-2 text-xl font-semibold text-deep outline-none"
                  />
                ) : (
                  <div className="flex w-full items-start justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setEditingName(true)}
                      className="min-w-0 flex-1 text-left text-[2.1rem] font-bold leading-none sm:text-3xl"
                    >
                      {user.displayName}
                    </button>
                    <div className="shrink-0">
                      <TierBadge tier={tier} size="sm" />
                    </div>
                  </div>
                )}
                {showSavedFlash ? <div className="text-xs font-semibold text-gold">✓ Saved</div> : null}
                <div className="text-sm text-white/65">Member since {joinedLabel}</div>
                <div className="text-xs text-white/50">Supporter profile</div>
              </div>
            </div>

            {tier === "free" ? (
              <Link href="/membership?return=%2Faccount" className="inline-flex rounded-full bg-gold px-5 py-3 text-sm font-bold text-[color:var(--fg-on-accent)]">
                ⭐ Upgrade to Fan Pass →
              </Link>
            ) : null}
          </div>
        </SectionCard>

        <SectionCard title="My Membership">
          <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
            <div className="space-y-3">
              {currentTierFeatures.map((feature) => (
                <div key={feature} className="flex items-start gap-2 text-sm text-[color:var(--fg-primary)]">
                  <span className="mt-0.5 text-emerald-600">✓</span>
                  <span>{feature}</span>
                </div>
              ))}
              {lockedFeatures.map((feature) => (
                <div key={feature} className="flex items-start gap-2 text-sm text-[color:var(--fg-muted)]">
                  <span className="mt-0.5">🔒</span>
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <div className="rounded-[1.5rem] border border-line bg-surface p-4">
              <div className="grid gap-3 text-sm text-[color:var(--fg-secondary)]">
                <div>🏟 {favorites.length} venues saved</div>
                <div>🌍 {user.favoriteCountries.length} countries filtered</div>
                <div>📅 Member since {joinedLabel}</div>
              </div>
              <div className="mt-5">
                {tier === "free" ? (
                  <Link href="/membership?return=%2Faccount" className="inline-flex w-full justify-center rounded-full bg-gold px-5 py-3 text-sm font-bold text-[color:var(--fg-on-accent)]">
                    Upgrade to Fan Pass — $4.99/mo
                  </Link>
                ) : tier === "fan" ? (
                  <Link href="/membership?return=%2Faccount" className="inline-flex w-full justify-center rounded-full bg-[var(--bg-surface-strong)] px-5 py-3 text-sm font-bold text-[color:var(--fg-on-strong)]">
                    Upgrade to Elite — $12.99/mo
                  </Link>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="inline-flex w-full justify-center rounded-full border border-line bg-[var(--bg-surface-elevated)] px-5 py-3 text-sm font-bold text-[color:var(--fg-secondary)]"
                  >
                    👑 Maximum access — you&apos;re all set
                  </button>
                )}
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="My Preferences">
          <div className="space-y-6">
            <div>
              <div className="text-sm font-semibold text-deep">Favorite City</div>
              <select
                value={user.favoriteCity}
                onChange={(event) => {
                  updateUser({ favoriteCity: event.target.value });
                  setUserCity(event.target.value);
                  toast.success("✓ Saved");
                }}
                className="mt-3 h-12 w-full rounded-2xl border border-line bg-surface px-4 text-sm text-deep"
              >
                {HOST_CITIES.map((city) => (
                  <option key={city.key} value={city.key}>
                    {city.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-deep">Favorite Countries</div>
                <div className="text-xs font-semibold text-mist">{user.favoriteCountries.length}/5 selected</div>
              </div>
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {demoCountries.map((country) => {
                  const active = user.favoriteCountries.includes(country.slug);
                  return (
                    <button
                      key={country.slug}
                      type="button"
                      onClick={() => toggleFavoriteCountry(country.slug)}
                      className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition ${
                        active ? "border-gold bg-gold text-[color:var(--fg-on-accent)]" : "border-line bg-surface text-deep"
                      }`}
                    >
                      <span>{country.flagEmoji}</span>
                      <span>{country.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold text-deep">Avatar Emoji</div>
              <div className="mt-3 grid grid-cols-5 gap-3 sm:grid-cols-10">
                {AVATAR_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => updateUser({ avatarEmoji: emoji })}
                    className={`flex h-12 items-center justify-center rounded-2xl border text-2xl transition ${
                      user.avatarEmoji === emoji ? "border-gold bg-[var(--accent-soft-bg)]" : "border-line bg-surface"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Notifications">
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-line px-4 py-4">
              <div>
                <div className="font-semibold text-deep">🔔 New venue alerts</div>
                <div className="mt-1 text-sm text-mist">Know when new bars are added to your city.</div>
              </div>
              <Toggle checked={user.notifyNewVenues} onClick={() => updateUser({ notifyNewVenues: !user.notifyNewVenues })} />
            </div>

            <div className="flex w-full items-center justify-between gap-4 rounded-2xl border border-line px-4 py-4 text-left">
              <div>
                <div className="font-semibold text-deep">⚡ Match day alerts</div>
                <div className="mt-1 text-sm text-mist">Get a reminder before your team kicks off.</div>
              </div>
              <div className="flex items-center gap-3">
                {tier !== "elite" ? (
                  <span className="rounded-full border border-gold px-3 py-1 text-xs font-bold text-[color:var(--accent-soft-fg)]">
                    Elite feature
                  </span>
                ) : null}
                <Toggle
                  checked={user.notifyMatchAlerts}
                  disabled={tier !== "elite"}
                  onClick={() => {
                    if (tier !== "elite") {
                      router.push("/membership?feature=match_alerts&return=%2Faccount");
                      return;
                    }
                    updateUser({ notifyMatchAlerts: !user.notifyMatchAlerts });
                  }}
                />
              </div>
            </div>

            {(user.notifyNewVenues || user.notifyMatchAlerts || tier === "elite") ? (
              <div>
                <div className="text-sm font-semibold text-deep">Alert email</div>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                  <input
                    type="email"
                    value={emailDraft}
                    onChange={(event) => setEmailDraft(event.target.value)}
                    onBlur={saveEmail}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") saveEmail();
                    }}
                    className="h-12 flex-1 rounded-2xl border border-line bg-surface px-4 text-sm text-deep"
                    placeholder="your@email.com"
                  />
                  <button type="button" onClick={saveEmail} className="inline-flex h-12 items-center justify-center rounded-2xl bg-gold px-5 text-sm font-bold text-[color:var(--fg-on-accent)]">
                    Save
                  </button>
                </div>
                <div className="mt-2 text-xs text-[color:var(--ink-45)]">Stored locally on this device · Never shared</div>
              </div>
            ) : null}
          </div>
        </SectionCard>

        <SectionCard title="Language">
          <div className="grid gap-3 sm:grid-cols-3">
            {LANGUAGES.map((language) => {
              const active = user.language === language.code;
              return (
                <button
                  key={language.code}
                  type="button"
                  onClick={() => applyLanguage(language.code)}
                  className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                    active ? "border-gold bg-[var(--accent-soft-bg)] text-deep" : "border-line bg-surface text-deep"
                  }`}
                >
                  <span className="text-xl">{language.flag}</span>
                  <span className="font-semibold">{language.label}</span>
                </button>
              );
            })}
          </div>
          <div className="mt-4 text-xs text-[color:var(--ink-45)]">Powered by Google Translate · Some UI may stay in English</div>
        </SectionCard>

        <SectionCard title="App Settings">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-line px-4 py-4">
              <div>
                <div className="font-semibold text-deep">Appearance</div>
                <div className="mt-1 text-sm text-mist">Current theme: {theme}</div>
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                {(["light", "dark", "system"] as const).map((option) => {
                  const active = theme === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setTheme(option);
                        updateUser({ prefersDarkMode: option === "dark" });
                      }}
                      className={`rounded-full border px-3 py-2 text-sm font-semibold transition ${
                        active ? "border-gold bg-[var(--accent-soft-bg)] text-deep" : "border-line bg-surface text-deep"
                      }`}
                    >
                      {option === "light" ? "Light" : option === "dark" ? "Dark" : "System"}
                    </button>
                  );
                })}
              </div>
            </div>

            {showInstallRow ? (
              <div className="rounded-2xl border border-line px-4 py-4 text-sm text-deep">
                📲 Tap Share → Add to Home Screen to install GameDay Map
              </div>
            ) : null}

            <div className="rounded-2xl border border-line px-4 py-4">
              {!confirmClearSaved ? (
                <button type="button" onClick={() => setConfirmClearSaved(true)} className="text-sm font-semibold text-deep">
                  Clear saved venues
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="text-sm text-[color:var(--fg-secondary)]">Are you sure? This removes all {favorites.length} saved venues.</div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setConfirmClearSaved(false)} className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-deep">
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        resetFavorites();
                        setConfirmClearSaved(false);
                        toast.success("Saved venues cleared");
                      }}
                      className="rounded-full bg-gold px-4 py-2 text-sm font-bold text-[color:var(--fg-on-accent)]"
                    >
                      Yes, clear
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </SectionCard>

        <SectionCard title="About">
          <div className="space-y-4 text-sm">
            <div className="text-mist">GameDay Map · v1.0.0 · World Cup 2026</div>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-deep">
              <Link href="/privacy" className="underline">Privacy Policy</Link>
              <Link href="/terms" className="underline">Terms</Link>
              <Link href="/submit" className="underline">Submit a Venue</Link>
              <Link href="mailto:hello@gamedaymap.com" className="underline">Contact</Link>
              {myGroupsCount > 0 ? <Link href="/groups" className="underline">Groups ({myGroupsCount})</Link> : null}
              {reviewCount > 0 ? <span className="text-mist">Reviews written: {reviewCount}</span> : null}
            </div>

            {!confirmResetAll ? (
              <button type="button" onClick={() => setConfirmResetAll(true)} className="text-sm font-semibold text-red-600">
                Reset All Data
              </button>
            ) : (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4">
                <div className="text-sm text-red-700">
                  This deletes all your preferences, saves, and membership. Continue?
                </div>
                <div className="mt-3 flex gap-2">
                  <button type="button" onClick={() => setConfirmResetAll(false)} className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-700">
                    Cancel
                  </button>
                  <button type="button" onClick={handleResetAll} className="rounded-full bg-red-600 px-4 py-2 text-sm font-bold text-white">
                    Reset Everything
                  </button>
                </div>
              </div>
            )}
          </div>
        </SectionCard>

        <SectionCard title="Demo & Reset">
          <div className="space-y-4 text-sm">
            <div>
              <div className="font-semibold text-deep">Replay onboarding (demo mode)</div>
              <div className="mt-1 text-mist">
                Reset your personalization and walk through the welcome flow again.
              </div>
            </div>

            {!confirmReplayOnboarding ? (
              <button
                type="button"
                onClick={() => setConfirmReplayOnboarding(true)}
                className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-deep"
              >
                Reset & Replay
              </button>
            ) : (
              <div className="rounded-2xl border border-line bg-surface px-4 py-4">
                <div className="text-sm text-[color:var(--fg-secondary)]">
                  This clears your name, country picks, filters, and plan choice. Saved venues are kept. Continue?
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmReplayOnboarding(false)}
                    className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-deep"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleReplayOnboarding}
                    className="rounded-full bg-gold px-4 py-2 text-sm font-bold text-[color:var(--fg-on-accent)]"
                  >
                    Reset & Replay
                  </button>
                </div>
              </div>
            )}
          </div>
        </SectionCard>
      </div>
    </main>
  );
}
