"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaInstall() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    // Listen for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // Detect if already installed (standalone)
    if (window.matchMedia?.("(display-mode: standalone)").matches) {
      setInstalled(true);
      setShow(false);
    }

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
      <span style={{ fontSize: 18 }} aria-hidden="true">
        📲
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
          fontSize: 16,
          cursor: "pointer",
          lineHeight: 1,
          padding: "0 0 0 4px",
        }}
      >
        ✕
      </button>
    </div>
  );
}