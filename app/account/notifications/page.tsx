"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type NotificationPrefs = {
  channels: {
    push: boolean;
    email: boolean;
    in_app: boolean;
  };
  perKind: Record<
    string,
    {
      push: boolean;
      email: boolean;
    }
  >;
};

const DEFAULT_PREFS: NotificationPrefs = {
  channels: {
    push: true,
    email: true,
    in_app: true
  },
  perKind: {
    kickoff_1h: { push: true, email: false },
    kickoff_30m: { push: true, email: false },
    match_day_digest: { push: false, email: true },
    promo_expiring: { push: true, email: true },
    friend_request_received: { push: true, email: true },
    watch_party_invite: { push: true, email: true },
    watch_party_rsvp: { push: true, email: false },
    new_promo_at_saved: { push: true, email: false }
  }
};

const KIND_META: Array<{ kind: keyof NotificationPrefs["perKind"]; label: string; hint: string }> = [
  { kind: "kickoff_1h", label: "Kickoff 1 hour out", hint: "Your early match-night reminder." },
  { kind: "kickoff_30m", label: "Kickoff 30 minutes out", hint: "The urgent heads-up to leave now." },
  { kind: "match_day_digest", label: "Match-day morning digest", hint: "A morning summary of your watched slate." },
  { kind: "promo_expiring", label: "Promo expiring soon", hint: "Last-call offers worth using before they vanish." },
  { kind: "friend_request_received", label: "Friend request received", hint: "Ready for the social sprint source." },
  { kind: "watch_party_invite", label: "Watch-party invite", hint: "Ready for the social sprint source." },
  { kind: "watch_party_rsvp", label: "Watch-party RSVP", hint: "Ready for the social sprint source." },
  { kind: "new_promo_at_saved", label: "New promo at a saved venue", hint: "When a favorite spot posts a new offer." }
];

function mergePrefs(input: unknown): NotificationPrefs {
  const source = (input && typeof input === "object" ? input : {}) as Partial<NotificationPrefs>;
  const sourceChannels = (source.channels ?? {}) as Partial<NotificationPrefs["channels"]>;
  const sourcePerKind = source.perKind ?? {};

  return {
    channels: {
      push: sourceChannels.push ?? DEFAULT_PREFS.channels.push,
      email: sourceChannels.email ?? DEFAULT_PREFS.channels.email,
      in_app: sourceChannels.in_app ?? DEFAULT_PREFS.channels.in_app
    },
    perKind: Object.fromEntries(
      KIND_META.map(({ kind }) => [
        kind,
        {
          push: sourcePerKind[kind]?.push ?? DEFAULT_PREFS.perKind[kind].push,
          email: sourcePerKind[kind]?.email ?? DEFAULT_PREFS.perKind[kind].email
        }
      ])
    )
  };
}

function ChannelToggle({
  checked,
  onToggle,
  disabled = false
}: {
  checked: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={onToggle}
      className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${
        disabled
          ? "cursor-not-allowed bg-[color:var(--border-subtle)] opacity-60"
          : checked
            ? "bg-gold"
            : "bg-[color:var(--border-subtle)]"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 rounded-full bg-white shadow transition ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

export default function AccountNotificationsPage() {
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadPrefs = async () => {
      try {
        const response = await fetch("/api/me", {
          credentials: "include",
          cache: "no-store"
        });
        if (!response.ok) {
          throw new Error("Unable to load your notification settings.");
        }
        const data = (await response.json()) as { profile?: { notificationPrefs?: unknown } };
        if (!cancelled) {
          setPrefs(mergePrefs(data.profile?.notificationPrefs));
        }
      } catch (error) {
        if (!cancelled) {
          setStatus(error instanceof Error ? error.message : "Unable to load your notification settings.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadPrefs();
    return () => {
      cancelled = true;
    };
  }, []);

  const summary = useMemo(() => {
    const enabledKinds = KIND_META.filter(({ kind }) => prefs.perKind[kind].push || prefs.perKind[kind].email).length;
    return `${enabledKinds} alert types active`;
  }, [prefs]);

  async function persist(nextPrefs: NotificationPrefs) {
    setPrefs(nextPrefs);
    setSaving(true);
    setStatus(null);

    try {
      const response = await fetch("/api/me", {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ notificationPrefs: nextPrefs })
      });

      if (!response.ok) {
        throw new Error("Unable to save notification settings.");
      }

      setStatus("Saved.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to save notification settings.");
    } finally {
      setSaving(false);
    }
  }

  function updateChannel(channel: keyof NotificationPrefs["channels"]) {
    const nextPrefs: NotificationPrefs = {
      ...prefs,
      channels: {
        ...prefs.channels,
        [channel]: !prefs.channels[channel]
      }
    };
    void persist(nextPrefs);
  }

  function updateKind(kind: keyof NotificationPrefs["perKind"], channel: "push" | "email") {
    const nextPrefs: NotificationPrefs = {
      ...prefs,
      perKind: {
        ...prefs.perKind,
        [kind]: {
          ...prefs.perKind[kind],
          [channel]: !prefs.perKind[kind][channel]
        }
      }
    };
    void persist(nextPrefs);
  }

  async function sendTestNotification() {
    setTesting(true);
    setStatus(null);

    try {
      const response = await fetch("/api/notifications/test", {
        method: "POST",
        credentials: "include"
      });
      if (!response.ok) {
        throw new Error("Test notification failed.");
      }
      setStatus("Test notification sent.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Test notification failed.");
    } finally {
      setTesting(false);
    }
  }

  return (
    <main className="min-h-[100dvh] bg-bg px-4 py-8 sm:px-6 lg:px-8">
      <div className="container-shell max-w-5xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-mist">Account</div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-deep">Notification settings</h1>
            <div className="mt-2 text-sm text-mist">{summary}</div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void sendTestNotification()}
              disabled={testing}
              className="inline-flex min-h-11 items-center rounded-full bg-gold px-5 text-sm font-semibold text-deep disabled:cursor-not-allowed disabled:opacity-70"
            >
              {testing ? "Sending..." : "Test notification"}
            </button>
            <Link
              href="/notifications"
              className="inline-flex min-h-11 items-center rounded-full border border-line bg-surface px-5 text-sm font-semibold text-deep transition hover:bg-surface-2"
            >
              Open inbox →
            </Link>
          </div>
        </div>

        <section className="rounded-[1.75rem] border border-line bg-surface p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-lg font-semibold text-deep">Channel defaults</div>
              <div className="mt-1 text-sm text-mist">Choose where your alerts can reach you first.</div>
            </div>
            {saving ? <div className="text-sm text-mist">Saving…</div> : null}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-3xl border border-line bg-surface-2 p-4">
              <div className="text-sm font-semibold text-deep">Push</div>
              <div className="mt-1 text-sm text-mist">Heads-up alerts before match time.</div>
              <div className="mt-4">
                <ChannelToggle checked={prefs.channels.push} onToggle={() => updateChannel("push")} disabled={loading} />
              </div>
            </div>
            <div className="rounded-3xl border border-line bg-surface-2 p-4">
              <div className="text-sm font-semibold text-deep">Email</div>
              <div className="mt-1 text-sm text-mist">Digest and promo messages in your inbox.</div>
              <div className="mt-4">
                <ChannelToggle checked={prefs.channels.email} onToggle={() => updateChannel("email")} disabled={loading} />
              </div>
            </div>
            <div className="rounded-3xl border border-line bg-surface-2 p-4">
              <div className="text-sm font-semibold text-deep">In-app</div>
              <div className="mt-1 text-sm text-mist">Keep everything waiting in the bell and inbox.</div>
              <div className="mt-4">
                <ChannelToggle checked={prefs.channels.in_app} onToggle={() => updateChannel("in_app")} disabled={loading} />
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-line bg-surface p-6 shadow-sm">
          <div className="text-lg font-semibold text-deep">Per-alert controls</div>
          <div className="mt-1 text-sm text-mist">Fine-tune which alert types should use push or email.</div>

          <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-line">
            <div className="grid grid-cols-[minmax(0,1fr)_5rem_5rem] border-b border-line bg-surface-2 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-mist">
              <div>Alert type</div>
              <div className="text-center">Push</div>
              <div className="text-center">Email</div>
            </div>
            <div className="divide-y divide-line">
              {KIND_META.map(({ kind, label, hint }) => (
                <div key={kind} className="grid grid-cols-[minmax(0,1fr)_5rem_5rem] items-center gap-3 px-4 py-4">
                  <div>
                    <div className="text-sm font-semibold text-deep">{label}</div>
                    <div className="mt-1 text-sm text-mist">{hint}</div>
                  </div>
                  <div className="flex justify-center">
                    <ChannelToggle
                      checked={prefs.perKind[kind].push}
                      onToggle={() => updateKind(kind, "push")}
                      disabled={loading || !prefs.channels.push}
                    />
                  </div>
                  <div className="flex justify-center">
                    <ChannelToggle
                      checked={prefs.perKind[kind].email}
                      onToggle={() => updateKind(kind, "email")}
                      disabled={loading || !prefs.channels.email}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {status ? (
          <div className="rounded-3xl border border-line bg-surface px-5 py-4 text-sm text-mist">
            {status}
          </div>
        ) : null}
      </div>
    </main>
  );
}
