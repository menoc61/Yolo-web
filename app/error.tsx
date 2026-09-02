"use client";

import { useEffect } from "react";

export default function ErrorScreen({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("yolo backend error:", error);
  }, [error]);

  return (
    <div className="page-content" style={{ display: "grid", placeItems: "center", minHeight: "60vh" }}>
      <div style={{ maxWidth: 420, width: "100%", textAlign: "center", border: "1px solid #222", background: "#0f0f0f", padding: "36px 28px" }}>
        <div style={{ fontSize: "0.6rem", letterSpacing: "0.26em", textTransform: "uppercase", color: "#ef4444", marginBottom: 12 }}>Erreur · backend indisponible</div>
        <h1 style={{ fontSize: "1.35rem", fontWeight: 700, textTransform: "uppercase" }}>Oups — quelque chose s'est mal passé</h1>
        <p style={{ color: "#666", fontSize: "0.8rem", lineHeight: 1.7, marginTop: 10 }}>
          Le serveur a renvoyé une erreur. Ton panier et les produits restent sauvegardés sur ton appareil (mode local, yolo.co).
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 22, flexWrap: "wrap" }}>
          <button className="btn-primary" onClick={reset} style={{ cursor: "pointer" }}>
            Réessayer
          </button>
          <button className="btn-secondary" onClick={() => { window.location.href = "/"; }} style={{ cursor: "pointer" }}>
            Accueil
          </button>
        </div>
        {error?.digest && (
          <div style={{ marginTop: 14, fontSize: "0.6rem", color: "#444", letterSpacing: "0.08em" }}>
            Réf {error.digest} · Avenue Kennedy, Yaoundé · yolo.co
          </div>
        )}
      </div>
    </div>
  );
}