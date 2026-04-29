import { WelcomeFlow } from "@/components/welcome/WelcomeFlow";

export default function WelcomePage() {
  return (
    <main className="container-shell flex min-h-[calc(100dvh-var(--header-h))] justify-center py-6 sm:py-10">
      <WelcomeFlow />
    </main>
  );
}
