"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Clock3, Tag, Trophy, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type NotificationRecord = {
  id: string;
  kind: string;
  title: string;
  body: string;
  payload: Record<string, unknown> | null;
  createdAt: string;
  readAt: string | null;
};

type NotificationFeedProps = {
  take?: number;
  compact?: boolean;
  showSettingsLink?: boolean;
  onNavigate?: () => void;
};

type FilterKey = "all" | "match" | "promo" | "social";

function getHref(notification: NotificationRecord) {
  const href = notification.payload && typeof notification.payload.href === "string"
    ? notification.payload.href
    : null;
  return href || "/notifications";
}

function getFilter(kind: string): FilterKey {
  if (kind.startsWith("kickoff_") || kind === "match_day_digest") return "match";
  if (kind.includes("promo")) return "promo";
  if (kind.includes("friend") || kind.includes("invite") || kind.includes("rsvp")) return "social";
  return "all";
}

function formatRelativeTime(iso: string) {
  const date = new Date(iso);
  const delta = Date.now() - date.getTime();
  if (delta < 60_000) return "Just now";
  if (delta < 3_600_000) return `${Math.max(1, Math.round(delta / 60_000))}m ago`;
  if (delta < 86_400_000) return `${Math.max(1, Math.round(delta / 3_600_000))}h ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function NotificationKindIcon({ kind }: { kind: string }) {
  if (kind.startsWith("kickoff_") || kind === "match_day_digest") {
    return <Trophy className="h-4 w-4" />;
  }
  if (kind.includes("promo")) {
    return <Tag className="h-4 w-4" />;
  }
  if (kind.includes("friend") || kind.includes("invite") || kind.includes("rsvp")) {
    return <Users className="h-4 w-4" />;
  }
  return <Bell className="h-4 w-4" />;
}

async function fetchNotifications(cursor: string | null, take: number) {
  const params = new URLSearchParams({ take: String(take) });
  if (cursor) params.set("cursor", cursor);

  const response = await fetch(`/api/notifications?${params.toString()}`, {
    credentials: "include",
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Unable to load notifications");
  }

  return (await response.json()) as {
    notifications: NotificationRecord[];
    nextCursor: string | null;
  };
}

export function NotificationsFeed({
  take = 20,
  compact = false,
  showSettingsLink = false,
  onNavigate
}: NotificationFeedProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterKey>("all");

  useEffect(() => {
    let cancelled = false;

    const loadInitial = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchNotifications(null, take);
        if (cancelled) return;
        setNotifications(data.notifications);
        setNextCursor(data.nextCursor);
      } catch (nextError) {
        if (cancelled) return;
        setError(nextError instanceof Error ? nextError.message : "Unable to load notifications.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadInitial();
    return () => {
      cancelled = true;
    };
  }, [take]);

  const visibleNotifications = useMemo(() => {
    if (filter === "all") return notifications;
    return notifications.filter((notification) => getFilter(notification.kind) === filter);
  }, [filter, notifications]);

  async function loadMore() {
    if (!nextCursor) return;
    setLoadingMore(true);
    try {
      const data = await fetchNotifications(nextCursor, take);
      setNotifications((current) => [...current, ...data.notifications]);
      setNextCursor(data.nextCursor);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unable to load notifications.");
    } finally {
      setLoadingMore(false);
    }
  }

  async function markRead(ids: string[]) {
    if (!ids.length) return;
    await fetch("/api/notifications/mark-read", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids })
    });
    setNotifications((current) =>
      current.map((notification) =>
        ids.includes(notification.id)
          ? { ...notification, readAt: notification.readAt ?? new Date().toISOString() }
          : notification
      )
    );
  }

  async function markAllRead() {
    setMarkingAll(true);
    try {
      await fetch("/api/notifications/mark-read", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true })
      });
      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          readAt: notification.readAt ?? new Date().toISOString()
        }))
      );
    } finally {
      setMarkingAll(false);
    }
  }

  async function openNotification(notification: NotificationRecord) {
    if (!notification.readAt) {
      await markRead([notification.id]);
    }
    onNavigate?.();
    router.push(getHref(notification));
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[color:var(--border-subtle)] px-4 py-3">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--fg-muted)]">Inbox</div>
          <div className="mt-1 text-sm text-[color:var(--fg-secondary)]">Live match alerts, promos, and your saved updates.</div>
        </div>
        <button
          type="button"
          onClick={() => void markAllRead()}
          disabled={markingAll || notifications.every((notification) => notification.readAt)}
          className="inline-flex min-h-10 items-center rounded-full border border-[color:var(--border-subtle)] px-4 text-sm font-semibold text-[color:var(--fg-primary)] transition hover:bg-[var(--bg-surface-elevated)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {markingAll ? "Marking..." : "Mark all read"}
        </button>
      </div>

      {!compact ? (
        <div className="flex flex-wrap gap-2 border-b border-[color:var(--border-subtle)] px-4 py-3">
          {([
            ["all", "All"],
            ["match", "Match alerts"],
            ["promo", "Promos"],
            ["social", "Social"]
          ] as const).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`inline-flex min-h-10 items-center rounded-full border px-4 text-sm font-semibold transition ${
                filter === key
                  ? "border-gold bg-gold/10 text-gold"
                  : "border-[color:var(--border-subtle)] text-[color:var(--fg-secondary)] hover:bg-[var(--bg-surface-elevated)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      ) : null}

      <div className="min-h-0 flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex h-full min-h-[14rem] items-center justify-center text-sm text-[color:var(--fg-secondary)]">
            Loading notifications...
          </div>
        ) : error ? (
          <div className="flex h-full min-h-[14rem] items-center justify-center px-6 text-center text-sm text-[color:var(--fg-secondary)]">
            {error}
          </div>
        ) : visibleNotifications.length ? (
          <div className="divide-y divide-[color:var(--border-subtle)]">
            {visibleNotifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                onClick={() => void openNotification(notification)}
                className="flex w-full items-start gap-3 px-4 py-4 text-left transition hover:bg-[var(--bg-surface-elevated)]"
              >
                <div className="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft-bg)] text-[color:var(--accent-soft-fg)]">
                  <NotificationKindIcon kind={notification.kind} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-sm font-semibold text-[color:var(--fg-primary)]">
                      {notification.title}
                    </div>
                    {!notification.readAt ? (
                      <span className="mt-1 inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-gold" />
                    ) : null}
                  </div>
                  <div className="mt-1 line-clamp-2 text-sm leading-6 text-[color:var(--fg-secondary)]">
                    {notification.body}
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1 text-xs text-[color:var(--fg-muted)]">
                    <Clock3 className="h-3.5 w-3.5" />
                    {formatRelativeTime(notification.createdAt)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex h-full min-h-[14rem] flex-col items-center justify-center gap-3 px-6 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent-soft-bg)] text-[color:var(--accent-soft-fg)]">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <div className="text-base font-semibold text-[color:var(--fg-primary)]">No notifications yet</div>
              <div className="mt-1 text-sm text-[color:var(--fg-secondary)]">
                Kickoff reminders, promos, and saved updates will show up here first.
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[color:var(--border-subtle)] px-4 py-3">
        <div className="flex items-center gap-2">
          {nextCursor ? (
            <button
              type="button"
              onClick={() => void loadMore()}
              disabled={loadingMore}
              className="inline-flex min-h-10 items-center rounded-full border border-[color:var(--border-subtle)] px-4 text-sm font-semibold text-[color:var(--fg-primary)] transition hover:bg-[var(--bg-surface-elevated)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loadingMore ? "Loading..." : "Load more"}
            </button>
          ) : null}
        </div>
        {showSettingsLink ? (
          <Link
            href="/account/notifications"
            onClick={onNavigate}
            className="inline-flex min-h-10 items-center text-sm font-semibold text-gold"
          >
            Notification settings →
          </Link>
        ) : null}
      </div>
    </div>
  );
}
