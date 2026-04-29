import type { ReactNode } from "react";

export function EmptyState({
  emoji,
  title,
  subtitle,
  action
}: {
  emoji: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-line bg-white/90 px-6 py-10 text-center dark:border-line dark:bg-white/5">
      <div className="text-5xl">{emoji}</div>
      <div className="mt-4 text-xl font-semibold text-deep dark:text-[color:var(--fg-on-strong)]">{title}</div>
      {subtitle ? <div className="mt-2 max-w-md text-sm text-[color:var(--fg-secondary)] dark:text-[color:var(--fg-secondary-on-strong)]">{subtitle}</div> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
