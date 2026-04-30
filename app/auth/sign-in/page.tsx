import { SignInForm } from "@/components/auth/SignInForm";

export default function SignInPage({
  searchParams
}: {
  searchParams?: { error?: string; next?: string; email?: string; send?: string; create?: string };
}) {
  return (
    <div className="container-shell py-10 sm:py-16">
      <SignInForm
        initialError={searchParams?.error}
        initialNext={searchParams?.next}
        initialEmail={searchParams?.email}
        initialAutoRequest={searchParams?.send === "1"}
        allowCreateUser={searchParams?.create === "1"}
      />
    </div>
  );
}
