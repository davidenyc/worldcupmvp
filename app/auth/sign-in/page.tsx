import { SignInForm } from "@/components/auth/SignInForm";

export default function SignInPage({
  searchParams
}: {
  searchParams?: { error?: string; next?: string };
}) {
  return (
    <div className="container-shell py-10 sm:py-16">
      <SignInForm initialError={searchParams?.error} initialNext={searchParams?.next} />
    </div>
  );
}
