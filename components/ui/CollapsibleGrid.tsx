"use client";

import { Children, ReactNode, useState } from "react";

interface CollapsibleGridProps {
  children: ReactNode;
  initialCount?: number;
  /**
   * Singular noun used in the expand button (e.g. "city", "country").
   * Default: "item".
   */
  noun?: string;
  /**
   * Plural form of `noun` if it's not a simple +"s" pluralization.
   * Default: `${noun}s`.
   */
  nounPlural?: string;
  collapseLabel?: string;
}

/**
 * Wraps a list of children and shows only the first `initialCount` until the
 * user clicks "Show N more". Designed to live inside a parent `grid` so the
 * "Show more" button spans full width via `col-span-full`.
 *
 * IMPORTANT: this is a `"use client"` component, which means props passed in
 * from a server component MUST be serializable (strings, numbers, plain
 * objects, JSX). Function props will throw at runtime. That's why we take a
 * `noun` string instead of an `expandLabel` callback — server components in
 * Next.js can pass strings safely.
 */
export function CollapsibleGrid({
  children,
  initialCount = 8,
  noun = "item",
  nounPlural,
  collapseLabel = "Show fewer ↑"
}: CollapsibleGridProps) {
  const [expanded, setExpanded] = useState(false);
  // React.Children.toArray works whether children is an array, a single node,
  // or a fragment — so the parent can pass `{items.map(...)}` directly.
  const all = Children.toArray(children);
  const total = all.length;
  const visible = expanded ? all : all.slice(0, initialCount);
  const remaining = total - initialCount;
  const pluralNoun = nounPlural ?? `${noun}s`;
  const expandLabel = `Show ${remaining} more ${remaining === 1 ? noun : pluralNoun} →`;

  return (
    <>
      {visible}
      {total > initialCount ? (
        <div className="col-span-full mt-2 flex justify-center">
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="inline-flex h-10 items-center justify-center rounded-full border border-line bg-surface px-5 text-sm font-semibold text-deep transition hover:bg-surface-2"
          >
            {expanded ? collapseLabel : expandLabel}
          </button>
        </div>
      ) : null}
    </>
  );
}
