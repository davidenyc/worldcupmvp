"use client";

import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ReservationRequestValues = {
  name: string;
  email: string;
  partySize: string;
  notes: string;
};

export function ReservationRequestForm({ venueName }: { venueName: string }) {
  const { register, handleSubmit, reset } = useForm<ReservationRequestValues>();

  function onSubmit() {
    reset();
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
