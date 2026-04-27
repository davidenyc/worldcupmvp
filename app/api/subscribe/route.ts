import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(request: Request) {
  const { email } = await request.json();

  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is not set; skipping email send.");
    return NextResponse.json({ success: true });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: "GameDay Map <alerts@gamedaymap.com>",
    to: email,
    subject: "You're on the list! GameDay Map World Cup alerts",
    html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto"><div style="background:#0a1628;padding:32px;border-radius:16px"><div style="color:#f4b942;font-size:24px;font-weight:bold">⚽ GameDay Map</div><div style="color:white;margin-top:16px;font-size:18px">You're in!</div><div style="color:rgba(255,255,255,0.7);margin-top:8px">We'll send you World Cup match alerts and venue updates.<br/>World Cup 2026 starts June 11. Get your bar ready.</div><div style="margin-top:24px"><a href="https://gamedaymap.com" style="background:#f4b942;color:#0a1628;padding:12px 24px;border-radius:99px;font-weight:bold;text-decoration:none">Find your bar →</a></div></div></div>`
  });

  return NextResponse.json({ success: true });
}
