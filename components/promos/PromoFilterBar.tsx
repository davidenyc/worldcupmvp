// Filter chip bar for /promos that rewrites the URL for city, country, match, and timeframe views.
"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function PromoFilterBar({
  defaultCity,
  defaultCountry,
  defaultMatchId
}: {
  defaultCity: string;
  defaultCountry?: string;
  defaultMatchId?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParams(next: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([key, value]) => {
      if (!value) {
        params.delete(key);
        return;
      }
      params.set(key, value);
    });
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  const chips = [
    {
      label: "All",
      active:
        !searchParams.get("filter") &&
        !searchParams.get("country") &&
        !searchParams.get("matchId") &&
        !searchParams.get("city"),
      onClick: () => updateParams({ filter: null, country: null, matchId: null, city: null })
    },
    {
      label: "Today",
      active: searchParams.get("filter") === "today",
      onClick: () => updateParams({ filter: searchParams.get("filter") === "today" ? null : "today" })
    },
    {
      label: "This Match",
      active: Boolean(searchParams.get("matchId")),
      onClick: () => updateParams({ matchId: searchParams.get("matchId") ? null : defaultMatchId ?? null })
    },
    {
      label: "By Country",
      active: Boolean(searchParams.get("country")),
      onClick: () => updateParams({ country: searchParams.get("country") ? null : defaultCountry ?? null })
    },
    {
      label: "By City",
      active: Boolean(searchParams.get("city")),
      onClick: () => updateParams({ city: searchParams.get("city") ? null : defaultCity })
    }
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip) => (
        <button
          key={chip.label}
          type="button"
          onClick={chip.onClick}
          className={`inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-semibold transition ${
            chip.active
              ? "border-gold bg-gold text-deep"
              : "border-line bg-surface text-deep hover:bg-surface-2"
          }`}
        >
          {chip.label}
        </button>
      ))}
    </div>
  );
}
