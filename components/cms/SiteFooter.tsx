"use client";

import Link from "next/link";
import { useState } from "react";

const FOOTER_LINKS = [
  { href: "/products", label: "Products" },
  { href: "/about", label: "About" },
  { href: "/approach", label: "Approach" },
  { href: "/services", label: "Services" },
];

const FOOTER_SOCIALS = [
  {
    label: "WhatsApp",
    href: "https://wa.me/237699000000",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20.52 3.48A11.86 11.86 0 0 0 12.1 0C5.52 0 .12 5.4.12 12.08c0 2.14.56 4.22 1.62 6.05L.03 24l6.1-1.6a12.05 12.05 0 0 0 5.97 1.8h.01c6.58 0 11.98-5.4 11.98-12.08 0-3.22-1.26-6.25-3.47-8.64Zm-8.42 18.56h-.01a9.99 9.99 0 0 1-5.09-1.39l-.37-.22-3.62.95 1-3.52-.24-.36A9.96 9.96 0 0 1 2.15 12c0-5.52 4.5-10.02 10.03-10.02 2.68 0 5.2 1.04 7.09 2.92a10.03 10.03 0 0 1 2.94 7.11c0 5.52-4.5 10.02-10.03 10.02Zm5.52-7.52c-.3-.15-1.78-.88-2.05-.98-.27-.1-.46-.15-.67.15-.2.3-.78.98-.96 1.18-.18.2-.35.22-.66.08-.3-.15-1.29-.47-2.46-1.49-.91-.81-1.52-1.8-1.7-2.1-.18-.3-.02-.46.13-.61.13-.13.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.78.37-.27.3-1.02 1-1.02 2.45 0 1.46 1.04 2.85 1.18 3.05.15.2 2.04 3.1 4.94 4.35.69.3 1.23.48 1.65.62.7.22 1.34.19 1.85.11.57-.08 1.78-.72 2.03-1.42.25-.7.25-1.3.18-1.42-.07-.12-.27-.2-.57-.35Z" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://instagram.com/yolo.co",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3.5A5.5 5.5 0 1 1 6.5 13 5.5 5.5 0 0 1 12 7.5Zm0 2A3.5 3.5 0 1 0 15.5 13 3.5 3.5 0 0 0 12 9.5Zm5.25-3.25a1.25 1.25 0 1 1-1.25 1.25 1.25 1.25 0 0 1 1.25-1.25Z" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "https://facebook.com/yolo.co",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M13.5 22v-8h2.7l.4-3.1h-3.1V7.3c0-.9.3-1.5 1.6-1.5H16V2.9c-.3-.1-1.3-.2-2.6-.2-2.6 0-4.4 1.6-4.4 4.5v2.5H6.5V14h2.5v8h4.5Z" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: "Telegram",
    href: "https://t.me/yolo_co",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M21.6 4.1c.3-1.2-1-2.2-2.1-1.5L2.9 10.9c-1.2.6-1.3 2.3-.1 2.9l4.3 1.6 1.7 5.1c.2.7.9 1 1.5.6l2.5-2.1 4.7 3.5c.8.6 1.9.1 2.1-.9l2.2-13.5Zm-2.6 2.1L12 14.4l-.3 2.9-1.7-5.2 9.8-5.9Z" fill="currentColor" />
      </svg>
    ),
  },
];

export function SiteFooter() {
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  return (
    <footer className="footer footer--primary">
      <div className="container footer__container">
        <div className="footer__inner">
          <div className="footer__brand-area">
            <div className="footer__brand">YOLO</div>
            <p className="footer__tagline">
              Premium physical goods, crafted with intent.
            </p>
            <address className="footer__address">
              Avenue Kennedy, Yaoundé — Cameroun
            </address>
          </div>

          <nav className="footer__links" aria-label="Footer navigation">
            {FOOTER_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="footer__link">
                {l.label}
              </Link>
            ))}
            <Link href="/contact" className="footer__link">
              Contact
            </Link>
          </nav>

          <div className="footer__socials" aria-label="Social media">
            {FOOTER_SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="footer__social"
                aria-label={s.label}
                title={s.label}
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        <div className="footer__bottom">
          <div className="footer__copyright">
            © {new Date().getFullYear()} YOLO — Avenue Kennedy, Yaoundé, Cameroun ·
            yolo.co • Livraison Yaoundé
          </div>

          <div className="footer__actions">
            <a
              href="https://wa.me/237699000000"
              target="_blank"
              rel="noopener noreferrer"
              className="footer__btn"
            >
              Rejoindre WhatsApp
            </a>

            <button
              className="footer__newsletter"
              onClick={() => setNewsletterSubscribed(true)}
              type="button"
            >
              {newsletterSubscribed ? "Abonné" : "Newsletter"}
            </button>
          </div>
        </div>
      </div>

      <div className="footer__watermark" aria-hidden="true">
        YOLO
      </div>
    </footer>
  );
}