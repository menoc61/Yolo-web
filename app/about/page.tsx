"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { useSectionReveal } from "@/hooks/useAnimations";
import Link from "next/link";

const FAQ_ITEMS = [
  {
    q: "Combien de temps dure la livraison à Yaoundé ?",
    a: "La livraison à Yaoundé (Avenue Kennedy et environs) se fait en 24 à 48h — livraison express possible via moto sur commande. Hors Yaoundé, comptez 48 à 72h pour le reste du Cameroun.",
  },
  {
    q: "Quels moyens de paiement acceptez-vous ?",
    a: "Visa (paiement sécurisé Stripe), Orange Money, MTN Mobile Money et paiement à la livraison (Cash on Delivery). Tous les prix sont affichés en FCFA.",
  },
  {
    q: "Comment se passe le retour ou l'échange ?",
    a: "Tu disposes de 7 jours après réception pour échanger un produit dans son état d'origine (étiquettes intactes). Écris-nous sur WhatsApp au +7 901 180 53 50 pour lancer un échange.",
  },
  {
    q: "Les produits sont-ils garantis ?",
    a: "Oui — tout produit neuf est garanti 6 mois contre les défauts de fabrication. L'électronique bénéficie de 12 mois de garantie Avenue Kennedy.",
  },
  {
    q: "Puis-je devenir partenaire ou vendeur YOLO ?",
    a: "Absolument. Rends-toi sur la page Partenaire et remplis le formulaire — notre équipe te contacte sous 48h pour discuter de la mise en avant de tes produits sur yolo.co.",
  },
  {
    q: "Comment suivre ma commande ?",
    a: "Une fois la commande validée, connecte-toi à ton profil → onglet Suivi. Tu verras le statut en temps réel : confirmée, payée, expédiée, livrée. Tu reçois aussi une mise à jour sur WhatsApp.",
  },
];

export default function AboutPage() {
  const aboutRef = useRef<HTMLElement | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const shouldReduce = useReducedMotion();

  useSectionReveal({
    ref: aboutRef,
    delay: 0.5,
    duration: 0.8,
    ease: "power3.out",
    start: "top 80%",
    scrub: 0.5,
  });

  return (
    <div className="page-content">
      <div className="container">
        <div className="products-section__label">About</div>
        <h1 className="page-title">Who We Are</h1>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 80,
            alignItems: "start",
          }}
        >
          <div>
            <p
              style={{
                fontSize: "clamp(1.4rem, 2.5vw, 2rem)",
                fontWeight: 300,
                lineHeight: 1.6,
                color: "#ccc",
              }}
            >
              YOLO a été bâti sur une conviction : les choses que tu portes, transportes et utilises
              doivent avoir du sens.
            </p>
            <p
              style={{
                fontSize: "0.9rem",
                lineHeight: 1.9,
                color: "#555",
                marginTop: 32,
                fontWeight: 300,
              }}
            >
              Nous travaillons avec des makers indépendants et de petits ateliers pour créer des
              produits qui dépassent les tendances. Chaque pièce est sélectionnée pour son intégrité
              matérielle, son design fonctionnel et sa fabrication honnête.
            </p>
            <p
              style={{
                fontSize: "0.9rem",
                lineHeight: 1.9,
                color: "#555",
                marginTop: 20,
                fontWeight: 300,
              }}
            >
              Nous sommes basés à Avenue Kennedy, Yaoundé, Cameroun. Livraison 24-48h dans la
              capitale, paiement en FCFA, Mobile Money et à la livraison. Notre équipe est petite,
              nos standards ne le sont pas.
            </p>
          </div>
          <div>
            <div style={{ borderTop: "1px solid #1a1a1a", paddingTop: 32 }}>
              {[
                { label: "Fondée", value: "2023" },
                { label: "Siège", value: "Avenue Kennedy, Yaoundé, Cameroun" },
                { label: "Livraison", value: "24-48h Yaoundé · 48-72h Cameroun" },
                { label: "Paiement", value: "Visa · OM · MoMo · Cash" },
                { label: "Philosophie", value: "Moins, mais mieux." },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "14px 0",
                    borderBottom: "1px solid #1a1a1a",
                    fontSize: "0.8rem",
                  }}
                >
                  <span style={{ color: "#444", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    {item.label}
                  </span>
                  <span style={{ color: "#888", fontWeight: 600 }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ — collapsible accordion, micro-interactions */}
        <div style={{ marginTop: 80 }}>
          <div className="products-section__label">FAQ</div>
          <h2 style={{ fontSize: "1.8rem", fontWeight: 700, textTransform: "uppercase", marginBottom: 32 }}>
            Questions fréquentes
          </h2>
          <div style={{ borderTop: "1px solid #1a1a1a" }}>
            {FAQ_ITEMS.map((item, i) => {
              const open = openFaq === i;
              return (
                <div key={item.q} style={{ borderBottom: "1px solid #1a1a1a" }} data-anim>
                  <motion.button
                    onClick={() => setOpenFaq(open ? null : i)}
                    style={{
                      width: "100%",
                      padding: "20px 0",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 16,
                      textAlign: "left",
                    }}
                    whileTap={shouldReduce ? undefined : { scale: 0.995 }}
                  >
                    <span style={{ fontSize: "0.95rem", fontWeight: 600, color: "#ddd", letterSpacing: "0.02em" }}>
                      {item.q}
                    </span>
                    <motion.span
                      animate={open ? { rotate: 45 } : { rotate: 0 }}
                      transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                      style={{ color: "#888", fontSize: "1.2rem", flexShrink: 0 }}
                    >
                      +
                    </motion.span>
                  </motion.button>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                        style={{ overflow: "hidden" }}
                      >
                        <p style={{ fontSize: "0.85rem", lineHeight: 1.9, color: "#666", paddingBottom: 20, maxWidth: 640 }}>
                          {item.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
          <p style={{ fontSize: "0.75rem", color: "#666", marginTop: 24 }}>
            Une autre question ? <Link href="/contact" style={{ color: "#fff", textDecoration: "none" }}>Contacte-nous</Link> ou écris au{" "}
            <a href="https://wa.me/+79011805350" style={{ color: "#25D366", textDecoration: "none" }}>WhatsApp +7 901 180 53 50</a>
          </p>
        </div>
      </div>
    </div>
  );
}