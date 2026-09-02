"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { useSectionReveal } from "@/hooks/useAnimations";

export default function ApproachPage() {
  const steps = [
    {
      number: "01",
      title: "Select",
      description:
        "Nous passons des mois à évaluer les matériaux, les makers et les méthodes avant d'ajouter quoi que ce soit à la collection. Si ça ne respecte pas nos standards, ça ne part pas.",
      details: [
        "Audit sourcing 12 critères (matériau, éthique, durabilité)",
        "3 échantillons minimum testés à Avenue Kennedy",
        "Fournisseurs locaux Cameroun privilégiés",
        "Zéro greenwashing — fiche provenance réelle",
      ],
    },
    {
      number: "02",
      title: "Test",
      description:
        "Chaque produit est testé en conditions réelles — par notre équipe et un petit groupe d'early adopters. On écoute ce qui casse, ce qui s'use et ce qui ne va pas.",
      details: [
        "14 jours d'usage quotidien par 5 testeurs",
        "Feedback WhatsApp rapide + notation 5 étoiles",
        "Tests climat Yaoundé (chaleur + humidité)",
        "Rapport de test partagé en interne",
      ],
    },
    {
      number: "03",
      title: "Refine",
      description:
        "Sur la base des retours, nous travaillons avec nos makers pour améliorer le produit avant la collection complète. Aucun compromis sur la qualité.",
      details: [
        "Itération avec les ateliers partenaires",
        "Mise à jour matières / coutures / finitions",
        "Re-test après modification (si besoin)",
        "Validation finale avant mise en ligne FCFA",
      ],
    },
    {
      number: "04",
      title: "Ship",
      description:
        "Les produits sont expédiés depuis notre store à Avenue Kennedy, Yaoundé. Emballage minimal, soin maximal. Chaque commande est préparée à la main.",
      details: [
        "Livraison 24-48h Yaoundé · 48-72h Cameroun",
        "Suivi en temps réel dans ton profil",
        "Paiement FCFA : Visa, OM, MoMo, Cash",
        "Retrait gratuit en store en 2h",
      ],
    },
  ];

  const stepRefs = useRef<(React.RefObject<HTMLElement> | null)[]>([]);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const shouldReduce = useReducedMotion();

  useEffect(() => {
    stepRefs.current = [
      document.querySelector('[data-step="01"]'),
      document.querySelector('[data-step="02"]'),
      document.querySelector('[data-step="03"]'),
      document.querySelector('[data-step="04"]'),
    ];
  }, []);

  useSectionReveal({
    ref: stepRefs,
    delay: 0.2,
    duration: 0.8,
    ease: "power3.out",
    start: "top 85%",
    scrub: 0.5,
  });

  useEffect(() => {
    if (activeStep === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveStep(null);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [activeStep]);

  const active = activeStep !== null ? steps[activeStep] : null;

  return (
    <div className="page-content">
      <div className="container">
        <div className="products-section__label">Notre Processus</div>
        <h1 className="page-title">L&apos;Approche</h1>
        <p style={{ fontSize: "0.85rem", color: "#666", marginBottom: 40, maxWidth: 520 }}>
          Touche une étape pour voir le détail complet du processus — de la sélection à la livraison Avenue Kennedy.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              ref={(el) => {
                if (el && stepRefs.current[index] === undefined) {
                  stepRefs.current[index] = el;
                }
              }}
              data-step={step.number}
              onClick={() => setActiveStep(index)}
              whileHover={shouldReduce ? undefined : { y: -4 }}
              whileTap={shouldReduce ? undefined : { scale: 0.985 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setActiveStep(index)}
              aria-expanded={activeStep === index}
              aria-label={`Détails de l'étape ${step.number} — ${step.title}`}
              style={{
                background: "#0d0d0d",
                padding: "48px 40px",
                border: "1px solid #161616",
                cursor: "pointer",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ fontSize: "0.65rem", letterSpacing: "0.3em", color: "#333", fontWeight: 600 }}>
                  {step.number}
                </div>
                <motion.div animate={{ x: 0 }} style={{ color: "#444", fontSize: "0.8rem" }}>+</motion.div>
              </div>
              <h3
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: 20,
                }}
              >
                {step.title}
              </h3>
              <p
                style={{
                  fontSize: "0.85rem",
                  lineHeight: 1.9,
                  color: "#555",
                  fontWeight: 300,
                }}
              >
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom sheet */}
      <AnimatePresence>
        {active && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setActiveStep(null)}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.72)",
                backdropFilter: "blur(6px)",
                zIndex: 90,
              }}
              aria-hidden="true"
            />
            <motion.div
              initial={shouldReduce ? false : { y: "100%" }}
              animate={{ y: "0%" }}
              exit={shouldReduce ? undefined : { y: "100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 34 }}
              role="dialog"
              aria-modal="true"
              aria-label={`Étape ${active.number} — ${active.title}`}
              style={{
                position: "fixed",
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 95,
                background: "#111",
                borderTop: "1px solid #1e1e1e",
                padding: "32px 24px calc(32px + env(safe-area-inset-bottom))",
                maxHeight: "82vh",
                overflowY: "auto",
              }}
            >
              <div style={{ maxWidth: 560, margin: "0 auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ fontSize: "0.65rem", letterSpacing: "0.3em", color: "#666", fontWeight: 600 }}>
                    Étape {active.number} / 04
                  </div>
                  <motion.button
                    onClick={() => setActiveStep(null)}
                    aria-label="Fermer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{ background: "none", border: "none", color: "#888", fontSize: "1.2rem", cursor: "pointer", width: 40, height: 40 }}
                  >
                    ✕
                  </motion.button>
                </div>
                <h2 style={{ fontSize: "1.6rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 12 }}>
                  {active.title}
                </h2>
                <p style={{ fontSize: "0.85rem", lineHeight: 1.9, color: "#777", fontWeight: 300 }}>
                  {active.description}
                </p>
                <ul style={{ listStyle: "none", marginTop: 24, padding: 0, borderTop: "1px solid #1e1e1e" }}>
                  {active.details.map((d) => (
                    <li key={d} style={{ display: "flex", gap: 12, padding: "14px 0", borderBottom: "1px solid #1e1e1e", fontSize: "0.82rem", color: "#aaa" }}>
                      <span style={{ color: "#4ade80", fontSize: "0.8rem" }}>✓</span>
                      {d}
                    </li>
                  ))}
                </ul>
                <div style={{ fontSize: "0.65rem", color: "#555", marginTop: 20, letterSpacing: "0.05em", lineHeight: 1.7 }}>
                  Avenue Kennedy, Yaoundé · yolo.co · Paiement FCFA (Visa · OM · MoMo · Cash)
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}