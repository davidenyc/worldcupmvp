"use client";

import { useRouter } from "next/navigation";
import { CountrySummary } from "@/lib/types";

export function CountryFlagsBanner({ countries }: { countries: CountrySummary[] }) {
  const router = useRouter();
  const loopedCountries = [...countries, ...countries];

  return (
    <section className="overflow-hidden bg-gray-950 py-3">
      <div className="flag-banner-track">
        {loopedCountries.map((country, index) => (
          <button
            key={`${country.slug}-${index}`}
            type="button"
            onClick={() => router.push(`/map?country=${country.slug}`)}
            className="group flex w-16 shrink-0 cursor-pointer flex-col items-center gap-1 px-2 text-white transition-transform duration-200 hover:scale-[1.15]"
            aria-label={`Explore ${country.name} supporter spots`}
          >
            <span className="text-3xl leading-none">{country.flagEmoji}</span>
            <span className="w-full truncate text-center text-xs font-medium tracking-[0.08em] text-white/80">
              {country.name}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
