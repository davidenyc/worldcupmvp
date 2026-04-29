"use client";

import { FormEvent, useState } from "react";

import { getAuthRedirectUrl } from "@/lib/auth/getAuthRedirectUrl";
import { createClient } from "@/lib/supabase/client";

// Email-only magic-link sign-in form used by /auth/sign-in.
export function SignInForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setStatus("idle");
    setMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: getAuthRedirectUrl()
      }
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
      setSubmitting(false);
      return;
    }

    setStatus("success");
    setMessage("Check your email for the magic link.");
    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex w-full max-w-md flex-col gap-4 rounded-[1.75rem] border border-line bg-surface p-6 shadow-card">
      <div>
        <div className="text-xs uppercase tracking-[0.18em] text-mist">Magic link</div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-deep">Sign in to sync your Cup.</h1>
        <p className="mt-2 text-sm leading-6 text-mist">
          Anonymous browsing still works. Signing in just unlocks cross-device sync for your saved venues, watchlist, and membership.
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
          placeholder="fan@example.com"
          className="mt-2 h-12 w-full rounded-2xl border border-line bg-bg px-4 text-sm text-deep outline-none transition placeholder:text-mist focus:border-gold focus:ring-2 focus:ring-gold/20"
        />
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex min-h-12 items-center justify-center rounded-full bg-gold px-5 text-sm font-semibold text-deep transition hover:bg-gold/90 disabled:opacity-60"
      >
        {submitting ? "Sending link…" : "Send me a magic link"}
      </button>

      {status === "success" ? <p className="text-sm font-medium text-deep">{message}</p> : null}
      {status === "error" ? <p className="text-sm font-medium text-red">{message}</p> : null}
    </form>
  );
}
