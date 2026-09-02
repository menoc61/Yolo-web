"use client";

import { motion, useReducedMotion } from "motion/react";

export function ProductRating({ rating, count, compact = false }: { rating: number; count: number; compact?: boolean }) {
  const reduce = useReducedMotion();
  const full = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  return (
    <div className="flex items-center gap-2" aria-label={`${rating} out of 5 stars — ${count} reviews`}>
      <div className="flex gap-[2px]">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i < full || (i === full && hasHalf);
          const isHalf = i === full && hasHalf;
          return (
            <motion.span
              key={i}
              initial={reduce ? false : { scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.04, duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
              className={`inline-grid place-items-center ${compact ? "h-3.5 w-3.5" : "h-4 w-4"}`}
              style={{ color: filled ? "#facc15" : "#2a2a2a" }}
            >
              <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.4} className="h-full w-full">
                <path d="M12 3l2.4 4.86 5.36.78-3.88 3.78.92 5.34L12 15.9l-4.8 2.86.92-5.34L4.24 8.64l5.36-.78L12 3z" />
                {isHalf && <path d="M12 3l2.4 4.86 5.36.78-3.88 3.78.92 5.34L12 15.9z" fill="currentColor" opacity={0.9} />}
              </svg>
            </motion.span>
          );
        })}
      </div>
      <span className={`${compact ? "text-[0.7rem]" : "text-xs"} tracking-wide`} style={{ color: "#aaa" }}>
        {rating.toFixed(1)} <span style={{ color: "#555" }}>· {count.toLocaleString("fr-CM")} avis</span>
      </span>
    </div>
  );
}

export function RatingInline({ rating, count }: { rating: number; count: number }) {
  return <ProductRating rating={rating} count={count} compact />;
}
