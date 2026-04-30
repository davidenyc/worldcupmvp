import { GroupsPageClient } from "@/components/groups/GroupsPageClient";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Watch party groups",
  description:
    "Create a GameDay group, share a code with your crew, and keep one World Cup watch plan together before kickoff.",
  path: "/groups"
});

export default function GroupsPage() {
  return <GroupsPageClient />;
}
