"use client";

import { X } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";

import { NotificationsFeed } from "@/components/notifications/NotificationsFeed";

type NotificationDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function NotificationDrawer({ open, onOpenChange }: NotificationDrawerProps) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onOpenChange, open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <>
      <button
        type="button"
        aria-label="Close notifications"
        className="fixed inset-0 z-[85] bg-black/30"
        onClick={() => onOpenChange(false)}
      />
      <aside className="fixed inset-x-0 bottom-0 z-[90] flex h-[min(82vh,38rem)] flex-col rounded-t-[1.75rem] border border-[color:var(--border-subtle)] bg-[var(--bg-surface)] shadow-popover sm:inset-y-0 sm:right-0 sm:left-auto sm:h-auto sm:w-[min(28rem,92vw)] sm:rounded-none sm:rounded-l-[1.75rem]">
        <div className="flex items-center justify-between border-b border-[color:var(--border-subtle)] px-4 py-4">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--fg-muted)]">Notifications</div>
            <div className="mt-1 text-lg font-semibold text-[color:var(--fg-primary)]">Your inbox</div>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Close"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--border-subtle)] text-[color:var(--fg-primary)] transition hover:bg-[var(--bg-surface-elevated)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <NotificationsFeed compact showSettingsLink onNavigate={() => onOpenChange(false)} />
      </aside>
    </>,
    document.body
  );
}
