"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { motion } from "motion/react";
import { useLineTextAnimation, useStaggeredFadeIn } from "@/hooks/useAnimations";

export function HeroSection() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);

  // Intro overlay animation (top panels up, bottom panels down)
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.2 });

      tl.to(".intro-panel--tl, .intro-panel--tm, .intro-panel--tr", 1.2, {
        y: "-100%",
        ease: "expo.inOut",
        stagger: 0.08,
      })
        .to(".intro-panel--bl, .intro-panel--bm, .intro-panel--br", 1.2, {
          y: "100%",
          ease: "expo.inOut",
          stagger: 0.08,
        }, "-=1.0")
        .set("body", { visibility: "visible" }, 0);

      return () => {
        tl.kill();
      };
    });

    return () => ctx.revert();
  }, []);

  // Title lines animation with skewY
  useLineTextAnimation(titleRef, {
    delay: 0.5,
    duration: 1.3,
    ease: "power4.out",
    stagger: 0.18,
    skewY: 7,
  });

  // Subtitle and CTA fade in
  useStaggeredFadeIn([subtitleRef, ctaRef, badgeRef, statsRef], {
    delay: 0.7,
    duration: 0.8,
    ease: "power3.out",
    stagger: 0.1,
    y: 20,
  });

  return (
    <section className="hero">
      {/* ── Intro Overlay Panels ── */}
      <div className="intro-overlay" aria-hidden="true">
        <div className="intro-panel intro-panel--tl" />
        <div className="intro-panel intro-panel--tm" />
        <div className="intro-panel intro-panel--tr" />
        <div className="intro-panel intro-panel--bl" />
        <div className="intro-panel intro-panel--bm" />
        <div className="intro-panel intro-panel--br" />
      </div>

      {/* ── Hero Content ── */}
      <div className="container hero__content">
        <div ref={badgeRef} className="hero__badge">
          <span className="hero__badge-dot" />
          Premium Electronics & Goods
        </div>

        <h1 ref={titleRef} className="hero__title">
          <span>Goods that</span>
          <span>mean something.</span>
        </h1>

        <p ref={subtitleRef} className="hero__subtitle">
          Premium electronics and lifestyle products — curated with intent, delivered with care.
        </p>

        <div ref={ctaRef} className="hero__cta">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }} transition={{ type: "spring", stiffness: 400, damping: 30 }}>
            <Link href="/products" style={{ display: "inline-flex" }}>
              Explore the collection
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }} transition={{ type: "spring", stiffness: 400, damping: 30 }}>
            <Link href="/about" className="hero__cta-secondary">
              Our story
            </Link>
          </motion.div>
        </div>

        <div ref={statsRef} className="hero__stats">
          <div className="hero__stat">
            <span className="hero__stat-number">200+</span>
            <span className="hero__stat-label">Products</span>
          </div>
          <div className="hero__stat-divider" />
          <div className="hero__stat">
            <span className="hero__stat-number">50k+</span>
            <span className="hero__stat-label">Customers</span>
          </div>
          <div className="hero__stat-divider" />
          <div className="hero__stat">
            <span className="hero__stat-number">4.9</span>
            <span className="hero__stat-label">Rating</span>
          </div>
        </div>
      </div>

      <div className="hero__scroll">Scroll</div>
    </section>
  );
}
