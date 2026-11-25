"use client";

import { useEffect, useState } from "react";

import { usePwa } from "@/lib/store";

/**
 * Registers the service worker, tracks install state and shows an offline banner.
 */
export function PwaBoot() {
  const [online, setOnline] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setOnline(navigator.onLine);

    // Register service worker
    if ("serviceWorker" in navigator) {
      const register = () => {
        navigator.serviceWorker.register("/sw.js").catch(() => {
          // SW registration failures are non-fatal
        });
      };
      if (document.readyState === "complete") {
        register();
      } else {
        window.addEventListener("load", register, { once: true });
      }
    }

    // Install prompt
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      usePwa.getState().setPromptEvent(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      usePwa.getState().setInstalled(true);
      usePwa.getState().setPromptEvent(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);

    if (window.matchMedia("(display-mode: standalone)").matches) {
      usePwa.getState().setInstalled(true);
    }

    // Connectivity
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  if (!mounted || online) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 top-0 z-[60] flex items-center justify-center gap-2 bg-amber-500 px-4 py-2 text-sm font-medium text-amber-950"
    >
      <span aria-hidden="true">⚠</span>
      You are offline — showing the last available content.
    </div>
  );
}

export type { BeforeInstallPromptEvent };
