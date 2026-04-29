"use client";

import { useMemo, useState } from "react";

export function StarRating({
  value,
  max = 5,
  onChange,
  readonly = false
}: {
  value: number;
  max?: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
}) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const displayValue = hoverValue ?? value;
  const stars = useMemo(() => Array.from({ length: max }, (_, index) => index + 1), [max]);

  return (
    <div className="flex items-center gap-1">
      {stars.map((star) => {
        const filled = displayValue >= star;
        const half = !filled && displayValue >= star - 0.5;

        return (
          <button
            key={star}
            type="button"
            disabled={readonly || !onChange}
            onMouseEnter={() => !readonly && setHoverValue(star)}
            onMouseLeave={() => !readonly && setHoverValue(null)}
            onClick={() => onChange?.(star)}
            className={`text-2xl leading-none ${readonly ? "cursor-default" : "cursor-pointer"}`}
          >
            <span className={filled ? "text-gold" : half ? "text-gold" : "text-gray-300"}>★</span>
          </button>
        );
      })}
    </div>
  );
}
