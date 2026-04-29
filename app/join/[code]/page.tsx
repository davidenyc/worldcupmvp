"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { EmptyState } from "@/components/ui/EmptyState";
import { useGroups } from "@/lib/store/groups";

export default function JoinGroupPage({ params }: { params: { code: string } }) {
  const router = useRouter();
  const groups = useGroups((state) => state.groups);
  const joinGroup = useGroups((state) => state.joinGroup);
  const group = groups.find((item) => item.shareCode === params.code.toUpperCase());

  if (!group) {
    return <div className="container-shell py-10"><EmptyState emoji="⚽" title="This GameDay crew doesn&apos;t exist or has expired." /></div>;
  }

  return (
    <div className="container-shell py-10">
      <div className="surface max-w-2xl p-6">
        <div className="text-3xl font-semibold text-deep">{group.name}</div>
        <div className="mt-2 text-sm text-navy/70">{group.venueName}</div>
        <div className="mt-2 text-sm text-navy/70">{group.memberCount} members</div>
        <button
          type="button"
          onClick={() => {
            if (joinGroup(params.code)) {
              toast.success("Joined GameDay crew!");
              router.push(`/venue/${group.venueId}`);
            }
          }}
          className="mt-5 inline-flex rounded-full bg-gold px-5 py-3 text-sm font-bold text-[color:var(--fg-on-accent)]"
        >
          Join this GameDay Crew
        </button>
      </div>
    </div>
  );
}
