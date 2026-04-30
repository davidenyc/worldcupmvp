import "server-only";

import { Resend } from "resend";

import { createAdminClient } from "@/lib/supabase/admin";

interface EmailInput {
  kind: string;
  title: string;
  body: string;
  payload: Record<string, unknown>;
  href?: string;
}

let warnedMissingResendEnv = false;

function renderTemplate(input: EmailInput) {
  const ctaHref =
    typeof input.href === "string" && input.href.startsWith("/")
      ? `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}${input.href}`
      : process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return `
    <div style="font-family:Inter,system-ui,sans-serif;background:#f7fafc;padding:24px;">
      <div style="max-width:560px;margin:0 auto;background:#0f172a;color:#f8fafc;border-radius:24px;overflow:hidden;">
        <div style="padding:24px 28px;border-bottom:1px solid rgba(255,255,255,0.08);">
          <div style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(248,250,252,0.72);">GameDay Map alerts</div>
          <h1 style="margin:12px 0 0;font-size:30px;line-height:1.1;">${input.title}</h1>
        </div>
        <div style="padding:28px;">
          <p style="margin:0 0 20px;font-size:16px;line-height:1.7;color:rgba(248,250,252,0.82);">${input.body}</p>
          <a href="${ctaHref}" style="display:inline-block;padding:14px 24px;border-radius:999px;background:#f4b942;color:#0f172a;font-weight:700;text-decoration:none;">Open GameDay Map</a>
        </div>
      </div>
    </div>
  `;
}

export async function sendEmail(profileId: string, input: EmailInput) {
  const resendKey = process.env.RESEND_API_KEY;
  const admin = createAdminClient();

  if (!resendKey || !admin) {
    if (!warnedMissingResendEnv) {
      warnedMissingResendEnv = true;
      console.warn("Notifications email disabled: missing RESEND_API_KEY or Supabase admin env.");
    }
    return;
  }

  const { data, error } = await admin.auth.admin.getUserById(profileId);
  if (error || !data.user?.email) return;

  const resend = new Resend(resendKey);
  await resend.emails.send({
    from: "GameDay Map <alerts@gamedaymap.com>",
    to: data.user.email,
    subject: input.title,
    html: renderTemplate(input)
  });
}
