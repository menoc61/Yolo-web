"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fr-CM" style={{ background: "#0b0b0b" }}>
      <body
        style={{
          background: "#0b0b0b",
          color: "#fff",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
        }}
      >
        <div style={{ maxWidth: 420, width: "100%", textAlign: "center", border: "1px solid #222", background: "#0f0f0f", padding: "36px 28px" }}>
          <div style={{ fontSize: "0.6rem", letterSpacing: "0.26em", textTransform: "uppercase", color: "#ef4444", marginBottom: 12 }}>
            Erreur · yolo.co
          </div>
          <h1 style={{ fontSize: "1.35rem", fontWeight: 700, textTransform: "uppercase" }}>Oups — erreur de l&apos;application</h1>
          <p style={{ color: "#666", fontSize: "0.8rem", lineHeight: 1.7, marginTop: 10 }}>
            Le backend a renvoyé une erreur. Ton panier et les produits restent sauvegardés en local.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 22 }}>
            <button
              onClick={reset}
              style={{
                background: "#fff",
                color: "#0b0b0b",
                border: "none",
                padding: "12px 22px",
                fontSize: "0.7rem",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              Réessayer
            </button>
          </div>
          {error?.digest && (
            <div style={{ marginTop: 14, fontSize: "0.6rem", color: "#444", letterSpacing: "0.08em" }}>
              Réf {error.digest} · Avenue Kennedy, Yaoundé
            </div>
          )}
        </div>
      </body>
    </html>
  );
}