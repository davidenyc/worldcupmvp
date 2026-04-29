// Global mobile PWA install banner mounted in the app shell above the bottom navigation.
"use client";

import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "gameday-pwa-dismissed";
const SHOW_DELAY_MS = 3000;

type InstallChoice = {
  outcome: "accepted" | "dismissed";
  platform: string;
};

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<InstallChoice>;
};

declare global {
  interface Window {
    __gamedayDeferredInstallPrompt?: BeforeInstallPromptEvent | null;
  }
}

function isIosDevice() {
  if (typeof window === "undefined") return false;
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function isStandaloneDisplay() {
  if (typeof window === "undefined") return false;
  const mediaStandalone = window.matchMedia("(display-mode: standalone)").matches;
  const appleStandalone =
    typeof window.navigator !== "undefined" &&
    "standalone" in window.navigator &&
    window.navigator.standalone === true;
  return mediaStandalone || appleStandalone;
}

export function PWAInstallBanner() {
  const pathname = usePathname();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [bodyRouteActive, setBodyRouteActive] = useState(false);
  const [showIosModal, setShowIosModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [delayElapsed, setDelayElapsed] = useState(false);

  useEffect(() => {
    const readDeferredPrompt = () => window.__gamedayDeferredInstallPrompt ?? null;

    const syncState = () => {
      setDismissed(window.localStorage.getItem(STORAGE_KEY) === "1");
      setInstalled(isStandaloneDisplay());
      setIsIos(isIosDevice());
      setIsMobile(window.innerWidth < 1024);
      setBodyRouteActive(Boolean(document.body?.dataset.route));
      setDeferredPrompt(readDeferredPrompt());
    };

    syncState();

    const onResize = () => setIsMobile(window.innerWidth < 1024);
    const delayTimer = window.setTimeout(() => setDelayElapsed(true), SHOW_DELAY_MS);
    const onInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };
    const onInstallPromptReady = () => {
      setDeferredPrompt(readDeferredPrompt());
    };
    const observer = new MutationObserver(() => {
      setBodyRouteActive(Boolean(document.body?.dataset.route));
    });

    observer.observe(document.body, { attributes: true, attributeFilter: ["data-route"] });
    window.addEventListener("resize", onResize);
    window.addEventListener("appinstalled", onInstalled);
    window.addEventListener("gameday:install-prompt-ready", onInstallPromptReady);
    window.addEventListener("gameday:install-complete", onInstalled);

    return () => {
      window.clearTimeout(delayTimer);
      observer.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("appinstalled", onInstalled);
      window.removeEventListener("gameday:install-prompt-ready", onInstallPromptReady);
      window.removeEventListener("gameday:install-complete", onInstalled);
    };
  }, []);

  const hiddenForRoute = useMemo(() => {
    if (!pathname) return false;
    return pathname === "/welcome" || pathname.startsWith("/auth");
  }, [pathname]);

  const visible = delayElapsed && isMobile && !dismissed && !installed && !hiddenForRoute && !bodyRouteActive;

  async function handleInstall() {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice.catch(() => null);
      window.__gamedayDeferredInstallPrompt = null;
      setDeferredPrompt(null);
      if (result?.outcome === "accepted") {
        setInstalled(true);
        return;
      }
    }

    if (isIos) {
      setShowIosModal(true);
      return;
    }

    setShowManualModal(true);
  }

  function handleDismiss() {
    window.localStorage.setItem(STORAGE_KEY, "1");
    setDismissed(true);
    setShowIosModal(false);
    setShowManualModal(false);
  }

  if (!visible) return null;

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 bottom-[calc(6.5rem+env(safe-area-inset-bottom))] z-50 px-4 lg:hidden">
        <div className="pointer-events-auto mx-auto max-w-md rounded-[1.6rem] border border-line bg-[color:color-mix(in_srgb,var(--bg-surface)_92%,transparent)] p-4 shadow-popover backdrop-blur-xl">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gold text-lg font-black text-[color:var(--fg-on-accent)]">
              GM
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-[color:var(--fg-primary)]">
                Add GameDay Map to your home screen for kickoff alerts.
              </div>
              <div className="mt-1 text-xs leading-5 text-[color:var(--fg-secondary)]">
                Open city maps faster, keep your Cup handy, and get back in with one tap.
              </div>
            </div>
            <button
              type="button"
              onClick={handleDismiss}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-line bg-[var(--bg-surface-elevated)] px-3 text-sm font-semibold text-[color:var(--fg-secondary)] transition hover:bg-[var(--bg-surface-strong)] hover:text-[color:var(--fg-primary)]"
              aria-label="Dismiss install banner"
            >
              ×
            </button>
          </div>
          <button
            type="button"
            onClick={() => {
              void handleInstall();
            }}
            className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-gold px-4 text-sm font-semibold text-[color:var(--fg-on-accent)] transition hover:brightness-95"
          >
            Install →
          </button>
        </div>
      </div>

      {showIosModal ? (
        <div className="fixed inset-0 z-[60] flex items-end bg-black/45 px-4 pb-4 pt-10 lg:hidden">
          <div className="mx-auto w-full max-w-md rounded-[1.75rem] border border-line bg-[var(--bg-surface)] p-5 shadow-popover">
            <div className="text-[10px] uppercase tracking-[0.24em] text-[color:var(--fg-secondary)]">
              Install on iPhone
            </div>
            <h2 className="mt-2 text-2xl font-semibold text-[color:var(--fg-primary)]">
              Add GameDay Map to your home screen.
            </h2>
            <p className="mt-2 text-sm leading-6 text-[color:var(--fg-secondary)]">
              In Safari, tap the share button, then choose <span className="font-semibold text-[color:var(--fg-primary)]">Add to Home Screen</span>.
            </p>

            <div className="mt-5 rounded-[1.5rem] border border-line bg-[var(--bg-surface-elevated)] p-4">
              <div className="flex items-center justify-between rounded-2xl border border-line bg-[var(--bg-surface)] px-4 py-3 text-sm text-[color:var(--fg-primary)]">
                <span>Safari toolbar</span>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line bg-[var(--bg-surface-elevated)] text-lg">
                  ⤴
                </span>
              </div>
              <div className="mt-3 rounded-2xl border border-dashed border-line bg-[var(--bg-surface)] px-4 py-3 text-sm text-[color:var(--fg-secondary)]">
                Tap <span className="font-semibold text-[color:var(--fg-primary)]">Share</span> →{" "}
                <span className="font-semibold text-[color:var(--fg-primary)]">Add to Home Screen</span>
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setShowIosModal(false)}
                className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full border border-line bg-[var(--bg-surface-elevated)] px-4 text-sm font-semibold text-[color:var(--fg-primary)]"
              >
                Got it
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full border border-line bg-transparent px-4 text-sm font-semibold text-[color:var(--fg-secondary)]"
              >
                Don&apos;t show again
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showManualModal ? (
        <div className="fixed inset-0 z-[60] flex items-end bg-black/45 px-4 pb-4 pt-10 lg:hidden">
          <div className="mx-auto w-full max-w-md rounded-[1.75rem] border border-line bg-[var(--bg-surface)] p-5 shadow-popover">
            <div className="text-[10px] uppercase tracking-[0.24em] text-[color:var(--fg-secondary)]">
              Install GameDay Map
            </div>
            <h2 className="mt-2 text-2xl font-semibold text-[color:var(--fg-primary)]">
              Add GameDay Map from your browser menu.
            </h2>
            <p className="mt-2 text-sm leading-6 text-[color:var(--fg-secondary)]">
              If Chrome does not show the native install prompt automatically, use the install button in the address bar or open the browser menu and choose <span className="font-semibold text-[color:var(--fg-primary)]">Install GameDay Map</span>.
            </p>

            <div className="mt-5 rounded-[1.5rem] border border-line bg-[var(--bg-surface-elevated)] p-4">
              <div className="rounded-2xl border border-line bg-[var(--bg-surface)] px-4 py-3 text-sm text-[color:var(--fg-primary)]">
                Look for the install icon in the address bar, then confirm the native install sheet.
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setShowManualModal(false)}
                className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full border border-line bg-[var(--bg-surface-elevated)] px-4 text-sm font-semibold text-[color:var(--fg-primary)]"
              >
                Got it
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full border border-line bg-transparent px-4 text-sm font-semibold text-[color:var(--fg-secondary)]"
              >
                Don&apos;t show again
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
