"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { demoCountries } from "@/lib/data/demo";
import { submissionSchema } from "@/lib/validation/submission";

type FormValues = {
  name: string;
  address: string;
  countryAssociation: string;
  notes: string;
  email: string;
};

const COUNTRY_OPTIONS = demoCountries
  .map((country) => country.name)
  .sort((left, right) => left.localeCompare(right));

export function SubmitForm() {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const { register, handleSubmit, reset } = useForm<FormValues>();

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
        <Input
          placeholder="Venue name"
          aria-label="Venue name"
          className="placeholder:text-ink/45 dark:placeholder:text-white/40"
          {...register("name")}
        />
        <Input
          placeholder="Address"
          aria-label="Address"
          className="placeholder:text-ink/45 dark:placeholder:text-white/40"
          {...register("address")}
        />
        <div className="md:col-span-2">
          <Input
            list="submit-country-associations"
            placeholder="Country association"
            aria-label="Country association"
            className="placeholder:text-ink/45 dark:placeholder:text-white/40"
            {...register("countryAssociation")}
          />
          <datalist id="submit-country-associations">
            {COUNTRY_OPTIONS.map((country) => (
              <option key={country} value={country} />
            ))}
          </datalist>
        </div>
        <div className="md:col-span-2">
          <textarea
            className="min-h-[160px] w-full rounded-3xl border border-line bg-white px-4 py-3 text-sm text-ink placeholder:text-ink/45 focus:border-accent focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/40"
            placeholder="Notes on the crowd, TVs, energy, or why this place matters on match day."
            aria-label="Notes"
            {...register("notes")}
          />
        </div>
        <div className="md:col-span-2">
          <Input
            placeholder="Email"
            type="email"
            aria-label="Email"
            className="placeholder:text-ink/45 dark:placeholder:text-white/40"
            {...register("email")}
          />
        </div>
      </div>

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
        <p className="text-sm text-navy/62">We&apos;ll review within 48 hours.</p>
        <Button type="submit" className="w-full sm:w-auto">
          Submit venue
        </Button>
      </div>
    </form>
  );
}
