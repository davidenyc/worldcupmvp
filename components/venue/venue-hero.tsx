import Image from "next/image";
import { MapPin, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { RankedVenue } from "@/lib/types";
import { formatPriceLevel } from "@/lib/utils";

export function VenueHero({ venue }: { venue: RankedVenue }) {
  return (
    <section className="container-shell py-10">
      <div className="grid gap-6 lg:grid-cols-[1.15fr,0.85fr]">
        <div className="surface-strong overflow-hidden p-4">
          <div className="grid gap-4 md:grid-cols-[1.1fr,0.9fr]">
            <div className="relative min-h-[360px] overflow-hidden rounded-[28px]">
              <Image
                src={venue.imageUrls[0]}
                alt={venue.name}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/10 to-transparent" />
              <div className="absolute left-5 top-5 flex flex-wrap gap-2">
                {venue.isOfficialFanHub && <Badge className="bg-accent text-white">Official fan hub</Badge>}
                {venue.acceptsReservations && <Badge>Reserve a spot</Badge>}
              </div>
              <div className="absolute bottom-5 left-5 right-5">
                <h1 className="text-4xl font-semibold tracking-tight text-deep">{venue.name}</h1>
                <div className="mt-3 flex flex-wrap gap-4 text-sm text-navy/75">
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-accent" />
                    {venue.address}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Star className="h-4 w-4 text-accent" />
                    {venue.rating ?? "N/A"} rating
                  </span>
                  <span>{formatPriceLevel(venue.priceLevel)}</span>
                </div>
              </div>
            </div>
            <div className="grid gap-4">
              {venue.imageUrls.slice(1, 3).map((image, index) => (
                <div key={image} className="relative min-h-[172px] overflow-hidden rounded-[24px]">
                  <Image src={image} alt={`${venue.name} gallery ${index + 2}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="surface p-5">
            <div className="text-sm uppercase tracking-[0.2em] text-mist">Best for watching matches</div>
            <div className="mt-2 text-2xl font-semibold text-deep">
              {venue.gameDayScore >= 9 ? "Premium watch-party pick" : "Reliable match-day venue"}
            </div>
            <p className="mt-3 text-sm leading-6 text-navy/72">{venue.editorialNotes}</p>
          </div>
          <div className="surface p-5">
            <div className="text-sm uppercase tracking-[0.2em] text-mist">Capacity and reservation</div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-white p-4">
                <div className="text-xs text-mist">Approx. capacity</div>
                <div className="mt-2 text-3xl font-semibold text-deep">{venue.approximateCapacity ?? "--"}</div>
              </div>
              <div className="rounded-2xl bg-white p-4">
                <div className="text-xs text-mist">Reservation status</div>
                <div className="mt-2 text-xl font-semibold text-deep">
                  {venue.acceptsReservations ? "Available" : "Walk-in"}
                </div>
              </div>
            </div>
          </div>
          <div className="surface p-5">
            <div className="text-sm uppercase tracking-[0.2em] text-mist">Atmosphere</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {venue.atmosphereTags.map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
