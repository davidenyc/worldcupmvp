"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { PrimaryCountryStrip } from "@/components/home/PrimaryCountryStrip";
import { CitySelector } from "@/components/ui/CitySelector";
import type { CountrySummary } from "@/lib/types";

interface MarketingHeroActionsProps {
  countries: CountrySummary[];
}

export function MarketingHeroActions({ countries }: MarketingHeroActionsProps) {
  const router = useRouter();
  const [panel, setPanel] = useState<"city" | "team" | null>(null);
  const [selectedCity, setSelectedCity] = useState("nyc");

  const panelBody = useMemo(() => {
    if (panel === "city") {
      return (
        <div className="surface mt-4 p-4">
          <CitySelector
            selectedCity={selectedCity}
            onSelectCity={(city) => {
              setSelectedCity(city);
              router.push(`/${city}/map`);
            }}
          />
        </div>
      );
    }

    if (panel === "team") {
      return (
        <div className="surface mt-4 p-4">
          <PrimaryCountryStrip countries={countries} cityKey={selectedCity} />
        </div>
      );
    }

    return null;
  }, [countries, panel, router, selectedCity]);

  return (
    <>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          onClick={() => setPanel((current) => (current === "city" ? null : "city"))}
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-line px-5 text-sm font-semibold text-[color:var(--fg-primary)] transition hover:bg-[var(--bg-surface)]"
        >
          Pick a city
        </button>
        <button
          type="button"
          onClick={() => setPanel((current) => (current === "team" ? null : "team"))}
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-line px-5 text-sm font-semibold text-[color:var(--fg-primary)] transition hover:bg-[var(--bg-surface)]"
        >
          Pick your team
        </button>
        <button
          type="button"
          onClick={() => router.push("/today")}
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-line px-5 text-sm font-semibold text-[color:var(--fg-primary)] transition hover:bg-[var(--bg-surface)]"
        >
          See tonight&apos;s matches
        </button>
        <button
          type="button"
          onClick={() => router.push("/welcome")}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-gold px-5 text-sm font-semibold text-[color:var(--fg-on-accent)]"
        >
          Personalize my Cup →
        </button>
      </div>
      {panelBody}
    </>
  );
}
