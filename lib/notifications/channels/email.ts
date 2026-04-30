import "server-only";

interface EmailInput {
  kind: string;
  title: string;
  body: string;
  payload: Record<string, unknown>;
  href?: string;
}

export async function sendEmail(_profileId: string, _input: EmailInput) {
  // Implemented in the next commit with Resend.
}
