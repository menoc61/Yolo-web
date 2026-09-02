"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const NAV_LINKS = [
  { href: "/products", label: "Products" },
  { href: "/about", label: "About" },
  { href: "/approach", label: "Approach" },
  { href: "/services", label: "Services" },
];

export function SiteNav() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const linksRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const openNav = () => {
    if (!overlayRef.current || !closeRef.current) return;
    const overlay = overlayRef.current;

    // Reset positions first
    gsap.set(overlay, { display: "flex" });
    gsap.set(overlay, { y: "-100%" });
    gsap.set(linksRef.current, { y: "110%", opacity: 0 });

    document.body.style.overflow = "hidden";

    const tl = gsap.timeline();
    tlRef.current = tl;

    tl.to(overlay, { y: "0%", duration: 0.75, ease: "expo.inOut" })
      .fromTo(
        closeRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.35 },
        "-=0.2"
      )
      .fromTo(
        linksRef.current,
        { y: "110%", opacity: 0 },
        {
          y: "0%",
          opacity: 1,
          duration: 0.7,
          ease: "expo.out",
          stagger: 0.07,
        },
        "-=0.3"
      );

    setIsOpen(true);
  };

  const closeNav = () => {
    if (!overlayRef.current || !closeRef.current) return;
    const overlay = overlayRef.current;

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(overlay, { display: "none", y: "-100%" });
        document.body.style.overflow = "";
      },
    });
    tlRef.current = tl;

    tl.to(closeRef.current, { opacity: 0, duration: 0.2 })
      .to(
        overlay,
        { y: "-100%", duration: 0.6, ease: "expo.inOut" },
        "-=0.05"
      )
      .set(closeRef.current, { opacity: 0 });

    setIsOpen(false);
  };

  // Keyboard close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) closeNav();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen]);

  // Initial state: hide overlay off-screen
  useEffect(() => {
    if (overlayRef.current) {
      gsap.set(overlayRef.current, { display: "none", y: "-100%" });
    }
  }, []);

  return (
    <>
      {/* Full-screen overlay */}
      <nav
        ref={overlayRef}
        className={`nav-overlay${isOpen ? " is-open" : ""}`}
        aria-label="Main navigation"
      >
        <div className="container nav-overlay__inner">
          {/* Links column */}
          <ul className="nav-links">
            {NAV_LINKS.map((link, i) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  ref={(el) => { linksRef.current[i] = el; }}
                  onClick={closeNav}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Contact column */}
          <div>
            <div className="nav-contact__label">Get in touch</div>
            <a href="mailto:hello@yolo.co" className="nav-contact__item">
              hello@yolo.co
            </a>
            <a href="tel:+41795102870" className="nav-contact__item">
              +41 79 510 28 70
            </a>
            <div
              className="nav-contact__item"
              style={{ color: "#333", marginTop: 24, lineHeight: 1.8, fontSize: "0.8rem" }}
            >
              Route du Jura 49
              <br />
              1700 Fribourg
              <br />
              Switzerland
            </div>
          </div>
        </div>

        {/* Close button */}
        <button
          ref={closeRef}
          onClick={closeNav}
          aria-label="Close menu"
          style={{
            position: "absolute",
            top: 40,
            right: 40,
            background: "none",
            border: "none",
            color: "#fff",
            fontSize: "1.4rem",
            fontWeight: 300,
            cursor: "pointer",
            opacity: 0,
            lineHeight: 1,
            padding: 4,
          }}
        >
          ✕
        </button>
      </nav>

      {/* Hamburger trigger (rendered inside SiteHeader via inline style hack — we also expose via document) */}
      {/* We mount the hamburger in SiteHeader; this component only needs to expose open/close */}
      {/* Re-export openNav for use by a client trigger component */}
    </>
  );
}

// Separate trigger component to be used in header
export function NavTrigger({ onClick }: { onClick: () => void }) {
  return (
    <div
      className="hamburger-menu"
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label="Open menu"
      onKeyDown={(e) => e.key === "Enter" && onClick()}
    >
      <span />
      <span />
    </div>
  );
}
