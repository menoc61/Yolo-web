"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

export function BackToTop() {
  const [visible, setVisible] = useState(false);
  const prefersReduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const reduce = mounted ? prefersReduce : null;

  useEffect(() => {
    setMounted(true);
    const onScroll = () => {
      const threshold = window.innerHeight * 0.6;
      setVisible(window.scrollY > threshold);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          key="backtotop"
          onClick={scrollTop}
          aria-label="Retour en haut"
          initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.8, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.8, y: 8 }}
          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          whileHover={reduce ? undefined : { y: -2 }}
          whileTap={{ scale: 0.9 }}
          style={{
            position: "fixed",
            bottom: 20,
            right: 20,
            width: 46,
            height: 46,
            zIndex: 75,
            display: "grid",
            placeItems: "center",
            background: "#1a1a1a",
            border: "1px solid #333",
            borderRadius: "50%",
            color: "#fff",
            cursor: "pointer",
            fontFamily: "inherit",
            boxShadow: "0 6px 24px rgba(0,0,0,0.45)",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="18 15 12 9 6 15" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
