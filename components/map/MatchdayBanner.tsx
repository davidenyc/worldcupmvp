import { CountrySummary } from "@/lib/types";
import { WorldCupMatch } from "@/lib/data/matches";

function getCountry(countries: CountrySummary[], slug: string) {
  return countries.find((country) => country.slug === slug);
}

export function MatchdayBanner({
  countries,
  match,
  onApplyMatch
}: {
  countries: CountrySummary[];
  match: WorldCupMatch | null;
  onApplyMatch: (match: WorldCupMatch) => void;
}) {
  if (!match) return null;

  const home = getCountry(countries, match.homeCountry);
  const away = getCountry(countries, match.awayCountry);
  const kickOff = new Date(match.startsAt).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/New_York"
  });

  return (
    <div className="rounded-3xl border border-rose-400/20 bg-rose-950/95 px-4 py-3 text-white shadow-2xl shadow-rose-950/20">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3 text-sm font-semibold">
          <span className="rounded-full bg-rose-500/20 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-rose-100">
            🔴 Live today
          </span>
          <span className="flex items-center gap-2">
            <span className="text-2xl">{home?.flagEmoji ?? "🏁"}</span>
            <span>{home?.name ?? match.homeCountry}</span>
          </span>
          <span className="text-rose-200/70">vs</span>
          <span className="flex items-center gap-2">
            <span className="text-2xl">{away?.flagEmoji ?? "🏁"}</span>
            <span>{away?.name ?? match.awayCountry}</span>
          </span>
          <span className="hidden md:inline text-rose-200/70">·</span>
          <span className="text-rose-100/85">Kick off {kickOff}</span>
        </div>
        <button
          type="button"
          onClick={() => onApplyMatch(match)}
          className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-rose-950 transition hover:bg-rose-50"
        >
          Find a watch spot
        </button>
      </div>
    </div>
  );
}
