"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { useAuthStore } from "@/stores/auth";
import { AnimatedInput } from "@/components/ui/AnimatedInput";

export function AuthGate({ children, onAuthed }: { children: React.ReactNode; onAuthed?: () => void }) {
  const { isAuthenticated, login } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ email: "", name: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reduce = useReducedMotion();

  if (isAuthenticated) return <>{children}</>;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setError("E-mail invalide"); return; }
    setLoading(true);
    setError(null);
    try {
      await login(form.email, form.name);
      setOpen(false);
      onAuthed?.();
    } catch {
      setError("Connexion échouée");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div onClick={() => setOpen(true)} style={{ cursor: "pointer" }}>
        {children}
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(0,0,0,0.7)", display: "grid", placeItems: "center", padding: 20, backdropFilter: "blur(8px)" }} onClick={() => setOpen(false)}>
            <motion.form
              onSubmit={submit}
              onClick={(e) => e.stopPropagation()}
              initial={reduce ? false : { scale: 0.96, y: 12, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.96, y: 12, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              style={{ background: "#111", border: "1px solid #1e1e1e", padding: 24, width: "100%", maxWidth: 420, display: "grid", gap: 16 }}
            >
              <div style={{ fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#666" }}>YOLO — Connexion requise</div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, textTransform: "uppercase" }}>Connecte-toi pour commander</h3>
              <p style={{ fontSize: "0.8rem", color: "#777", lineHeight: 1.6 }}>Simulation auth — entre ton e-mail, on te crée un profil instantané (optimistic). Commande bloquée sans login.</p>
              <AnimatedInput label="E-mail" id="auth-email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="ton@email.com" error={error} />
              <AnimatedInput label="Nom (optionnel)" id="auth-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ton nom" />
              <motion.button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%", display: "grid", placeItems: "center" }} whileTap={reduce ? undefined : { scale: 0.97 }}>
                {loading ? <span className="h-4 w-4 rounded-full border-2 border-black/20 border-t-black animate-spin" /> : "Se connecter → Commander"}
              </motion.button>
              <motion.button type="button" onClick={() => setOpen(false)} style={{ background: "none", border: "none", color: "#555", fontSize: "0.7rem", cursor: "pointer" }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>Plus tard</motion.button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Simple wrapper for checkout: if not authed, show gate inline
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const [showGate, setShowGate] = useState(false);
  if (isAuthenticated) return <>{children}</>;
  return (
    <div style={{ background: "#111", border: "1px solid #1a1a1a", padding: 20, textAlign: "center" }}>
      <p style={{ fontSize: "0.85rem", color: "#aaa" }}>Connecte-toi pour finaliser ta commande Avenue Kennedy</p>
      <motion.button onClick={() => setShowGate(true)} className="btn-primary" style={{ marginTop: 12 }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>Se connecter</motion.button>
      {showGate && (
        <div style={{ marginTop: 16 }}>
          <AuthGate onAuthed={() => setShowGate(false)}><span style={{ display: "none" }} /></AuthGate>
          {/* auto-open gate */}
        </div>
      )}
    </div>
  );
}
