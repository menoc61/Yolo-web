"use client";
import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const shouldReduce = useReducedMotion();
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setStatus("error"); return; }
    setStatus("loading");
    await new Promise(r=>setTimeout(r, 900));
    setStatus("success");
  };
  return (
    <section style={{ background: "#111", borderTop: "1px solid #151515", borderBottom: "1px solid #151515", padding: "48px 0" }}>
      <div className="container" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "center" }}>
        <div>
          <div style={{ fontSize: "0.6rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "#666", marginBottom: 8 }}>Newsletter · yolo.co</div>
          <h3 style={{ fontSize: "1.6rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>Reste connecté — Avenue Kennedy</h3>
          <p style={{ color: "#666", fontSize: "0.85rem", marginTop: 8, lineHeight: 1.6 }}>Promo codes, drops, -20% membre WhatsApp. Prix en FCFA.</p>
        </div>
        <form onSubmit={submit} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <input value={email} onChange={e=>{setEmail(e.target.value); if(status!=="idle") setStatus("idle");}} placeholder="ton@email.com" style={{ width: "100%", background: "#0b0b0b", border: `1px solid ${status==="error"?"#ef4444":"#222"}`, color: "#fff", padding: "14px 14px", fontSize: "0.8rem", outline: "none" }} aria-invalid={status==="error"} />
            <AnimatePresence>
              {status==="error" && <motion.p initial={{ opacity:0, y:-4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} style={{ color: "#ef4444", fontSize: "0.7rem", marginTop: 6 }}>E-mail invalide</motion.p>}
              {status==="success" && <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} style={{ color: "#4ade80", fontSize: "0.7rem", marginTop: 6 }}>Merci ! Vérifie ta boite · Bienvenue sur yolo.co</motion.p>}
            </AnimatePresence>
          </div>
          <motion.button type="submit" disabled={status==="loading"||status==="success"} className="btn-primary" style={{ height: 48, minWidth: 140, display: "grid", placeItems: "center" }} whileTap={shouldReduce?undefined:{scale:0.97}} whileHover={shouldReduce?undefined:{scale:1.02}}>
            {status==="loading" ? <span className="h-4 w-4 rounded-full border-2 border-black/20 border-t-black animate-spin" /> : status==="success" ? "Inscrit ✓" : "S'inscrire"}
          </motion.button>
        </form>
      </div>
      <div className="container" style={{ marginTop: 20, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <a href="https://wa.me/237699000000?text=Je%20veux%20rejoindre%20le%20groupe%20YOLO%20WhatsApp%20Avenue%20Kennedy" target="_blank" style={{ background: "#25D366", color: "#0b0b0b", padding: "10px 16px", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", textDecoration: "none", display: "inline-flex", gap: 8, alignItems: "center" }}>
          <span style={{ width: 8, height: 8, background: "#0b0b0b", borderRadius: "50%" }} /> Rejoindre WhatsApp
        </a>
        <span style={{ fontSize: "0.65rem", color: "#333", alignSelf: "center" }}>Avenue Kennedy, Yaoundé · Mobile app bientôt · yolo.co</span>
      </div>
    </section>
  );
}
