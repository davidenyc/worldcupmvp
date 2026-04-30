import { AdminPageClient } from "@/components/admin/AdminPageClient";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Admin access",
  description:
    "Protected reviewer access for GameDay Map operations, moderation, and launch-readiness tooling.",
  path: "/admin",
  robots: {
    index: false,
    follow: false
  }
});

export default function AdminPage() {
  return <AdminPageClient />;
}
