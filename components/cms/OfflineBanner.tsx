"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

export function OfflineBanner() {
  const [offline, setOffline] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    const sync = () => setOffline(typeof navigator !== "undefined" && !navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  return (
    <AnimatePresence>
      {offline && (
        <motion.div
          role="status"
          aria-live="polite"
          initial={reduce ? false : { opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 95,
            background: "#facc15",
            color: "#0b0b0b",
            padding: "10px 16px",
            fontSize: "0.7rem",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            textAlign: "center",
            boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
          }}
        >
          Hors ligne — mode local actif · produits &amp; panier sauvegardés sur ton appareil · yolo.co
        </motion.div>
      )}
    </AnimatePresence>
  );
}