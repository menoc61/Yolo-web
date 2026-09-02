"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useSectionReveal } from "@/hooks/useAnimations";

export default function ServicesPage() {
  const serviceRefs = useRef<(React.RefObject<HTMLElement> | null)[]>([]);
  const shouldReduce = useReducedMotion();

  useEffect(() => {
    serviceRefs.current = [
      document.querySelector('[data-service="01"]'),
      document.querySelector('[data-service="02"]'),
      document.querySelector('[data-service="03"]'),
      document.querySelector('[data-service="04"]'),
    ];
  }, []);

  useSectionReveal({
    ref: serviceRefs,
    delay: 0.3,
    duration: 0.8,
    ease: "power3.out",
    start: "top 85%",
    scrub: 0.5,
  });

  const delivery = [
    {
      zone: "Yaoundé & environs",
      time: "24-48h",
      description: "Livraison express Avenue Kennedy et toute la capitale. Paiement à la livraison disponible (Cash on Delivery).",
      price: "2 000 FCFA",
      note: "Gratuit dès 50 000 FCFA",
    },
    {
      zone: "Cameroun (toutes régions)",
      time: "48-72h",
      description: "Expédition sécurisée dans tout le Cameroun via nos partenaires. Suivi disponible dans ton profil → Suivi.",
      price: "5 000 FCFA",
      note: "Gratuit dès 100 000 FCFA",
    },
    {
      zone: "CEMAC (Congo, Gabon, Tchad…)",
      time: "5-7 jours",
      description: "Livraison régionale via partenaires certifiés CEMAC. Droits et formalités gérés par YOLO Avenue Kennedy.",
      price: "15 000 FCFA",
      note: "Sur devis hors zone",
    },
    {
      zone: "Click & Collect",
      time: "Le jour même",
      description: "Commande en ligne, retrait gratuit à notre store Avenue Kennedy. Prêt en 2h — reçois une notif WhatsApp.",
      price: "Gratuit",
      note: "Avenue Kennedy, Yaoundé",
    },
  ];

  return (
    <div className="page-content">
      <div className="container">
        <div className="products-section__label">What We Offer</div>
        <h1 className="page-title">Livraison & Services</h1>

        <p style={{ fontSize: "0.9rem", lineHeight: 1.9, color: "#666", maxWidth: 640, marginBottom: 40 }}>
          YOLO livre partout — à Yaoundé, dans tout le Cameroun et la CEMAC. Suis chaque commande
          depuis ton profil, paye en FCFA (Visa, Orange Money, MTN MoMo ou Cash) et récupère en store
          gratuitement en 2h.
        </p>

        <div>
          {delivery.map((svc, i) => (
            <div
              key={svc.zone}
              ref={(el) => {
                if (el && serviceRefs.current[i] === undefined) {
                  serviceRefs.current[i] = el;
                }
              }}
              data-service={String(i + 1)}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 2fr 1fr auto",
                gap: 32,
                alignItems: "center",
                padding: "36px 0",
                borderBottom: "1px solid #1a1a1a",
              }}
            >
              <div>
                <div style={{ fontSize: "0.6rem", letterSpacing: "0.3em", color: "#333", fontWeight: 600, marginBottom: 10 }}>
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 style={{ fontSize: "clamp(1rem, 1.8vw, 1.4rem)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  {svc.zone}
                </h3>
                <div style={{ fontSize: "0.7rem", color: "#4ade80", letterSpacing: "0.08em", fontWeight: 700, marginTop: 8 }}>
                  {svc.time}
                </div>
              </div>
              <p style={{ fontSize: "0.82rem", lineHeight: 1.9, color: "#555", fontWeight: 300, maxWidth: 520 }}>
                {svc.description}
              </p>
              <div style={{ fontSize: "0.8rem", color: "#aaa", letterSpacing: "0.05em", fontWeight: 700, whiteSpace: "nowrap" }}>
                {svc.price}
              </div>
              <div style={{ fontSize: "0.62rem", color: "#555", whiteSpace: "nowrap", padding: "6px 10px", border: "1px solid #222" }}>
                {svc.note}
              </div>
            </div>
          ))}
        </div>

        {/* App / Website CTA */}
        <div
          style={{
            marginTop: 80,
            background: "#0d0d0d",
            border: "1px solid #1a1a1a",
            padding: "56px 48px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "0.6rem", letterSpacing: "0.3em", color: "#555", textTransform: "uppercase", marginBottom: 16 }}>
            Besoin de livrer vite ?
          </div>
          <p
            style={{
              fontSize: "clamp(1.2rem, 2.4vw, 1.8rem)",
              fontWeight: 300,
              color: "#ccc",
              lineHeight: 1.6,
              maxWidth: 560,
              margin: "0 auto 32px",
            }}
          >
            Télécharge l&apos;app YOLO pour suivre tes livraisons en temps réel, ou passe sur le site
            web pour commander en 1 clic.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="https://yolo.co" className="btn-primary" style={{ textDecoration: "none" }}>
              Visiter yolo.co →
            </a>
            <a
              href="https://wa.me/237699000000?text=Bonjour%20YOLO%20—%20je%20veux%20télécharger%20l%27app"
              target="_blank"
              className="btn-secondary"
              style={{ textDecoration: "none", color: "#25D366", borderColor: "#25D366" }}
            >
              Télécharger l&apos;app · WhatsApp
            </a>
          </div>
          <p style={{ fontSize: "0.65rem", color: "#555", marginTop: 24, letterSpacing: "0.05em" }}>
            Paiement FCFA · Visa · Orange Money · MTN MoMo · Avenue Kennedy, Yaoundé · hello@yolo.co
          </p>
        </div>
      </div>
    </div>
  );
}