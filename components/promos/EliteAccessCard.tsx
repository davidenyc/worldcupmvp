"use client";

import { useEffect, useState } from "react";

import { UpgradeModal } from "@/components/membership/UpgradeModal";
import { useMembership } from "@/lib/store/membership";
import { useUser } from "@/lib/store/user";
import { toast } from "@/lib/toast";

function secondsUntil(expiresAt: string | null) {
  if (!expiresAt) return 0;
  return Math.max(0, Math.floor((Date.parse(expiresAt) - Date.now()) / 1000));
}

export function EliteAccessCard({
  venueId,
  venueName
}: {
  venueId: string;
  venueName: string;
}) {
  const { tier } = useMembership();
  const user = useUser();
  const [open, setOpen] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [verifyMessage, setVerifyMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!open || tier !== "elite") return undefined;

    let cancelled = false;

    async function refreshToken() {
      const response = await fetch("/api/elite/access-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          displayName: user.displayName,
          venueId,
          tier
        })
      });

      if (!response.ok) return;
      const payload = (await response.json()) as { token: string; qrUrl: string; expiresAt: string };
      if (cancelled) return;
      setToken(payload.token);
      setQrUrl(payload.qrUrl);
      setExpiresAt(payload.expiresAt);
      setSecondsLeft(secondsUntil(payload.expiresAt));
    }

    refreshToken();
    const refreshInterval = window.setInterval(refreshToken, 30_000);
    const secondInterval = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);

    return () => {
      cancelled = true;
      window.clearInterval(refreshInterval);
      window.clearInterval(secondInterval);
    };
  }, [open, tier, user.displayName, user.id, venueId]);

  async function runManualCheck() {
    if (!token) return;
    const response = await fetch("/api/elite/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token })
    });
    const payload = (await response.json()) as { ok: boolean; venueId?: string; reason?: string };
    if (!response.ok || !payload.ok) {
      setVerifyMessage(payload.reason ?? "Verification failed");
      return;
    }
    setVerifyMessage(`Verified for ${payload.venueId}`);
    toast.success("Elite access token verified.");
  }

  if (tier !== "elite") {
    return (
      <>
        <div className="rounded-[1.75rem] border border-[#f4b942]/35 bg-[#fff8e7] p-5 text-[#0a1628]">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#c98a00]">Elite access</div>
          <h3 className="mt-2 text-xl font-semibold">Skip the line with your Elite QR</h3>
          <p className="mt-2 text-sm leading-6 text-[#0a1628]/70">
            Partner venues can fast-track Supporter Elite members on busy match nights with a rotating access QR.
          </p>
          <button
            type="button"
            onClick={() => setShowUpgrade(true)}
            className="mt-4 inline-flex rounded-full bg-[#f4b942] px-4 py-2 text-sm font-semibold text-[#0a1628]"
          >
            Get Elite to unlock
          </button>
        </div>
        {showUpgrade ? (
          <UpgradeModal feature="match_alerts" requiredTier="elite" onClose={() => setShowUpgrade(false)} />
        ) : null}
      </>
    );
  }

  return (
    <>
      <div className="rounded-[1.75rem] border border-[#d8e3f5] bg-white p-5 dark:border-white/10 dark:bg-[#161b22]">
        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0a1628]/45 dark:text-white/45">Member perk</div>
        <h3 className="mt-2 text-xl font-semibold text-[#0a1628] dark:text-white">Elite venue access at {venueName}</h3>
        <p className="mt-2 text-sm leading-6 text-[#0a1628]/70 dark:text-white/70">
          Show your rotating QR at the host stand for priority entry when the room is packed.
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-4 inline-flex rounded-full bg-[#0a1628] px-4 py-2 text-sm font-semibold text-white dark:bg-[#f4b942] dark:text-[#0a1628]"
        >
          Show Elite QR
        </button>
      </div>
      {open ? (
        <>
          <div className="fixed inset-0 z-[100] bg-[#0a1628]/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="fixed inset-x-0 bottom-0 z-[101] rounded-t-[2rem] bg-[var(--bg-surface)] px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-5 sm:left-1/2 sm:top-1/2 sm:w-[min(28rem,92vw)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[2rem]">
            <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-[color:var(--border-strong)] sm:hidden" />
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--fg-muted)]">Supporter Elite</div>
                <h3 className="mt-2 text-2xl font-semibold text-[color:var(--fg-primary)]">Priority entry QR</h3>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="text-2xl text-[color:var(--fg-muted)]">
                ×
              </button>
            </div>
            <div className="mt-4 rounded-[1.5rem] border border-[color:var(--border-subtle)] bg-[var(--bg-surface-elevated)] p-4 text-center">
              {qrUrl ? <img src={qrUrl} alt="Elite access QR code" className="mx-auto h-56 w-56 rounded-[1rem] bg-white p-3" /> : null}
              <div className="mt-3 text-sm font-semibold text-[color:var(--fg-primary)]">{venueName}</div>
              <div className="mt-1 text-xs uppercase tracking-[0.2em] text-[color:var(--fg-muted)]">
                Rotates every 30 seconds · {secondsLeft}s left
              </div>
            </div>
            <button
              type="button"
              onClick={runManualCheck}
              className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-[#f4b942] px-4 py-3 text-sm font-semibold text-[#0a1628]"
            >
              Run manual scan check
            </button>
            {verifyMessage ? (
              <div className="mt-3 text-center text-sm text-[color:var(--fg-secondary)]">{verifyMessage}</div>
            ) : null}
          </div>
        </>
      ) : null}
    </>
  );
}
