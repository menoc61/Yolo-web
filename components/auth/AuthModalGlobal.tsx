"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth";
import { AnimatedInput } from "@/components/ui/AnimatedInput";

type AuthView = "login" | "signup" | "forgot";

export function AuthModalGlobal() {
  const { isAuthenticated, login, register, loginWithGoogle, resetPassword } = useAuthStore();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<AuthView>("login");
  const [form, setForm] = useState({ name: "", email: "user@yolo.co", password: "user123", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const shouldReduce = useReducedMotion();

  useEffect(() => {
    const handler = () => {
      if (!isAuthenticated) {
        setView("login");
        setOpen(true);
      }
    };
    window.addEventListener("yolo:open-auth", handler as EventListener);
    return () => window.removeEventListener("yolo:open-auth", handler as EventListener);
  }, [isAuthenticated]);

  useEffect(() => {
    if (!open) {
      setError(null);
      // Prefill login with demo creds (user@yolo.co / user123) to ease the login flow
      setForm(view === "login" ? { name: "", email: "user@yolo.co", password: "user123", confirm: "" } : { name: "", email: "", password: "", confirm: "" });
    }
  }, [open, view]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!/\S+@\S+\.\S+/.test(form.email)) {
      setError("E-mail invalide");
      return;
    }
    if (view === "signup") {
      if (!form.name.trim()) { setError("Nom requis"); return; }
      if (form.password.length < 6) { setError("Mot de passe : 6+ caractères"); return; }
      if (form.password !== form.confirm) { setError("Mots de passe différents"); return; }
      setLoading(true);
      const res = await register(form.name.trim(), form.email.trim(), form.password);
      setLoading(false);
      if (res.success) { setOpen(false); router.push("/profile"); }
      else setError(res.error || "Inscription impossible");
      return;
    }
    if (view === "forgot") {
      setLoading(true);
      const res = await resetPassword(form.email.trim());
      setLoading(false);
      if (res.success) { setOpen(false); router.push("/login"); }
      else setError(res.error || "Réinitialisation impossible");
      return;
    }
    setLoading(true);
    const res = await login(form.email.trim(), form.password);
    setLoading(false);
    if (res.success) setOpen(false);
    else setError(res.error || "E-mail ou mot de passe invalide");
  };

  const google = async () => {
    setLoading(true);
    const res = await loginWithGoogle();
    setLoading(false);
    if (res.success) { setOpen(false); router.push("/profile"); }
    else setError("Connexion Google impossible");
  };

  if (isAuthenticated) return null;

  const viewMeta = {
    login: { label: "Se connecter", hint: "Déjà client Avenue Kennedy ? Connecte-toi avec ton e-mail." },
    signup: { label: "Créer un compte", hint: "Premier passage ? Définis ton mot de passe pour créer ton profil yolo.co." },
    forgot: { label: "Mot de passe oublié", hint: "Entre ton e-mail — on t'envoie un lien de réinitialisation." },
  }[view];

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: "fixed", inset: 0, zIndex: 90, background: "rgba(0,0,0,0.7)", display: "grid", placeItems: "center", padding: 20, backdropFilter: "blur(8px)" }} onClick={() => setOpen(false)}>
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={shouldReduce ? false : { scale: 0.96, y: 12, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 12, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            style={{ background: "#111", border: "1px solid #1e1e1e", padding: 24, width: "100%", maxWidth: 420, display: "grid", gap: 16, maxHeight: "90vh", overflowY: "auto" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#666" }}>YOLO — Avenue Kennedy · Connexion</div>
              <motion.button onClick={() => setOpen(false)} aria-label="Fermer" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: "1rem" }}>✕</motion.button>
            </div>

            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, textTransform: "uppercase" }}>
              {view === "login" ? "Connecte-toi pour commander" : view === "signup" ? "Crée ton compte YOLO" : "Réinitialise le mot de passe"}
            </h3>
            <p style={{ fontSize: "0.8rem", color: "#777", lineHeight: 1.6 }}>{viewMeta.hint}</p>

            {/* View tabs */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 4, borderBottom: "1px solid #1e1e1e", paddingBottom: 12 }}>
              {(["login", "signup", "forgot"] as AuthView[]).map((v) => (
                <motion.button
                  key={v}
                  onClick={() => { setView(v); setError(null); }}
                  style={{
                    background: "none",
                    border: "none",
                    padding: "10px 0",
                    fontSize: "0.62rem",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    fontWeight: 700,
                    color: view === v ? "#fff" : "#555",
                    borderBottom: view === v ? "2px solid #fff" : "2px solid transparent",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                  whileTap={{ scale: 0.96 }}
                >
                  {v === "login" ? "Login" : v === "signup" ? "Inscription" : "Mot de passe"}
                </motion.button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.form
                key={view}
                onSubmit={submit}
                initial={shouldReduce ? false : { opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
                style={{ display: "grid", gap: 12 }}
              >
                {view === "signup" && (
                  <AnimatedInput label="Nom complet" id="am-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ton nom" />
                )}
                <AnimatedInput label="E-mail" id="am-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="ton@email.com" error={error && error.includes("E-mail") ? error : undefined} />
                {view !== "forgot" && (
                  <AnimatedInput label="Mot de passe" id="am-password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" error={error && !error.includes("E-mail") && !error.includes("différents") && !error.includes("6+") ? error : undefined} />
                )}
                {view === "signup" && (
                  <AnimatedInput label="Confirme le mot de passe" id="am-confirm" type="password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} placeholder="••••••••" />
                )}
                {error && view === "signup" && (error.includes("différents") || error.includes("Nom") || error.includes("6+")) && (
                  <p style={{ color: "#ef4444", fontSize: "0.68rem" }}>{error}</p>
                )}

                <motion.button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%", display: "grid", placeItems: "center" }} whileTap={shouldReduce ? undefined : { scale: 0.97 }}>
                  {loading ? <span className="h-4 w-4 rounded-full border-2 border-black/20 border-t-black animate-spin" /> : view === "login" ? "Se connecter →" : view === "signup" ? "Créer mon compte" : "Envoyer le lien"}
                </motion.button>
              </motion.form>
            </AnimatePresence>

            {view === "login" && (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ flex: 1, height: 1, background: "#1e1e1e" }} />
                  <span style={{ fontSize: "0.6rem", color: "#555", letterSpacing: "0.2em", textTransform: "uppercase" }}>or</span>
                  <div style={{ flex: 1, height: 1, background: "#1e1e1e" }} />
                </div>
                <motion.button
                  type="button"
                  onClick={google}
                  disabled={loading}
                  whileTap={shouldReduce ? undefined : { scale: 0.97 }}
                  style={{
                    width: "100%",
                    height: 48,
                    background: "transparent",
                    color: "#fff",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    border: "1px solid #333",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                  }}
                >
                  <svg width={16} height={16} viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z" />
                    <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z" />
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z" />
                  </svg>
                  Continue with Google
                </motion.button>
              </>
            )}

            <motion.button type="button" onClick={() => setOpen(false)} style={{ background: "none", border: "none", color: "#555", fontSize: "0.7rem", cursor: "pointer" }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>Plus tard</motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}