"use client";

import { useState } from "react";

export function EmailCaptureBanner() {
  const [email, setEmail] = useState("");

  return (
    <div className="rounded-2xl bg-gold px-4 py-4 text-deep">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="text-sm font-semibold">📬 Get match alerts — enter your email</div>
        <div className="flex flex-1 gap-2">
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="your@email.com"
            className="h-11 flex-1 rounded-full bg-white px-4 text-sm outline-none"
          />
          <button className="rounded-full bg-deep px-4 py-2 text-sm font-bold text-[color:var(--fg-on-strong)]" type="button">
            Notify Me
          </button>
        </div>
      </div>
    </div>
  );
}
