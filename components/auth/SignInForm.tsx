"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { migrateAnonymousStateIfPresent } from "@/lib/auth/clientMigration";
import { getAuthRedirectUrl } from "@/lib/auth/getAuthRedirectUrl";
import { createClient } from "@/lib/supabase/client";

function validateEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function getFriendlyAuthErrorMessage(initialError?: string) {
  if (!initialError) return "";

  const normalized = initialError.trim().toLowerCase();

  if (normalized === "test") {
    return "We couldn't complete that sign-in attempt. Request a fresh code and try again.";
  }

  if (normalized.includes("email link is invalid or has expired") || normalized.includes("otp_expired")) {
    return "This sign-in email expired before it could complete. Request a fresh sign-in email and use the link or code right away.";
  }

  return initialError;
}

type Step = "request" | "verify";

const OTP_LENGTH = (() => {
  const raw = Number(process.env.NEXT_PUBLIC_EMAIL_OTP_LENGTH ?? "6");
  if (Number.isFinite(raw) && raw >= 6 && raw <= 10) return raw;
  return 6;
})();

// Email-only OTP sign-in form used by /auth/sign-in.
export function SignInForm({
  initialError,
  initialNext,
  initialEmail,
  initialAutoRequest,
  allowCreateUser = false
}: {
  initialError?: string;
  initialNext?: string;
  initialEmail?: string;
  initialAutoRequest?: boolean;
  allowCreateUser?: boolean;
}) {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail?.trim() ?? "");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<Step>("request");
  const [status, setStatus] = useState<"idle" | "success" | "error">(initialError ? "error" : "idle");
  const [message, setMessage] = useState(getFriendlyAuthErrorMessage(initialError));
  const [submitting, setSubmitting] = useState(false);
  const autoRequestedRef = useRef(false);
  const next = initialNext && initialNext.startsWith("/") ? initialNext : "/me";

  async function requestCode(requestedEmail: string) {
    setSubmitting(true);
    setStatus("idle");
    setMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: requestedEmail.trim(),
      options: {
        shouldCreateUser: allowCreateUser,
        emailRedirectTo: `${getAuthRedirectUrl()}?next=${encodeURIComponent(next)}`
      }
    });

    if (error) {
      setStatus("error");
      if (!allowCreateUser) {
        setMessage("We couldn't find an account for that email. Use the email already tied to your Cup, or finish onboarding first.");
      } else {
        setMessage(error.message);
      }
      setSubmitting(false);
      return;
    }

    setStep("verify");
    setStatus("success");
    setMessage(`Use the email link or enter the ${OTP_LENGTH}-digit code to finish signing in.`);
    setSubmitting(false);
  }

  async function handleRequestCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await requestCode(email);
  }

  useEffect(() => {
    if (!initialAutoRequest || autoRequestedRef.current || step !== "request" || !validateEmail(email)) return;
    autoRequestedRef.current = true;
    void requestCode(email);
  }, [email, initialAutoRequest, step]);

  const otpPlaceholder = OTP_LENGTH === 6 ? "123456" : "12345678";

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
          {allowCreateUser
            ? "Anonymous browsing still works. This step creates or reconnects your Cup so your saved venues, watchlist, and membership sync across devices."
            : "Anonymous browsing still works. Signing in reconnects the Cup you already made, so your saved venues, watchlist, and membership sync across devices."}
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
          <span className="text-sm font-semibold text-deep">{OTP_LENGTH}-digit code</span>
          <input
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH))}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern={`[0-9]{${OTP_LENGTH}}`}
            required
            placeholder={otpPlaceholder}
            className="mt-2 h-12 w-full rounded-2xl border border-line bg-bg px-4 text-sm tracking-[0.3em] text-deep outline-none transition placeholder:tracking-normal placeholder:text-mist focus:border-gold focus:ring-2 focus:ring-gold/20"
          />
        </label>
      ) : null}

      <button
        type="submit"
        disabled={submitting || (step === "verify" && code.trim().length !== OTP_LENGTH)}
        className="inline-flex min-h-12 items-center justify-center rounded-full bg-gold px-5 text-sm font-semibold text-deep transition hover:bg-gold/90 disabled:opacity-60"
      >
        {submitting
          ? step === "request"
            ? "Sending code…"
            : "Verifying code…"
          : step === "request"
            ? "Email me a sign-in link or code"
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
