// Activity timeline section for /me showing the user's latest saved, followed, watched, and redeemed actions.
"use client";

import Link from "next/link";

import type { UserActivityEntry } from "@/lib/store/user";

export function MyActivityTimeline({
  activity
}: {
  activity: UserActivityEntry[];
}) {
  return (
    <section className="surface p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-mist">Activity</div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-deep">Your match-day timeline</h2>
          <p className="mt-2 text-sm text-mist">Saved venues, followed countries, and redeemed promos show up here in real time.</p>
        </div>
      </div>

      <div className="mt-5">
        {activity.length ? (
          <div className="grid gap-3">
            {activity.slice(0, 10).map((entry) => (
              <div key={`${entry.kind}-${entry.at}-${entry.label}`} className="rounded-2xl border border-line bg-surface-2 p-4">
                <div className="text-sm font-semibold text-deep">{entry.label}</div>
                <div className="mt-1 text-xs uppercase tracking-[0.16em] text-mist">
                  {new Date(entry.at).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit"
                  })}
                </div>
                {entry.href ? (
                  <Link
                    href={entry.href}
                    className="mt-3 inline-flex min-h-10 items-center rounded-full border border-line bg-surface px-4 text-sm font-semibold text-deep transition hover:bg-surface-2"
                  >
                    Open →
                  </Link>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-line bg-surface-2 p-5 text-sm text-mist">
            No activity yet. Save a venue, follow a country, or claim a promo and your timeline will start to fill in.
          </div>
        )}
      </div>
    </section>
  );
}
