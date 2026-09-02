"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import gsap from "gsap";
import { motion } from "motion/react";
import { useCartStore } from "@/stores/cart";
import { useAuthStore } from "@/stores/auth";
import { useI18n } from "@/context/I18nContext";
import { CONTACT_PHONE, CONTACT_PHONE_TEL, CONTACT_WHATSAPP } from "@/lib/site";

// Never-changing subscription used by the hydration guard below.
const subscribe = () => () => {};

const NAV_LINKS = [
  { href: "/products", labelKey: "nav.products" as const },
  { href: "/about", labelKey: "nav.about" as const },
  { href: "/approach", labelKey: "nav.approach" as const },
  { href: "/services", labelKey: "nav.services" as const },
];

export function SiteHeader() {
  const { locale, setLocale, t } = useI18n();
  const itemCount = useCartStore((s) => s.itemCount());
  const openCart = useCartStore((s) => s.openCart);
  const { user, isAuthenticated } = useAuthStore();

  const overlayRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  // Hydration guard: false during SSR/hydration, true once mounted on the
  // client. Avoids setState-in-effect cascade for the client-only cart badge.
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);

  const openNav = () => {
    if (!overlayRef.current) return;
    const overlay = overlayRef.current;
    gsap.set(overlay, { display: "flex" });
    gsap.set(overlay, { y: "-100%" });
    gsap.set(linksRef.current, { y: "110%", opacity: 0 });
    document.body.style.overflow = "hidden";

    const tl = gsap.timeline();
    tl.to(overlay, { y: "0%", duration: 0.75, ease: "expo.inOut" }).fromTo(
      linksRef.current,
      { y: "110%", opacity: 0 },
      { y: "0%", opacity: 1, duration: 0.7, ease: "expo.out", stagger: 0.07 },
      "-=0.4",
    );
    setIsOpen(true);
  };

  const closeNav = () => {
    if (!overlayRef.current) return;
    const overlay = overlayRef.current;
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(overlay, { display: "none", y: "-100%" });
        document.body.style.overflow = "";
      },
    });
    tl.to(overlay, { y: "-100%", duration: 0.6, ease: "expo.inOut" });
    setIsOpen(false);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) closeNav();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen]);

  useEffect(() => {
    if (overlayRef.current)
      gsap.set(overlayRef.current, { display: "none", y: "-100%" });
  }, []);

  return (
    <>
      {/* ── Header ── */}
      <header className="header">
        <div className="container">
          <div className="header__inner">
            <div className="header__logo">
              <Link href="/">YOLO</Link>
            </div>
            <div className="header__actions">
              {/* Language Toggle */}
              <motion.button
                className="header__lang-btn"
                onClick={() => setLocale(locale === "en" ? "fr" : "en")}
                aria-label="Toggle language"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
              >
                {locale === "en" ? "FR" : "EN"}
              </motion.button>

              <motion.button
                className="header__cart-btn"
                onClick={openCart}
                aria-label="Open cart"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
                {mounted && itemCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: -4,
                      right: -6,
                      background: "#fff",
                      color: "#0b0b0b",
                      fontSize: "0.55rem",
                      fontWeight: 700,
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {itemCount}
                  </span>
                )}
              </motion.button>

              <motion.a
                href={isAuthenticated ? "/profile" : "#"}
                onClick={(e) => {
                  if (!isAuthenticated) {
                    e.preventDefault();
                    window.dispatchEvent(new CustomEvent("yolo:open-auth"));
                  }
                }}
                aria-label={isAuthenticated ? "Mon profil" : "Se connecter"}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: "1px solid #222",
                  display: "grid",
                  placeItems: "center",
                  background: isAuthenticated ? "#fff" : "transparent",
                  color: isAuthenticated ? "#0b0b0b" : "#fff",
                  textDecoration: "none",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
              >
                {isAuthenticated && user ? (
                  <span style={{ fontSize: "0.7rem", fontWeight: 700 }}>{user.name?.charAt(0)?.toUpperCase() || "U"}</span>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M20 21a8 8 0 0 0-16 0" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                )}
              </motion.a>

              {/* Hamburger — same button toggles open/close */}
              <motion.button
                className={`hamburger-menu ${isOpen ? "is-open" : ""}`}
                onClick={isOpen ? closeNav : openNav}
                aria-label={isOpen ? "Close menu" : "Open menu"}
                aria-expanded={isOpen}
                style={{
                  marginLeft: 8,
                  background: "none",
                  border: "none",
                  zIndex: 60,
                  position: "relative",
                }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
              >
                <motion.span
                  animate={isOpen ? { rotate: 45, y: 4 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                />
                <motion.span
                  animate={
                    isOpen ? { rotate: -45, y: -4 } : { rotate: 0, y: 0 }
                  }
                  transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                />
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Full-screen Nav Overlay ── */}
      <nav
        ref={overlayRef}
        className={`nav-overlay${isOpen ? " is-open" : ""}`}
        aria-label="Main navigation"
      >
        <div className="container nav-overlay__inner">
          <ul className="nav-links">
            {NAV_LINKS.map((link, i) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  ref={(el) => {
                    linksRef.current[i] = el;
                  }}
                  onClick={closeNav}
                >
                  {t(link.labelKey)}
                </Link>
              </li>
            ))}
          </ul>
          <div>
            <div className="nav-contact__label">Get in touch</div>
            <a href="mailto:hello@yolo.co" className="nav-contact__item">
              hello@yolo.co
            </a>
            <a href={`tel:${CONTACT_PHONE_TEL}`} className="nav-contact__item">
              {CONTACT_PHONE}
            </a>
            <a
              href={CONTACT_WHATSAPP}
              target="_blank"
              rel="noopener"
              className="nav-contact__item"
              style={{
                color: "#25D366",
                display: "flex",
                gap: 8,
                alignItems: "center",
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  background: "#25D366",
                  borderRadius: "50%",
                  display: "inline-block",
                }}
              />{" "}
              WhatsApp
            </a>
            <div
              className="nav-contact__item"
              style={{
                color: "#333",
                marginTop: 24,
                lineHeight: 1.8,
                fontSize: "0.8rem",
              }}
            >
              Avenue Kennedy
              <br />
              Yaoundé, Centre
              <br />
              Cameroun — yolo.co
            </div>
            <div className="nav-contact__item" style={{ marginTop: 16 }}>
              <Link
                href="/contact"
                onClick={closeNav}
                style={{
                  border: "1px solid #333",
                  padding: "10px 18px",
                  fontSize: "0.7rem",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "#fff",
                  textDecoration: "none",
                }}
              >
                Contact us →
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
