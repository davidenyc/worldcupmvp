import { NextResponse } from "next/server";

import { dispatch } from "@/lib/notifications/dispatcher";
import { getCityTimeZone } from "@/lib/data/cityTimezones";
import { demoCountries } from "@/lib/data/demo";
import { worldCup2026Matches } from "@/lib/data/matches";
import { prisma } from "@/lib/prisma";

function getMatchWindowMatches(minMinutes: number, maxMinutes: number) {
  const now = Date.now();
  return worldCup2026Matches.filter((match) => {
    const diffMinutes = (Date.parse(match.startsAt) - now) / 60000;
    return diffMinutes >= minMinutes && diffMinutes <= maxMinutes;
  });
}

function getLocalTimeParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).formatToParts(date);

  const value = (type: string) => parts.find((part) => part.type === type)?.value ?? "";

  return {
    year: value("year"),
    month: value("month"),
    day: value("day"),
    hour: Number(value("hour") || 0),
    minute: Number(value("minute") || 0)
  };
}

function getLocalDateKey(date: Date, timeZone: string) {
  const parts = getLocalTimeParts(date, timeZone);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function getCountryName(slug: string) {
  return demoCountries.find((country) => country.slug === slug)?.name ?? slug;
}

async function alreadySentRecently(profileId: string, kind: string, hours = 22) {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);
  const existing = await prisma.notification.findFirst({
    where: {
      profileId,
      kind,
      createdAt: {
        gte: since
      }
    },
    select: { id: true }
  });

  return Boolean(existing);
}

async function dispatchKickoffWindow(kind: "kickoff_1h" | "kickoff_30m", minMinutes: number, maxMinutes: number) {
  const matches = getMatchWindowMatches(minMinutes, maxMinutes);
  if (!matches.length) return 0;

  const watchedRows = await prisma.profileWatchedMatch.findMany({
    where: {
      matchId: { in: matches.map((match) => match.id) }
    }
  });

  let sent = 0;
  for (const watched of watchedRows) {
    const match = matches.find((entry) => entry.id === watched.matchId);
    if (!match) continue;

    await dispatch({
      profileId: watched.profileId,
      kind,
      title:
        kind === "kickoff_1h"
          ? `${getCountryName(match.homeCountry)} vs ${getCountryName(match.awayCountry)} in 1 hour`
          : `${getCountryName(match.homeCountry)} vs ${getCountryName(match.awayCountry)} in 30 minutes`,
      body:
        kind === "kickoff_1h"
          ? "Your watched match is coming up soon. Lock in your room before kickoff."
          : "Kickoff is close. Time to head to your match-night room.",
      payload: {
        matchId: match.id
      },
      href: `/today?city=nyc&match=${match.id}`
    });
    sent += 1;
  }

  return sent;
}

async function dispatchDailyDigest() {
  const profiles = await prisma.profile.findMany({
    include: {
      watchedMatches: true
    }
  });

  const now = new Date();
  let sent = 0;

  for (const profile of profiles) {
    const timeZone = getCityTimeZone(profile.homeCity ?? profile.favoriteCity ?? "nyc");
    const localParts = getLocalTimeParts(now, timeZone);

    if (localParts.hour !== 8 || localParts.minute > 5) continue;
    if (await alreadySentRecently(profile.id, "match_day_digest")) continue;

    const todayKey = getLocalDateKey(now, timeZone);
    const watchedToday = profile.watchedMatches
      .map((watched) => worldCup2026Matches.find((match) => match.id === watched.matchId))
      .filter((match): match is NonNullable<typeof match> => Boolean(match))
      .filter((match) => getLocalDateKey(new Date(match.startsAt), timeZone) === todayKey);

    if (!watchedToday.length) continue;

    await dispatch({
      profileId: profile.id,
      kind: "match_day_digest",
      title: `Today's GameDay Map lineup`,
      body: `You have ${watchedToday.length} watched ${watchedToday.length === 1 ? "match" : "matches"} today. Open your Cup to plan the rooms.`,
      payload: {
        matchIds: watchedToday.map((match) => match.id)
      },
      href: "/me"
    });
    sent += 1;
  }

  return sent;
}

async function dispatchPromoExpiringStub() {
  const profiles = await prisma.profile.findMany({
    select: { id: true, homeCity: true, favoriteCity: true }
  });
  const now = new Date();
  let skippedProfiles = 0;

  for (const profile of profiles) {
    const timeZone = getCityTimeZone(profile.homeCity ?? profile.favoriteCity ?? "nyc");
    const localParts = getLocalTimeParts(now, timeZone);
    if (localParts.hour !== 10 || localParts.minute > 5) continue;
    if (await alreadySentRecently(profile.id, "promo_expiring")) continue;

    // TODO(needs-server-saved-promos): move saved promos to the server so this trigger can go live.
    skippedProfiles += 1;
  }

  return skippedProfiles;
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const expected = process.env.CRON_SECRET;

  if (!expected || authHeader !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const kickoff1h = await dispatchKickoffWindow("kickoff_1h", 60, 65);
  const kickoff30m = await dispatchKickoffWindow("kickoff_30m", 30, 35);
  const digests = await dispatchDailyDigest();
  const promoExpiringSkipped = await dispatchPromoExpiringStub();

  return NextResponse.json({
    ok: true,
    kickoff1h,
    kickoff30m,
    digests,
    promoExpiringSkipped
  });
}
