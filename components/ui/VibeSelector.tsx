"use client";

const vibes = ["lively", "chill", "family", "rowdy", "mixed"] as const;

export function VibeSelector({
  value,
  onChange
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {vibes.map((vibe) => {
        const active = value === vibe;
        return (
          <button
            key={vibe}
            type="button"
            onClick={() => onChange(vibe)}
            className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition ${
              active
                ? "border-[#f4b942] bg-[#f4b942] text-[#0a1628]"
                : "border-[#d8e3f5] bg-white text-[#0a1628]"
            }`}
          >
            {vibe.charAt(0).toUpperCase() + vibe.slice(1)}
          </button>
        );
      })}
    </div>
  );
}
