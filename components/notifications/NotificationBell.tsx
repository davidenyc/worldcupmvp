"use client";

import { Bell } from "lucide-react";
import { useEffect, useState } from "react";

type NotificationBellProps = {
  className?: string;
  onClick?: () => void;
};

export function NotificationBell({ className, onClick }: NotificationBellProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadUnreadCount = async () => {
      try {
        const response = await fetch("/api/notifications/unread-count", {
          credentials: "include",
          cache: "no-store"
        });

        if (!response.ok) return;

        const data = (await response.json()) as { count?: number };
        if (!cancelled) {
          setCount(Math.max(0, Number(data.count ?? 0)));
        }
      } catch {
        // Keep the bell quiet if notifications are unavailable.
      }
    };

    void loadUnreadCount();
    const interval = window.setInterval(() => {
      void loadUnreadCount();
    }, 30_000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={count > 0 ? `${count} unread notifications` : "Notifications"}
      className={className}
    >
      <span className="relative inline-flex">
        <Bell className="h-4 w-4" />
        {count > 0 ? (
          <span className="absolute -right-2 -top-2 inline-flex min-w-[1.15rem] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold leading-none text-white">
            {count > 9 ? "9+" : count}
          </span>
        ) : null}
      </span>
    </button>
  );
}
