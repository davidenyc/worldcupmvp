"use client";

import { useState } from "react";
import { toast } from "sonner";

import { LockedFeature } from "@/components/membership/LockedFeature";
import { WorldCupMatch } from "@/lib/data/matches";
import { useGroups } from "@/lib/store/groups";
import { useUser } from "@/lib/store/user";

export function FanGroupCreateForm({
  cityKey,
  venueId,
  venueName,
  matches
}: {
  cityKey: string;
  venueId: string;
  venueName: string;
  matches: WorldCupMatch[];
}) {
  const user = useUser();
  const createGroup = useGroups((state) => state.createGroup);
  const [groupName, setGroupName] = useState("");
  const [matchId, setMatchId] = useState(matches[0]?.id ?? "");
  const [date, setDate] = useState(matches[0]?.startsAt.slice(0, 10) ?? new Date().toISOString().slice(0, 10));
  const [createdCode, setCreatedCode] = useState("");

  return (
    <LockedFeature feature="watch_party_groups" lockStyle="replace">
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          const created = createGroup({
            name: groupName || `${venueName} GameDay Crew`,
            cityKey,
            venueId,
            venueName,
            matchId,
            date,
            creatorId: user.id
          });
          setCreatedCode(created.shareCode);
          navigator.clipboard.writeText(`Join my GameDay Map crew at ${venueName} — code: ${created.shareCode} → gamedaymap.com/join/${created.shareCode}`);
          toast.success("GameDay crew created! Share the code with your friends.");
        }}
      >
        <input
          value={groupName}
          onChange={(event) => setGroupName(event.target.value)}
          placeholder="Group name"
          className="h-12 w-full rounded-2xl border border-line bg-white px-4 text-sm dark:border-white/10 dark:bg-white/5"
        />
        <select
          value={matchId}
          onChange={(event) => {
            setMatchId(event.target.value);
            const match = matches.find((item) => item.id === event.target.value);
            if (match) setDate(match.startsAt.slice(0, 10));
          }}
          className="h-12 w-full rounded-2xl border border-line bg-white px-4 text-sm dark:border-white/10 dark:bg-white/5"
        >
          {matches.map((match) => (
            <option key={match.id} value={match.id}>
              {match.homeCountry} vs {match.awayCountry}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          className="h-12 w-full rounded-2xl border border-line bg-white px-4 text-sm dark:border-white/10 dark:bg-white/5"
        />
        <button type="submit" className="inline-flex rounded-full bg-[#f4b942] px-5 py-3 text-sm font-bold text-[#0a1628]">
          Create GameDay Crew
        </button>
        {createdCode ? (
          <div className="rounded-2xl bg-[#fff8e7] p-4 text-sm font-semibold text-[#0a1628]">
            🎉 GameDay crew created! Share code: {createdCode}
          </div>
        ) : null}
      </form>
    </LockedFeature>
  );
}
