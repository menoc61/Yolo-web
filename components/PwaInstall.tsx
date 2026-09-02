"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// Detect if the app is already installed and running standalone (e.g. home screen).
// Computed lazily during render instead of inside an effect — no setState cascade.
function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(display-mode: standalone)").matches ?? false;
}

export function PwaInstall() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [installed, setInstalled] = useState(isStandalone);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Register service worker
    if ("serviceWorker" in navigator) {
      const isDevelopment = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
      if (isDevelopment) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          registrations.forEach((registration) => registration.unregister());
        });
        caches.keys().then((keys) => keys.forEach((key) => caches.delete(key)));
      } else {
        navigator.serviceWorker.register("/sw.js").catch(() => {});
      }
    }

    // Listen for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferred) return;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === "accepted") {
      setShow(false);
      setInstalled(true);
    }
  };

  if (installed || !show) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 88,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 80,
        background: "#1a1a1a",
        border: "1px solid #25D366",
        borderRadius: 14,
        padding: "12px 18px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        boxShadow: "0 8px 32px rgba(0,0,0,0.45)",
        fontSize: "0.74rem",
        color: "#fff",
        fontWeight: 500,
        letterSpacing: "0.02em",
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ display: "flex", color: "#25D366" }} aria-hidden="true">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="7" y="2" width="10" height="20" rx="2.5" />
          <path d="M12 8v6" />
          <path d="m9 11 3 3 3-3" />
          <path d="M12 18.5v.01" />
        </svg>
      </span>
      <span>Installer YOLO sur ton appareil ?</span>
      <button
        onClick={handleInstall}
        type="button"
        style={{
          background: "#25D366",
          color: "#0b0b0b",
          border: "none",
          borderRadius: 8,
          padding: "8px 14px",
          fontWeight: 700,
          fontSize: "0.72rem",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        Installer
      </button>
      <button
        onClick={() => setShow(false)}
        type="button"
        aria-label="Fermer"
        style={{
          background: "transparent",
          color: "#555",
          border: "none",
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
          lineHeight: 1,
          padding: "6px 0 6px 6px",
        }}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      </button>
    </div>
  );
}