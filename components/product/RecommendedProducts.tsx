"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { useRecommendations } from "@/hooks/useRecommendations";
import { ProductCard } from "./ProductGrid";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";

export function RecommendedSection({ currentId }: { currentId: string }) {
  const { data, isLoading } = useRecommendations(currentId, 4);
  const shouldReduce = useReducedMotion();

  return (
    <section style={{ marginTop: 64, borderTop: "1px solid #1a1a1a", paddingTop: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: "0.62rem", letterSpacing: "0.26em", textTransform: "uppercase", color: "#666", marginBottom: 8 }}>Recommandé pour toi · yolo.co</div>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.03em" }}>Tu aimeras aussi</h2>
          <p style={{ color: "#555", fontSize: "0.8rem", marginTop: 6, maxWidth: 520, lineHeight: 1.6 }}>Suggestions basées sur la catégorie et la note — yolo.co Avenue Kennedy.</p>
        </div>
        <Link href="/products" style={{ fontSize: "0.7rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "#fff", borderBottom: "1px solid #333", paddingBottom: 4, textDecoration: "none" }}>Voir tout →</Link>
      </div>

      {isLoading ? (
        <div className="product-grid" style={{ marginTop: 24 }}>
          {[1, 2, 3, 4].map((i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <motion.div
          initial={shouldReduce ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          className="product-grid"
          style={{ marginTop: 24 }}
        >
          {data?.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </motion.div>
      )}

    </section>
  );
}
