import type { WorldCupMatch } from "@/lib/data/matches";

export type MatchWindow = "live" | "tonight" | "today" | "tomorrow" | "upcoming" | "past";

export interface MatchTimeContext {
  window: MatchWindow;
  minutesUntilKickoff: number;
  countdownLabel: string;
  isLive: boolean;
}

const LIVE_DURATION_MINUTES = 110;
const KICKING_OFF_THRESHOLD_MINUTES = 5;

function getLocalParts(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });

  const parts = formatter.formatToParts(date);
  const read = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? "0");

  return {
    year: read("year"),
    month: read("month"),
    day: read("day"),
    hour: read("hour"),
    minute: read("minute")
  };
}

function getLocalDateKey(date: Date, timeZone: string) {
  const { year, month, day } = getLocalParts(date, timeZone);
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function addDaysToDateKey(dateKey: string, days: number) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const utcDate = new Date(Date.UTC(year, month - 1, day));
  utcDate.setUTCDate(utcDate.getUTCDate() + days);
  return `${utcDate.getUTCFullYear()}-${String(utcDate.getUTCMonth() + 1).padStart(2, "0")}-${String(
    utcDate.getUTCDate()
  ).padStart(2, "0")}`;
}

function formatCountdownLabel(minutesUntilKickoff: number) {
  if (minutesUntilKickoff <= -LIVE_DURATION_MINUTES) {
    return "full time";
  }

  if (minutesUntilKickoff < 0) {
    const minutesSinceKickoff = Math.abs(minutesUntilKickoff);
    if (minutesSinceKickoff >= 45 && minutesSinceKickoff <= 65) {
      return "halftime";
    }
    return "live now";
  }

  if (minutesUntilKickoff <= KICKING_OFF_THRESHOLD_MINUTES) {
    return "kicking off";
  }

  const days = Math.floor(minutesUntilKickoff / (24 * 60));
  const hours = Math.floor((minutesUntilKickoff % (24 * 60)) / 60);
  const minutes = minutesUntilKickoff % 60;

  if (days > 0) {
    return hours > 0 ? `in ${days}d ${hours}h` : `in ${days}d`;
  }

  if (hours > 0) {
    return minutes > 0 ? `in ${hours}h ${minutes}m` : `in ${hours}h`;
  }

  return `in ${minutes}m`;
}

export function classifyMatch(match: WorldCupMatch, now: Date, tz: string): MatchTimeContext {
  const startsAt = new Date(match.startsAt);
  const minutesUntilKickoff = Math.round((startsAt.getTime() - now.getTime()) / 60000);
  const isLive = minutesUntilKickoff <= 0 && minutesUntilKickoff >= -LIVE_DURATION_MINUTES;

  if (minutesUntilKickoff < -LIVE_DURATION_MINUTES) {
    return {
      window: "past",
      minutesUntilKickoff,
      countdownLabel: formatCountdownLabel(minutesUntilKickoff),
      isLive: false
    };
  }

  if (isLive) {
    return {
      window: "live",
      minutesUntilKickoff,
      countdownLabel: formatCountdownLabel(minutesUntilKickoff),
      isLive: true
    };
  }

  const nowDateKey = getLocalDateKey(now, tz);
  const tomorrowDateKey = addDaysToDateKey(nowDateKey, 1);
  const matchDateKey = getLocalDateKey(startsAt, tz);
  const nowParts = getLocalParts(now, tz);
  const matchParts = getLocalParts(startsAt, tz);

  if (matchDateKey === nowDateKey) {
    const isTonight = nowParts.hour >= 16 || matchParts.hour >= 18;
    return {
      window: isTonight ? "tonight" : "today",
      minutesUntilKickoff,
      countdownLabel: formatCountdownLabel(minutesUntilKickoff),
      isLive: false
    };
  }

  if (matchDateKey === tomorrowDateKey) {
    return {
      window: "tomorrow",
      minutesUntilKickoff,
      countdownLabel: formatCountdownLabel(minutesUntilKickoff),
      isLive: false
    };
  }

  return {
    window: "upcoming",
    minutesUntilKickoff,
    countdownLabel: formatCountdownLabel(minutesUntilKickoff),
    isLive: false
  };
}
