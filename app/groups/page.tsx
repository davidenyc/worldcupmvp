"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/ui/EmptyState";
import { useGroups } from "@/lib/store/groups";
import { useUser } from "@/lib/store/user";

export default function GroupsPage() {
  const user = useUser();
  const groups = useGroups((state) => state.groups);
  const joinGroup = useGroups((state) => state.joinGroup);
  const deleteGroup = useGroups((state) => state.deleteGroup);
  const [joinCode, setJoinCode] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const content = groups.length ? (
    <div className="grid gap-4 md:grid-cols-2">
      {groups.map((group) => (
        <div key={group.id} className="surface p-5">
          <div className="text-xl font-semibold text-deep">{group.name}</div>
          <div className="mt-2 text-sm text-navy/60">{group.venueName}</div>
          <div className="mt-1 text-sm text-navy/60">
            {new Date(group.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} · {group.memberCount} members
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(group.shareCode);
                toast.success("Code copied!");
              }}
              className="rounded-full border border-[#d8e3f5] bg-[#f8fbff] px-4 py-2 text-sm font-semibold text-[#0a1628]"
            >
              {group.shareCode} 📋 Copy
            </button>
            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(`https://gamedaymap.com/join/${group.shareCode}`);
                toast.success("Share link copied!");
              }}
              className="rounded-full border border-[#d8e3f5] px-4 py-2 text-sm font-semibold text-[#0a1628]"
            >
              Share link
            </button>
          </div>
          <div className="mt-4">
            {group.creatorId === user.id && confirmDeleteId === group.id ? (
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setConfirmDeleteId(null)} className="rounded-full border border-[#d8e3f5] px-3 py-1.5 text-sm font-semibold text-[#0a1628]">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteGroup(group.id);
                    setConfirmDeleteId(null);
                  }}
                  className="rounded-full border border-red-200 px-3 py-1.5 text-sm font-semibold text-red-600"
                >
                  Confirm delete
                </button>
              </div>
            ) : group.creatorId === user.id ? (
              <button
                type="button"
                onClick={() => setConfirmDeleteId(group.id)}
                className="text-sm font-semibold text-red-600"
              >
                Delete
              </button>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  ) : (
    <EmptyState
      emoji="⚽"
      title="No watch parties yet"
      subtitle="Create a group from any venue page and share the code with your crew."
      action={
        <Link href="/nyc/map" className="inline-flex rounded-full bg-[#f4b942] px-5 py-2.5 text-sm font-bold text-[#0a1628]">
          Find a venue →
        </Link>
      }
    />
  );

  return (
    <main className="container-shell space-y-8 py-10">
      <div>
        <div className="text-sm uppercase tracking-[0.2em] text-mist">Groups</div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-deep">⚽ Your GameDay Groups</h1>
      </div>

      {content}
      <section className="surface max-w-xl p-5">
        <div className="text-lg font-semibold text-deep">Join a group</div>
        <div className="mt-4 flex gap-2">
          <input
            value={joinCode}
            onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
            placeholder="Enter share code"
            className="h-12 flex-1 rounded-2xl border border-[#d8e3f5] px-4 text-sm text-[#0a1628]"
          />
          <button
            type="button"
            onClick={() => {
              if (joinGroup(joinCode.trim())) {
                toast.success("Joined!");
                setJoinCode("");
                return;
              }
              toast.error("Code not found — double check and try again");
            }}
            className="rounded-2xl bg-[#f4b942] px-5 py-3 text-sm font-bold text-[#0a1628]"
          >
            Join
          </button>
        </div>
      </section>
    </main>
  );
}
