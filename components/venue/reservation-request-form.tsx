"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePremiumGate } from "@/lib/hooks/usePremiumGate";

type ReservationRequestValues = {
  name: string;
  email: string;
  partySize: string;
  notes: string;
};

export function ReservationRequestForm({ venueName, venueSlug }: { venueName: string; venueSlug: string }) {
  const { register, handleSubmit, reset } = useForm<ReservationRequestValues>();
  const { hasAccess } = usePremiumGate("reservation_request");

  function onSubmit() {
    reset();
  }

  if (!hasAccess) {
    return (
      <div className="rounded-2xl border border-gold/30 bg-deep p-6 text-center">
        <div className="text-3xl mb-3">🔒</div>
        <div className="text-lg font-bold text-[color:var(--fg-on-strong)] mb-2">
          Reservations are a Fan Pass feature
        </div>
        <div className="text-sm text-[color:var(--fg-secondary-on-strong)] mb-5 max-w-xs mx-auto">
          Fan Pass members can request reservations at any venue in our network.
          Venues respond within 24 hours.
        </div>
        <Link
          href={`/membership?feature=reservation_request&return=${encodeURIComponent(`/venue/${venueSlug}`)}`}
          className="inline-flex items-center gap-2 rounded-full bg-gold
            px-6 py-3 text-sm font-bold text-deep transition hover:brightness-95"
        >
          ⭐ Upgrade to Fan Pass — $4.99/mo
        </Link>
        <div className="mt-2 text-xs text-[color:var(--fg-on-strong)]/30">Demo mode — no payment required</div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <div className="text-sm uppercase tracking-[0.2em] text-mist">Reservation request</div>
        <p className="mt-2 text-sm text-navy/70">
          Demo flow for {venueName}. Wire this to a Prisma-backed request table or venue-partner workflow.
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Input placeholder="Your name" {...register("name")} />
        <Input placeholder="Email" type="email" {...register("email")} />
        <Input placeholder="Party size" {...register("partySize")} />
        <Input placeholder="Preferred match or date" {...register("notes")} />
      </div>
      <Button type="submit">Request a reservation</Button>
    </form>
  );
}
