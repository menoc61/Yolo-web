"use client";
import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { z } from "zod";
import { toast } from "sonner";

const contactSchema = z.object({
  name: z.string().min(2, "Nom requis (2+ caractères)"),
  email: z.string().email("Email invalide"),
  message: z.string().min(10, "Message trop court (10+ caractères)"),
});

export function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const shouldReduce = useReducedMotion();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = contactSchema.safeParse(form);
    if (!result.success) {
      for (const issue of result.error.issues) {
        toast.error(issue.message);
      }
      return;
    }
    setStatus("loading");
    await new Promise((r) => setTimeout(r, 1100));
    setStatus("success");
    toast.success("Message envoyé — On te répond sur WhatsApp!");
    setForm({ name: "", email: "", message: "" });
    setTimeout(() => setStatus("idle"), 2500);
  };

  return (
    <form onSubmit={submit} noValidate style={{ background: "#111", border: "1px solid #1a1a1a", padding: 24, display: "grid", gap: 16 }}>
      <div>
        <label style={{ fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#666" }}>Nom</label>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ton nom" style={{ width: "100%", marginTop: 8, background: "#0b0b0b", border: "1px solid #222", color: "#fff", padding: "12px", fontSize: "0.85rem", outline: "none" }} />
      </div>
      <div>
        <label style={{ fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#666" }}>E-mail</label>
        <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="ton@email.com" style={{ width: "100%", marginTop: 8, background: "#0b0b0b", border: "1px solid #222", color: "#fff", padding: "12px", fontSize: "0.85rem", outline: "none" }} />
      </div>
      <div>
        <label style={{ fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#666" }}>Message</label>
        <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Comment peut-on t'aider ?" rows={4} style={{ width: "100%", marginTop: 8, background: "#0b0b0b", border: "1px solid #222", color: "#fff", padding: "12px", fontSize: "0.85rem", outline: "none", resize: "vertical" }} />
      </div>
      <motion.button type="submit" disabled={status === "loading"} className="btn-primary" style={{ width: "100%", display: "grid", placeItems: "center", minHeight: 52 }} whileTap={shouldReduce ? undefined : { scale: 0.98 }} whileHover={shouldReduce ? undefined : { scale: 1.01 }}>
        {status === "loading" ? <span className="h-4 w-4 rounded-full border-2 border-black/20 border-t-black animate-spin" /> : status === "success" ? "Envoyé ✓ — On te répond sur WhatsApp" : "Envoyer le message"}
      </motion.button>
      <p style={{ fontSize: "0.6rem", color: "#333", textAlign: "center" }}>Avenue Kennedy · yolo.co · Réponse &lt; 2h</p>
    </form>
  );
}
