"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

function validateEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function EmailCaptureBanner() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  function handleNotify() {
    const trimmed = email.trim();

    if (trimmed.length > 0 && !validateEmail(trimmed)) {
      setError("Enter a valid email to get alerts.");
      return;
    }

    setError("");

    const params = new URLSearchParams({
      next: "/me",
      create: "1"
    });

    if (trimmed) {
      params.set("email", trimmed);
      params.set("send", "1");
    }

    router.push(`/auth/sign-in?${params.toString()}`);
  }

  return (
    <div className="rounded-2xl bg-gold px-4 py-4 text-deep">
      <form
        className="flex flex-col gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          handleNotify();
        }}
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="text-sm font-semibold">📬 Get match alerts — enter your email</div>
          <div className="flex flex-1 gap-2">
            <label htmlFor="home-email-capture" className="sr-only">
              Email for match alerts
            </label>
            <input
              id="home-email-capture"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (error) setError("");
              }}
              placeholder="your@email.com"
              className="h-11 flex-1 rounded-full bg-white px-4 text-sm outline-none"
            />
            <button
              className="rounded-full bg-deep px-4 py-2 text-sm font-bold text-[color:var(--fg-on-strong)]"
              type="submit"
            >
              Notify Me
            </button>
          </div>
        </div>
        {error ? <div className="text-sm font-medium text-[color:var(--red)]">{error}</div> : null}
        {!error ? (
          <div className="text-xs font-medium text-deep/80">
            We&apos;ll send you into a quick sign-in so alerts and your Cup stay synced.
          </div>
        ) : null}
      </form>
    </div>
  );
}
