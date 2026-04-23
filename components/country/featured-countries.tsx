import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { CountrySummary } from "@/lib/types";

export function FeaturedCountries({ countries }: { countries: CountrySummary[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {countries.map((country) => (
        <Link
          href={`/country/${country.slug}`}
          key={country.slug}
          className="surface group overflow-hidden p-5 transition hover:-translate-y-1 hover:border-accent/30"
        >
          <div className="h-1 rounded-full" style={{ backgroundColor: country.primaryColors[0] }} />
          <div className="mt-4 text-4xl">{country.flagEmoji}</div>
          <div className="mt-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-deep">{country.name}</h3>
            <Badge>{country.fifaCode}</Badge>
          </div>
          <p className="mt-2 text-sm text-navy/65">{country.supportersLabel}</p>
        </Link>
      ))}
    </div>
  );
}
