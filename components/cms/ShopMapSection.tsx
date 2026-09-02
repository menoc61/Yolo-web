"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { motion, useReducedMotion } from "motion/react";
import { Skeleton } from "@/components/ui/Skeleton";
import shops from "@/data/shops.json";

// Dynamic leaflet to avoid SSR window
const LeafletMap = dynamic(() => import("./ShopMapLeaflet"), {
  ssr: false,
  loading: () => <Skeleton style={{ height: 360, width: "100%", borderRadius: 0 }} />,
});

interface Props {
  productSlug?: string;
  productName?: string;
}

type StockStatus = { label: string; color: string; inStock: boolean };

function stockStatus(qty: number | null): StockStatus | null {
  if (qty === null) return null; // shop doesn't carry it
  if (qty === 0) return { label: "Rupture · à commander", color: "#ef4444", inStock: false };
  if (qty <= 2) return { label: `Plus que ${qty} en stock`, color: "#facc15", inStock: true };
  return { label: `En stock · ${qty} unités`, color: "#4ade80", inStock: true };
}

export function ShopMapSection({ productSlug, productName }: Props) {
  const [mounted, setMounted] = useState(false);
  const shouldReduce = useReducedMotion();
  useEffect(() => setMounted(true), []);

  const tracked = productSlug
    ? shops
        .map((s) => ({ shop: s, status: stockStatus(s.stock?.[productSlug] ?? null) }))
        .sort((a, b) => Number(b.status?.inStock ?? false) - Number(a.status?.inStock ?? false))
    : [];

  return (
    <section style={{ marginTop: 64, borderTop: "1px solid #1a1a1a", paddingTop: 32, paddingBottom: 40 }}>
      <motion.div
        initial={shouldReduce ? false : { opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      >
        <div style={{ fontSize: "0.62rem", letterSpacing: "0.26em", textTransform: "uppercase", color: "#666", marginBottom: 8 }}>Points de vente · yolo.co · Avenue Kennedy</div>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.03em", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          {productName ? (
            <>Nos shops — <span style={{ fontWeight: 400 }}>{productName}</span></>
          ) : (
            <>Nos shops</>
          )}
          <span style={{ background: "#fff", color: "#0b0b0b", fontSize: "0.6rem", padding: "4px 8px", letterSpacing: "0.08em" }}>{shops.length} points</span>
        </h2>
        <p style={{ color: "#666", fontSize: "0.8rem", marginTop: 6, maxWidth: 560, lineHeight: 1.6 }}>
          {productName
            ? `Stock temps réel par boutique pour — ${productName}. Avenue Kennedy (flaghip) + Bastos, Douala Akwa/Bonanjo. Clique un pin → directions.`
            : "Avenue Kennedy, Yaoundé — flaghip + Bastos, Douala Akwa/Bonanjo. Clique un pin → directions."}
        </p>
      </motion.div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 16, marginTop: 20 }}>
        <div style={{ border: "1px solid #1a1a1a", background: "#0f0f0f", overflow: "hidden", minHeight: 360 }}>
          {mounted ? <LeafletMap /> : <Skeleton style={{ height: 360, width: "100%" }} />}
        </div>
        <div style={{ display: "grid", gap: 10, alignContent: "start" }}>
          {productSlug && (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", fontSize: "0.6rem", color: "#555", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80" }} /> En stock</span>
              <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: "#facc15" }} /> Stock faible</span>
              <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444" }} /> Rupture</span>
            </div>
          )}
          {(tracked.length ? tracked : shops.map((shop) => ({ shop, status: null }))).map(({ shop: s, status }, i) => (
            <motion.a
              key={s.id}
              href={`https://www.google.com/maps/search/?api=1&query=${s.lat},${s.lng}`}
              target="_blank"
              rel="noopener"
              initial={shouldReduce ? false : { opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04, duration: 0.32, ease: [0.23, 1, 0.32, 1] }}
              whileHover={shouldReduce ? undefined : { scale: 1.01, y: -2 }}
              whileTap={shouldReduce ? undefined : { scale: 0.98 }}
              style={{ background: s.type === "flagship" ? "#fff" : "#111", color: s.type === "flagship" ? "#0b0b0b" : "#fff", border: "1px solid #1a1a1a", padding: "14px 16px", textDecoration: "none", display: "block" }}
            >
              <div style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
                <span>{s.name}</span>
                <span style={{ fontSize: "0.6rem", background: s.type === "flagship" ? "#0b0b0b" : "#222", color: s.type === "flagship" ? "#fff" : "#aaa", padding: "3px 6px" }}>{s.type}</span>
              </div>
              {status && (
                <div style={{ fontSize: "0.72rem", fontWeight: 700, color: status.color, marginTop: 6, display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: status.color, display: "inline-block", flex: "0 0 auto" }} />
                  {status.label}
                </div>
              )}
              <div style={{ fontSize: "0.75rem", color: s.type === "flagship" ? "#333" : "#666", marginTop: 4 }}>{s.address} · {s.hours}</div>
              <div style={{ fontSize: "0.7rem", color: s.type === "flagship" ? "#0b0b0b" : "#25D366", marginTop: 6 }}>{s.phone} → Itinéraire</div>
            </motion.a>
          ))}
          <a href="https://wa.me/+79011805350" target="_blank" style={{ background: "#25D366", color: "#0b0b0b", padding: "12px 16px", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", textDecoration: "none", textAlign: "center" }}>WhatsApp Avenue Kennedy →</a>
        </div>
      </div>

      <style>{`@media (max-width: 900px){ section div[style*="grid-template-columns: 1.2fr 0.8fr"]{ grid-template-columns: 1fr !important; } }`}</style>
    </section>
  );
}