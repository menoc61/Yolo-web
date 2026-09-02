"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { motion, AnimatePresence } from "motion/react";
import { useCartStore } from "@/stores/cart";
import { formatPrice } from "@/lib/currency";
import { applyPromo } from "@/lib/promo";

export function CartDrawer() {
  const isOpen = useCartStore((s) => s.isOpen);
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal());
  const itemCount = useCartStore((s) => s.itemCount());
  const closeCart = useCartStore((s) => s.closeCart);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart = useCartStore((s) => s.clearCart);
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState<string | null>(null);
  const [checkingPromo, setCheckingPromo] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Server + first client render agree on an empty cart; real (persisted) data
  // only appears after hydration/mount to avoid hydration mismatches.
  const liveItems = mounted ? items : [];
  const liveCount = mounted ? itemCount : 0;
  const liveSubtotal = mounted ? subtotal : 0;

  const overlayRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const isOpenRef = useRef(isOpen);
  isOpenRef.current = isOpen;

  useEffect(() => {
    const overlay = overlayRef.current;
    const drawer = drawerRef.current;
    if (!overlay || !drawer) return;

    if (isOpen) {
      document.body.style.overflow = "hidden";
      gsap.set(overlay, { display: "block" });
      gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" });
      gsap.fromTo(drawer, { x: "100%" }, { x: "0%", duration: 0.5, ease: "expo.out" });
    }
  }, [isOpen]);

  const handleClose = () => {
    const overlay = overlayRef.current;
    const drawer = drawerRef.current;
    if (!overlay || !drawer) return;

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(overlay, { display: "none" });
        document.body.style.overflow = "";
        closeCart();
      },
    });

    tl.to(drawer, { x: "100%", duration: 0.4, ease: "expo.in" })
      .to(overlay, { opacity: 0, duration: 0.25 }, "-=0.15");
  };

  return (
    <>
      {/* Backdrop */}
      <div
        ref={overlayRef}
        className="cart-overlay"
        onClick={handleClose}
        aria-hidden="true"
        style={{ display: isOpen ? "block" : "none" }}
      />

      {/* Drawer */}
      <aside
        ref={drawerRef}
        className="cart-drawer"
        aria-label="Shopping cart"
        style={{ transform: isOpen ? undefined : "translateX(100%)" }}
      >
        <div className="cart-drawer__header">
          <span className="cart-drawer__title">
            Cart — {liveCount} item{liveCount !== 1 ? "s" : ""}
          </span>
          <motion.button className="cart-drawer__close" onClick={handleClose} aria-label="Close cart" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
            ✕
          </motion.button>
        </div>

        <div className="cart-drawer__items">
          {liveItems.length === 0 ? (
            <div className="cart-drawer__empty">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="1.5">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              <span>Your cart is empty</span>
              <Link href="/products" onClick={handleClose} className="cart-drawer__empty-link">
                Browse products
              </Link>
            </div>
          ) : (
            liveItems.map((item) => (
              <div key={item.id} className="cart-item">
                <img
                  src={item.image}
                  alt={item.name}
                  className="cart-item__image"
                  width={72}
                  height={90}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="cart-item__name">{item.name}</div>
                  <div className="cart-item__meta">{item.category}</div>
                  <div className="cart-item__qty">
                    <motion.button onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label="Decrease" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>−</motion.button>
                    <span>{item.quantity}</span>
                    <motion.button onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label="Increase" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>+</motion.button>
                  </div>
                  <div className="cart-item__price">{formatPrice(item.price * item.quantity)}</div>
                </div>
                <motion.button className="cart-item__remove" onClick={() => removeItem(item.id)} aria-label="Remove" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
                  ✕
                </motion.button>
              </div>
            ))
          )}
        </div>

        {liveItems.length > 0 && (() => {
          const promo = promoApplied ? applyPromo(Math.round(liveSubtotal * 620), promoApplied) : null;
          const total = promo ? promo.total : Math.round(liveSubtotal * 620);
          const discount = promo?.discount ?? 0;
          return (
          <div className="cart-drawer__footer">
            <div className="cart-drawer__total">
              <span className="cart-drawer__total-label">Sous-total</span>
              <span className="cart-drawer__total-amount">{formatPrice(liveSubtotal)}</span>
            </div>
            {/* Promo code with micro interaction */}
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <input value={promoCode} onChange={(e) => setPromoCode(e.target.value.toUpperCase())} placeholder="CODE PROMO (YOLO10)" style={{ flex: 1, background: "#1a1a1a", border: "1px solid #222", color: "#fff", padding: "10px 12px", fontSize: "0.7rem", letterSpacing: "0.08em", outline: "none" }} />
              <motion.button
                onClick={async () => {
                  if (!promoCode) return;
                  setCheckingPromo(true);
                  await new Promise((r) => setTimeout(r, 600));
                  const res = applyPromo(Math.round(liveSubtotal * 620), promoCode);
                  if ((res as any).error) {
                    setPromoApplied(null);
                  } else {
                    setPromoApplied(promoCode);
                  }
                  setCheckingPromo(false);
                }}
                className="btn-secondary"
                style={{ padding: "0 14px", fontSize: "0.65rem", minWidth: 88, display: "grid", placeItems: "center" }}
                whileTap={{ scale: 0.96 }}
                disabled={checkingPromo}
              >
                {checkingPromo ? <span className="h-3 w-3 rounded-full border-2 border-white/20 border-t-white animate-spin" /> : "Appliquer"}
              </motion.button>
            </div>
            <AnimatePresence>
              {promoApplied && promo && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ fontSize: "0.7rem", color: "#4ade80", marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
                  <span>Remise {promo.applied?.discountPercent}% ({promo.applied?.code})</span>
                  <span>-{formatPrice(discount / 620)}</span>
                </motion.div>
              )}
            </AnimatePresence>
            {promo && promo.discount > 0 && (
              <div className="cart-drawer__total" style={{ marginTop: 4 }}>
                <span className="cart-drawer__total-label">Total FCFA</span>
                <span className="cart-drawer__total-amount" style={{ color: "#4ade80" }}>{formatPrice(total / 620)}</span>
              </div>
            )}
            <div style={{ fontSize: "0.6rem", color: "#555", letterSpacing: "0.05em", marginBottom: 12, lineHeight: 1.6 }}>
              Avenue Kennedy, Yaoundé · Livraison 24-48h · Paiement à la livraison / Mobile Money · yolo.co
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <motion.button className="btn-primary" style={{ width: "100%" }} onClick={() => { handleClose(); window.location.href = "/checkout"; }} whileTap={{ scale: 0.98 }} whileHover={{ scale: 1.01 }}>
                Commander · {formatPrice((promo ? promo.total : Math.round(liveSubtotal * 620)) / 620)}
              </motion.button>
              <motion.button className="btn-secondary" onClick={handleClose} style={{ width: "100%", fontSize: "0.7rem" }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
                Continuer vos achats
              </motion.button>
              <a href="https://wa.me/237699000000?text=Bonjour%20YOLO%20Avenue%20Kennedy" target="_blank" style={{ fontSize: "0.65rem", textAlign: "center", color: "#25D366", textDecoration: "none", letterSpacing: "0.08em", marginTop: 4 }}>Commander via WhatsApp →</a>
            </div>
          </div>
          );
        })()}
      </aside>
    </>
  );
}
