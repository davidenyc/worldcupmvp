"use client";

import { FormEvent, useEffect, useState } from "react";

const SESSION_KEY = "gameday-admin-authenticated";
const PASSWORD = "gameday2026";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setAuthenticated(window.sessionStorage.getItem(SESSION_KEY) === "1");
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password === PASSWORD) {
      window.sessionStorage.setItem(SESSION_KEY, "1");
      setAuthenticated(true);
      setError("");
      setPassword("");
      return;
    }

    setError("Incorrect password");
  }

  if (authenticated) {
    return (
      <main className="min-h-[100dvh] bg-bg px-4 py-10 sm:px-6 lg:px-8">
        <div className="container-shell max-w-3xl rounded-[2rem] bg-surface p-8 shadow-sm ring-1 ring-line">
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--ink-45)]">
            Admin
          </div>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-deep">
            Admin panel — coming soon
          </h1>
          <p className="mt-4 text-sm leading-7 text-[color:var(--fg-secondary)]">
            This route is protected for reviewer safety. The real admin tools can stay hidden until full authentication is implemented.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[100dvh] bg-bg px-4 py-10 sm:px-6 lg:px-8">
      <div className="container-shell max-w-md rounded-[2rem] bg-surface p-8 shadow-sm ring-1 ring-line">
        <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--ink-45)]">
          Admin Access
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-deep">
          Sign in to continue
        </h1>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter admin password"
            className="h-12 w-full rounded-2xl border border-line bg-surface px-4 text-sm text-deep outline-none ring-gold focus:ring-2"
          />
          {error ? <div className="text-sm font-semibold text-red-600">{error}</div> : null}
          <button
            type="submit"
            className="inline-flex w-full justify-center rounded-full bg-deep px-5 py-3 text-sm font-bold text-[color:var(--fg-on-strong)]"
          >
            Sign in
          </button>
        </form>
      </div>
    </main>
  );
}
