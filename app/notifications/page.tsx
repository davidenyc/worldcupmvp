import { NotificationsFeed } from "@/components/notifications/NotificationsFeed";

export default function NotificationsPage() {
  return (
    <main className="container-shell py-6 sm:py-10">
      <section className="overflow-hidden rounded-[1.75rem] border border-[color:var(--border-subtle)] bg-[var(--bg-surface)] shadow-sm">
        <NotificationsFeed showSettingsLink />
      </section>
    </main>
  );
}
