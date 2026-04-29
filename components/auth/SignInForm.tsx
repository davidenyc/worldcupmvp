"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { migrateAnonymousStateIfPresent } from "@/lib/auth/clientMigration";
import { createClient } from "@/lib/supabase/client";

function getFriendlyAuthErrorMessage(initialError?: string) {
  if (!initialError) return "";

  const normalized = initialError.trim().toLowerCase();

  if (normalized === "test") {
    return "We couldn't complete that sign-in attempt. Request a fresh code and try again.";
  }

  if (normalized.includes("email link is invalid or has expired") || normalized.includes("otp_expired")) {
    return "This sign-in email expired before it could complete. Request a fresh 8-digit code and enter it right away.";
  }

  return initialError;
}

type Step = "request" | "verify";

// Email-only OTP sign-in form used by /auth/sign-in.
export function SignInForm({
  initialError,
  initialNext
}: {
  initialError?: string;
  initialNext?: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<Step>("request");
  const [status, setStatus] = useState<"idle" | "success" | "error">(initialError ? "error" : "idle");
  const [message, setMessage] = useState(getFriendlyAuthErrorMessage(initialError));
  const [submitting, setSubmitting] = useState(false);
  const next = initialNext && initialNext.startsWith("/") ? initialNext : "/me";

  async function handleRequestCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setStatus("idle");
    setMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim()
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
      setSubmitting(false);
      return;
    }

    setStep("verify");
    setStatus("success");
    setMessage("Enter the 8-digit code from your email to finish signing in.");
    setSubmitting(false);
  }

  async function handleVerifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setStatus("idle");
    setMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: code.trim(),
      type: "email"
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
      setSubmitting(false);
      return;
    }

    try {
      await migrateAnonymousStateIfPresent();
    } catch (migrationError) {
      setStatus("error");
      setMessage(migrationError instanceof Error ? migrationError.message : "We couldn't migrate your local Cup yet.");
      setSubmitting(false);
      return;
    }

    setStatus("success");
    setMessage("Signed in. Taking you back to your Cup…");
    setSubmitting(false);
    router.replace(next);
    router.refresh();
  }

  return (
    <form
      onSubmit={step === "request" ? handleRequestCode : handleVerifyCode}
      className="mx-auto flex w-full max-w-md flex-col gap-4 rounded-[1.75rem] border border-line bg-surface p-6 shadow-card"
    >
      <div>
        <div className="text-xs uppercase tracking-[0.18em] text-mist">
          {step === "request" ? "Email code" : "Verify code"}
        </div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-deep">Sign in to sync your Cup.</h1>
        <p className="mt-2 text-sm leading-6 text-mist">
          Anonymous browsing still works. Signing in just unlocks cross-device sync for your saved venues, watchlist,
          and membership.
        </p>
      </div>

      <label className="block">
        <span className="text-sm font-semibold text-deep">Email</span>
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          disabled={step === "verify"}
          placeholder="fan@example.com"
          className="mt-2 h-12 w-full rounded-2xl border border-line bg-bg px-4 text-sm text-deep outline-none transition placeholder:text-mist focus:border-gold focus:ring-2 focus:ring-gold/20 disabled:cursor-not-allowed disabled:opacity-70"
        />
      </label>

      {step === "verify" ? (
        <label className="block">
          <span className="text-sm font-semibold text-deep">8-digit code</span>
          <input
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 8))}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{8}"
            required
            placeholder="12345678"
            className="mt-2 h-12 w-full rounded-2xl border border-line bg-bg px-4 text-sm tracking-[0.3em] text-deep outline-none transition placeholder:tracking-normal placeholder:text-mist focus:border-gold focus:ring-2 focus:ring-gold/20"
          />
        </label>
      ) : null}

      <button
        type="submit"
        disabled={submitting || (step === "verify" && code.trim().length !== 8)}
        className="inline-flex min-h-12 items-center justify-center rounded-full bg-gold px-5 text-sm font-semibold text-deep transition hover:bg-gold/90 disabled:opacity-60"
      >
        {submitting
          ? step === "request"
            ? "Sending code…"
            : "Verifying code…"
          : step === "request"
            ? "Email me an 8-digit code"
            : "Verify code"}
      </button>

      {step === "verify" ? (
        <button
          type="button"
          onClick={() => {
            setStep("request");
            setCode("");
            setStatus("idle");
            setMessage("");
          }}
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-line bg-bg px-5 text-sm font-semibold text-deep transition hover:bg-surface-2"
        >
          Use a different email
        </button>
      ) : null}

      {status === "success" ? <p className="text-sm font-medium text-deep">{message}</p> : null}
      {status === "error" ? <p className="text-sm font-medium text-red">{message}</p> : null}
    </form>
  );
}
