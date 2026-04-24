import { CountrySummary } from "@/lib/types";
import { WorldCupMatch } from "@/lib/data/matches";

function getCountry(countries: CountrySummary[], slug: string) {
  return countries.find((country) => country.slug === slug);
}

export function MatchdayBanner({
  countries,
  match,
  onApplyMatch,
  onDismiss
}: {
  countries: CountrySummary[];
  match: WorldCupMatch | null;
  onApplyMatch: (match: WorldCupMatch) => void;
  onDismiss?: () => void;
}) {
  if (!match) return null;

  const home = getCountry(countries, match.homeCountry);
  const away = getCountry(countries, match.awayCountry);
  const kickOff = new Date(match.startsAt).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/New_York"
  });
  const stadiumLabel = match.isNYNJ ? "MetLife Stadium" : match.stadiumName;

  return (
    <div className="flex w-full items-center gap-3 rounded-2xl bg-red-600 px-4 py-3 text-white shadow-2xl">
      <span className="rounded-full bg-white/15 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/90">
        🔴 Matchday
      </span>
      <div className="min-w-0 flex-1 flex flex-wrap items-center gap-2 text-sm font-semibold">
        <span className="flex items-center gap-2">
          <span className="text-xl">{home?.flagEmoji ?? "🏁"}</span>
          <span>{home?.name ?? match.homeCountry}</span>
        </span>
        <span className="text-white/80">vs</span>
        <span className="flex items-center gap-2">
          <span>{away?.name ?? match.awayCountry}</span>
          <span className="text-xl">{away?.flagEmoji ?? "🏁"}</span>
        </span>
        <span className="hidden md:inline text-white/80">·</span>
        <span className="text-white/90">Kick off {kickOff} ET</span>
        <span className="hidden lg:inline text-white/80">· {stadiumLabel}</span>
      </div>
      <button
        type="button"
        onClick={() => onApplyMatch(match)}
        className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
      >
        Find spots →
      </button>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss match alert"
          className="ml-1 rounded-full p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
        >
          ✕
        </button>
      )}
    </div>
  );
}
