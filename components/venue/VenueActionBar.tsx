"use client";

import { useState } from "react";

import { UpgradeModal } from "@/components/membership/UpgradeModal";
import { usePremiumGate } from "@/lib/hooks/usePremiumGate";
import { useFavoritesStore } from "@/lib/store/favorites";
import { useMembership } from "@/lib/store/membership";
import { toast } from "@/lib/toast";

export function VenueActionBar({
  venueSlug,
  venueName,
  venueAddress
}: {
  venueSlug: string;
  venueName: string;
  venueAddress: string;
}) {
  const favorites = useFavoritesStore((state) => state.favorites);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const { canSaveVenue } = useMembership();
  const { showModal, setShowModal, requiredTier } = usePremiumGate("unlimited_saves");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const isSaved = favorites.includes(venueSlug);
  const isAtLimit = !isSaved && !canSaveVenue(favorites.length);

  function handleSave() {
    if (isAtLimit) {
      setShowSaveModal(true);
      return;
    }

    const wasSaved = favorites.includes(venueSlug);
    toggleFavorite(venueSlug);
    toast(wasSaved ? "Removed from saved" : "Saved!");
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venueAddress)}`}
        target="_blank"
        rel="noreferrer"
        className="inline-flex shrink-0 rounded-full border border-[#d8e3f5] bg-white px-4 py-2 text-sm font-semibold text-[#0a1628]"
      >
        📍 Directions
      </a>
      <button
        type="button"
        onClick={async () => {
          const url = `${window.location.origin}/venue/${venueSlug}`;
          if (navigator.share) {
            await navigator.share({ title: venueName, url });
          } else {
            await navigator.clipboard.writeText(url);
            toast.success("Link copied!");
          }
        }}
        className="inline-flex shrink-0 rounded-full border border-[#d8e3f5] bg-white px-4 py-2 text-sm font-semibold text-[#0a1628]"
      >
        🔗 Share
      </button>
      <button
        type="button"
        onClick={handleSave}
        className="inline-flex shrink-0 rounded-full border border-[#d8e3f5] bg-white px-4 py-2 text-sm font-semibold text-[#0a1628]"
      >
        ❤️ {isSaved ? "Saved" : "Save"}
      </button>
      <button
        type="button"
        onClick={() => {
          document.getElementById("reservation-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
        className="inline-flex shrink-0 rounded-full border border-[#d8e3f5] bg-white px-4 py-2 text-sm font-semibold text-[#0a1628]"
      >
        📅 Reserve
      </button>
      <button
        type="button"
        onClick={() => {
          document.getElementById("review-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
        className="inline-flex shrink-0 rounded-full border border-[#d8e3f5] bg-white px-4 py-2 text-sm font-semibold text-[#0a1628]"
      >
        ✏️ Review
      </button>

      {showSaveModal ? (
        <UpgradeModal
          feature="unlimited_saves"
          requiredTier={requiredTier}
          onClose={() => setShowSaveModal(false)}
        />
      ) : null}
      {showModal ? (
        <UpgradeModal
          feature="unlimited_saves"
          requiredTier={requiredTier}
          onClose={() => setShowModal(false)}
        />
      ) : null}
    </div>
  );
}
