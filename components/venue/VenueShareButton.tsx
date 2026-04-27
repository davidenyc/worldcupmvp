"use client";

import { useState } from "react";

export function VenueShareButton({
  venueName,
  countryName,
  url
}: {
  venueName: string;
  countryName: string;
  url: string;
}) {
  const [copied, setCopied] = useState(false);

  const text = `Check out ${venueName} on GameDay Map — the best place to watch ${countryName} at the World Cup: ${url}`;

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          if (navigator.share) {
            await navigator.share({
              title: `${venueName} | GameDay Map`,
              text,
              url
            });
            return;
          }

          await navigator.clipboard.writeText(text);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1800);
        } catch (error) {
          console.error("Share failed", error);
        }
      }}
      className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-2 text-navy dark:border-white/10 dark:bg-white/5 dark:text-white"
    >
      {copied ? "Copied" : "Share this venue"}
    </button>
  );
}
