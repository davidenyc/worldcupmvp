"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useUserCity } from "@/lib/hooks/useUserCity";
import { CountrySummary } from "@/lib/types";

export function HomeCountryPicker({ countries }: { countries: CountrySummary[] }) {
  const router = useRouter();
  const { userCity, suggestedCity } = useUserCity();
  const [search, setSearch] = useState("");
  const targetCity = userCity ?? suggestedCity ?? "nyc";

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return countries;
    return countries.filter((country) => country.name.toLowerCase().includes(query));
  }, [countries, search]);

  return (
    <div className="space-y-4">
      <input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search your country..."
        className="h-11 w-full max-w-sm rounded-full border border-line bg-white px-4 text-sm text-deep outline-none placeholder:text-mist dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30"
      />
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
        {visible.map((country) => (
          <button
            key={country.slug}
            type="button"
            onClick={() => router.push(`/${targetCity}/map?country=${country.slug}`)}
            className="flex flex-col items-center rounded-xl border border-line bg-white px-2 py-3 text-center transition hover:border-[#f4b942] hover:bg-[#fff8e7] dark:border-white/10 dark:bg-[#161b22] dark:hover:bg-white/10"
          >
            <div className="text-2xl">{country.flagEmoji}</div>
            <div className="mt-1 w-full truncate text-[10px] font-semibold text-deep dark:text-white">{country.name}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
