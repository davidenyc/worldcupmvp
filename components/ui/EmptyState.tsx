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
    <div className="flex flex-col items-center justify-center rounded-3xl border border-[#d8e3f5] bg-white/90 px-6 py-10 text-center dark:border-white/10 dark:bg-white/5">
      <div className="text-5xl">{emoji}</div>
      <div className="mt-4 text-xl font-semibold text-[#0a1628] dark:text-white">{title}</div>
      {subtitle ? <div className="mt-2 max-w-md text-sm text-[#0a1628]/60 dark:text-white/60">{subtitle}</div> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
