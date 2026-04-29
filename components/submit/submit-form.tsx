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
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormValues>();

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
    <form onSubmit={handleSubmit(onSubmit, () => setStatus("error"))} noValidate className="surface-strong p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold text-deep">Venue name</span>
          <Input
            placeholder="e.g. The Churchill Tavern"
            aria-label="Venue name"
            className={[
              "mt-2 placeholder:text-ink/45 dark:placeholder:text-white/40",
              errors.name ? "border-red-500 focus:border-red-500" : ""
            ].join(" ")}
            {...register("name", {
              required: "Enter the venue name.",
              minLength: { value: 2, message: "Venue name must be at least 2 characters." },
              maxLength: { value: 120, message: "Venue name must be 120 characters or fewer." }
            })}
          />
          {errors.name ? <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p> : null}
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-deep">Address</span>
          <Input
            placeholder="e.g. 45 E 18th St, New York, NY"
            aria-label="Address"
            className={[
              "mt-2 placeholder:text-ink/45 dark:placeholder:text-white/40",
              errors.address ? "border-red-500 focus:border-red-500" : ""
            ].join(" ")}
            {...register("address", {
              required: "Enter the venue address.",
              minLength: { value: 5, message: "Address must be at least 5 characters." },
              maxLength: { value: 180, message: "Address must be 180 characters or fewer." }
            })}
          />
          {errors.address ? <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.address.message}</p> : null}
        </label>
        <label className="block md:col-span-2">
          <span className="text-sm font-semibold text-deep">Country association</span>
          <Input
            list="submit-country-associations"
            placeholder="e.g. Mexico"
            aria-label="Country association"
            className={[
              "mt-2 placeholder:text-ink/45 dark:placeholder:text-white/40",
              errors.countryAssociation ? "border-red-500 focus:border-red-500" : ""
            ].join(" ")}
            {...register("countryAssociation", {
              required: "Add the country this venue is known for.",
              minLength: { value: 2, message: "Country association must be at least 2 characters." },
              maxLength: { value: 80, message: "Country association must be 80 characters or fewer." }
            })}
          />
          <datalist id="submit-country-associations">
            {COUNTRY_OPTIONS.map((country) => (
              <option key={country} value={country} />
            ))}
          </datalist>
          <p className="mt-2 text-sm text-mist">
            Type the country whose fans gather here (e.g. Mexico, USA, Argentina).
          </p>
          {errors.countryAssociation ? (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.countryAssociation.message}</p>
          ) : null}
        </label>
        <label className="block md:col-span-2">
          <span className="text-sm font-semibold text-deep">Notes</span>
          <textarea
            className={[
              "mt-2 min-h-[160px] w-full rounded-3xl border border-line bg-white px-4 py-3 text-sm text-ink placeholder:text-ink/45 focus:border-accent focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/40",
              errors.notes ? "border-red-500 focus:border-red-500" : ""
            ].join(" ")}
            placeholder="Notes on the crowd, TVs, energy, or why this place matters on match day."
            aria-label="Notes"
            {...register("notes", {
              required: "Tell us why this venue matters on match day.",
              minLength: { value: 20, message: "Notes must be at least 20 characters." },
              maxLength: { value: 600, message: "Notes must be 600 characters or fewer." }
            })}
          />
          {errors.notes ? <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.notes.message}</p> : null}
        </label>
        <label className="block md:col-span-2">
          <span className="text-sm font-semibold text-deep">Email</span>
          <Input
            placeholder="you@example.com"
            type="email"
            aria-label="Email"
            className={[
              "mt-2 placeholder:text-ink/45 dark:placeholder:text-white/40",
              errors.email ? "border-red-500 focus:border-red-500" : ""
            ].join(" ")}
            {...register("email", {
              required: "Add your email so we can follow up if needed.",
              maxLength: { value: 120, message: "Email must be 120 characters or fewer." },
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Enter a valid email address."
              }
            })}
          />
          {errors.email ? <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p> : null}
        </label>
      </div>

      {status === "success" ? (
        <div className="mt-4 rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
          Thanks. Your venue suggestion was captured for review.
        </div>
      ) : null}

      {status === "error" && !Object.keys(errors).length ? (
        <div className="mt-4 rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
          A few details still need attention. Check the highlighted fields and try again.
        </div>
      ) : null}

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-mist">We&apos;ll review within 48 hours.</p>
        <Button type="submit" className="w-full bg-gold text-[color:var(--fg-on-accent)] hover:bg-gold/90 sm:w-auto">
          Submit venue
        </Button>
      </div>
    </form>
  );
}
