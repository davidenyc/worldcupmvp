"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { submissionSchema } from "@/lib/validation/submission";

type FormValues = {
  name: string;
  address: string;
  borough: "Manhattan" | "Brooklyn" | "Queens" | "Bronx" | "Staten Island";
  neighborhood?: string;
  website?: string;
  instagram?: string;
  countryAssociation: string;
  showsSoccer: boolean;
  acceptsReservations: boolean;
  approximateCapacity?: number;
  description: string;
};

export function SubmitForm() {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const { register, handleSubmit, setValue, watch, reset } = useForm<FormValues>({
    defaultValues: {
      borough: "Manhattan",
      showsSoccer: true,
      acceptsReservations: false
    }
  });
  const showsSoccer = watch("showsSoccer");
  const acceptsReservations = watch("acceptsReservations");

  function onSubmit(values: FormValues) {
    const parsed = submissionSchema.safeParse(values);
    if (parsed.success) {
      reset();
      setStatus("success");
      return;
    }
    setStatus("error");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="surface-strong p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Input placeholder="Venue name" {...register("name")} />
        <Input placeholder="Address" {...register("address")} />
        <Select {...register("borough")}>
          <option value="Manhattan">Manhattan</option>
          <option value="Brooklyn">Brooklyn</option>
          <option value="Queens">Queens</option>
          <option value="Bronx">Bronx</option>
          <option value="Staten Island">Staten Island</option>
        </Select>
        <Input placeholder="Neighborhood" {...register("neighborhood")} />
        <Input placeholder="Website" {...register("website")} />
        <Input placeholder="Instagram URL" {...register("instagram")} />
        <Input placeholder="Country association" {...register("countryAssociation")} />
        <Input placeholder="Approximate capacity" type="number" {...register("approximateCapacity", { valueAsNumber: true })} />
      </div>

      <div className="mt-4 flex flex-wrap gap-6 text-sm text-navy/72">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={showsSoccer}
            onChange={(e) => setValue("showsSoccer", e.target.checked)}
            className="h-4 w-4 rounded border-line"
          />
          Shows soccer matches
        </label>
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={acceptsReservations}
            onChange={(e) => setValue("acceptsReservations", e.target.checked)}
            className="h-4 w-4 rounded border-line"
          />
          Accepts reservations
        </label>
      </div>

      <textarea
        className="mt-4 min-h-[160px] w-full rounded-3xl border border-line bg-white px-4 py-3 text-sm text-ink placeholder:text-mist focus:border-accent focus:outline-none"
        placeholder="Describe the venue, likely fan base, and why it matters on match day."
        {...register("description")}
      />

      {status === "success" ? (
        <div className="mt-4 rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
          Thanks. Your venue suggestion was captured for review.
        </div>
      ) : null}

      {status === "error" ? (
        <div className="mt-4 rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
          A few details are still missing. Fill out the required fields and try again.
        </div>
      ) : null}

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-navy/62">
          Suggestions go into the moderation queue next.
        </p>
        <Button type="submit" className="w-full sm:w-auto">Submit venue</Button>
      </div>
    </form>
  );
}
