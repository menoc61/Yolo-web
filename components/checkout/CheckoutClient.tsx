"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { useMutation } from "@tanstack/react-query";
import { useCartStore } from "@/stores/cart";
import { useAuthStore } from "@/stores/auth";
import { useOrdersStore } from "@/stores/orders";
import { formatPrice } from "@/lib/currency";
import { applyPromo } from "@/lib/promo";
import { placeOrder } from "@/lib/payments";
import {
  PAYMENT_META,
  SHIPPING_META,
  CITIES,
  CITY_LABELS,
  cityToShipping,
  type PaymentMethod,
  type CashMode,
  type ShippingMethod,
  type CityId,
} from "@/lib/payments";
import { AnimatedInput } from "@/components/ui/AnimatedInput";
import Link from "next/link";
import confetti from "canvas-confetti";
import shops from "@/data/shops.json";

const FCFA = (n: number) => n.toLocaleString("fr-CM");

type Phase = "form" | "processing" | "success" | "rejected";

export function CheckoutClient() {
  const items = useCartStore((s) => s.items);
  const subtotalUSD = useCartStore((s) => s.subtotal());
  const clearCart = useCartStore((s) => s.clearCart);
  const { isAuthenticated, user } = useAuthStore();
  const addOrder = useOrdersStore((s) => s.addOrder);
  const subtotalFCFA = Math.round(subtotalUSD * 620);

  const [form, setForm] = useState({ name: "", email: "", phone: "", street: "", city: "yaounde" as CityId, notes: "" });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [payment, setPayment] = useState<PaymentMethod>("visa");
  const [cashMode, setCashMode] = useState<CashMode>("cod");
  const [promo, setPromo] = useState("");
  const [promoApplied, setPromoApplied] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("form");
  const [rejectMsg, setRejectMsg] = useState("");
  const [order, setOrder] = useState<null | { orderId: string; totalFCFA: number; payment: PaymentMethod; cashMode?: CashMode; status: string; message: string }>(null);
  const [receiptItems, setReceiptItems] = useState<{ id: string; name: string; price: number; quantity: number; image: string; category: string }[]>([]);

  const reduce = useReducedMotion();
  const shippingMethod: ShippingMethod = payment === "cash" && cashMode === "shop" ? "pickup" : cityToShipping(form.city);
  const shippingMeta = SHIPPING_META[shippingMethod];
  const cityLabel = CITY_LABELS[form.city];

  const fullAddress = form.street.trim();

  useEffect(() => {
    if (isAuthenticated && user && !form.name && !form.email) {
      setForm((s) => ({ ...s, name: user.name, email: user.email, phone: (user as any).phone || s.phone }));
    }
  }, [isAuthenticated, user]);

  // Address auto-prefix: when city changes, strip old city from street if present
  useEffect(() => {
    setForm((s) => {
      const stripped = CITIES.filter((c) => c.id !== s.city)
        .reduce((txt, c) => txt.replace(new RegExp(`^\\s*${CITY_LABELS[c.id]}[\\s,–-]+`, "i"), ""), s.street);
      return { ...s, street: stripped };
    });
  }, [form.city]);

  // Shops carrying cart products
  const cartSlugs = useMemo(() => items.map((i) => i.id), [items]);
  const relevantShops = useMemo(
    () =>
      shops
        .filter((s) => cartSlugs.some((slug) => (s.stock?.[slug] ?? 0) > 0))
        .sort((a, b) => {
          const ai = a.id === "kennedy-flagship" ? 0 : a.id === "bastos" ? 1 : 2;
          const bi = b.id === "kennedy-flagship" ? 0 : b.id === "bastos" ? 1 : 2;
          return ai - bi;
        }),
    [cartSlugs],
  );

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (touched.name && !form.name.trim()) e.name = "Nom requis";
    if (touched.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "E-mail invalide";
    if (touched.phone && !/^\+?237[0-9]{8,9}$/.test(form.phone.replace(/\s/g, ""))) e.phone = "Ex: ++79011805350";
    if (touched.street && !fullAddress) e.street = "Adresse requise";
    return e;
  }, [form, touched, fullAddress]);

  const hasOutOfStock = items.some((i) => i.quantity > 5);
  const shippingFCFA = shippingMeta.costFCFA;
  const promoRes = promoApplied ? applyPromo(subtotalFCFA + shippingFCFA, promoApplied) : null;
  const discount = promoRes?.discount ?? 0;
  const totalFCFA = subtotalFCFA + shippingFCFA - discount;

  const canSubmit =
    form.name.trim() &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) &&
    form.phone.trim() &&
    fullAddress &&
    items.length > 0 &&
    !hasOutOfStock &&
    isAuthenticated;

  const addressPayload = fullAddress ? `${cityLabel} — ${fullAddress}` : cityLabel;

  const mutation = useMutation({
    mutationFn: () =>
      placeOrder({
        items: items.map((i) => ({ id: i.id, quantity: i.quantity, price: i.price })),
        customer: { name: form.name, email: form.email, phone: form.phone, address: addressPayload, city: cityLabel, notes: form.notes },
        payment,
        cashMode: payment === "cash" ? cashMode : undefined,
        shipping: shippingMethod,
        promoCode: promoApplied,
      }),
    onSuccess: (data) => {
      setOrder(data);
      setReceiptItems(items.map((i) => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity, image: i.image, category: i.category })));
      addOrder({
        id: data.orderId,
        date: new Date().toISOString(),
        totalFCFA: data.totalFCFA,
        payment: data.payment,
        shipping: shippingMeta.label,
        status: data.status as any,
        items: items.map((i) => ({ id: i.id, name: i.name, qty: i.quantity, image: i.image })),
      });
      clearCart();
      setPhase("success");
    },
    onError: (err: Error) => {
      setRejectMsg(err.message);
      setPhase("rejected");
    },
  });

  // Confetti on success
  useEffect(() => {
    if (phase === "success" && !reduce) {
      const end = Date.now() + 1000;
      const frame = () => {
        confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 } });
        confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 } });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    }
  }, [phase, reduce]);

  const handlePlace = () => {
    if (!isAuthenticated) {
      window.dispatchEvent(new CustomEvent("yolo:open-auth"));
      return;
    }
    setTouched({ name: true, email: true, phone: true, street: true });
    if (!canSubmit) return;
    setPhase("processing");
    mutation.mutate();
  };

  // ─── SUCCESS SCREEN ───
  if (phase === "success" && order) {
    return (
      <div className="page-content">
        <div className="container" style={{ maxWidth: 640, padding: "60px 0" }}>
          <motion.div initial={reduce ? false : { scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 400, damping: 22 }} style={{ textAlign: "center" }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#4ade80", color: "#0b0b0b", display: "grid", placeItems: "center", margin: "0 auto", fontWeight: 700, fontSize: "1.5rem" }}>✓</div>
            <h1 style={{ marginTop: 20, fontSize: "1.9rem", fontWeight: 700, textTransform: "uppercase" }}>Commande confirmée !</h1>
            <p style={{ color: "#777", marginTop: 12, lineHeight: 1.7, fontSize: "0.9rem" }}>
              {order.orderId} · {FCFA(order.totalFCFA)} FCFA via {PAYMENT_META[order.payment].label}
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.3 }} style={{ background: "#111", border: "1px solid #1a1a1a", padding: 24, marginTop: 24, fontSize: "0.78rem", lineHeight: 1.7 }}>
            <div id="yolo-receipt" style={{ display: "grid", gap: 16 }}>
              {/* Receipt header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, borderBottom: "1px dashed #2a2a2a", paddingBottom: 14 }}>
                <div>
                  <div style={{ fontSize: "1.05rem", fontWeight: 800, letterSpacing: "0.08em" }}>YOLO</div>
                  <div style={{ fontSize: "0.62rem", color: "#666", letterSpacing: "0.06em", marginTop: 2 }}>Avenue Kennedy, Yaoundé · yolo.co</div>
                  <div style={{ fontSize: "0.62rem", color: "#555" }}>WhatsApp +7 901 180 53 50</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "0.6rem", color: "#666", letterSpacing: "0.22em", textTransform: "uppercase" }}>Reçu · {order.orderId}</div>
                  <div style={{ fontSize: "0.66rem", color: "#aaa", marginTop: 2 }}>{new Date().toLocaleString("fr-CM")}</div>
                </div>
              </div>

              {/* Items */}
              <div>
                <div style={{ fontSize: "0.62rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#666", marginBottom: 8 }}>Articles</div>
                {receiptItems.map((it) => (
                  <div key={it.id} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "7px 0", borderBottom: "1px solid #1a1a1a", alignItems: "center" }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", minWidth: 0 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={it.image} alt="" width={36} height={44} style={{ objectFit: "cover", background: "#1a1a1a", flexShrink: 0 }} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.name}</div>
                        <div style={{ fontSize: "0.6rem", color: "#666" }}>{it.category} · {formatPrice(it.price)} × {it.quantity}</div>
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, color: "#fff", whiteSpace: "nowrap" }}>{formatPrice(it.price * it.quantity)}</div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div style={{ display: "grid", gap: 6, fontSize: "0.74rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#888" }}>Sous-total</span><span>{formatPrice(subtotalFCFA / 620)}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#888" }}>Livraison ({shippingMeta.label})</span><span>{formatPrice(shippingFCFA / 620)}</span></div>
                {discount > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#4ade80" }}><span>Remise {promoApplied}</span><span>-{formatPrice(discount / 620)}</span></div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #2a2a2a", marginTop: 6, paddingTop: 10, fontSize: "0.85rem" }}>
                  <span style={{ fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em" }}>Total FCFA</span>
                  <span style={{ fontWeight: 800 }}>{formatPrice(totalFCFA / 620)}</span>
                </div>
              </div>

              {/* Method + customer */}
              <div style={{ borderTop: "1px dashed #2a2a2a", paddingTop: 14, display: "grid", gap: 4, fontSize: "0.7rem", color: "#888" }}>
                <div><strong style={{ color: "#ccc" }}>Paiement:</strong> {PAYMENT_META[payment].label}{shippingMethod === "pickup" ? " · Retrait en boutique" : ""}</div>
                <div><strong style={{ color: "#ccc" }}>Client:</strong> {form.name} · {form.phone}</div>
                <div><strong style={{ color: "#ccc" }}>Adresse:</strong> {addressPayload}</div>
                <div style={{ color: "#4ade80", marginTop: 2 }}>{order.message}</div>
                <div style={{ fontSize: "0.6rem", color: "#555", marginTop: 6, letterSpacing: "0.06em" }}>Merci de ton achat Avenue Kennedy — FCFA · yolo.co</div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 18, justifyContent: "center", flexWrap: "wrap" }}>
              <button className="btn-secondary" onClick={() => window.print()} style={{ cursor: "pointer", height: 44, padding: "0 18px", fontSize: "0.7rem" }}>🖨 Imprimer / PDF le reçu</button>
            </div>
          </motion.div>

          {payment === "cash" && cashMode === "shop" && relevantShops.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.3 }} style={{ background: "#111", border: "1px solid #1a1a1a", padding: 20, marginTop: 12 }}>
              <div style={{ fontSize: "0.62rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#25D366", marginBottom: 12 }}>🏪 Retrait en boutique — clique pour itinéraire</div>
              {relevantShops.map((s) => (
                <a key={s.id} href={`https://www.google.com/maps/search/?api=1&query=${s.lat},${s.lng}`} target="_blank" rel="noopener" style={{ display: "block", padding: "10px 0", borderBottom: "1px solid #1a1a1a", textDecoration: "none", color: "#fff" }}>
                  <div style={{ fontSize: "0.72rem", fontWeight: 700 }}>{s.name} <span style={{ color: "#25D366", fontSize: "0.6rem" }}>→ Itinéraire</span></div>
                  <div style={{ fontSize: "0.65rem", color: "#666" }}>{s.address} · {s.hours}</div>
                </a>
              ))}
            </motion.div>
          )}

          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 24, flexWrap: "wrap" }}>
            <Link href="/products" className="btn-primary">Continuer shopping</Link>
            <a href="https://wa.me/+79011805350" target="_blank" rel="noopener" className="btn-secondary">WhatsApp YOLO</a>
          </div>
        </div>
      </div>
    );
  }

  // ─── FORM + PROCESSING/REJECTED (in-place) ───
  return (
    <div className="page-content">
      <div className="container">
        <style>{`@media(max-width:960px){.co-grid{grid-template-columns:1fr!important;}}`}</style>
        <div style={{ fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#666", marginBottom: 8 }}>Checkout · Avenue Kennedy · yolo.co</div>
        <h1 className="page-title" style={{ marginBottom: 24 }}>Paiement</h1>

        {items.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, color: "#666" }}>
            <p>Ton panier est vide — ajoute des produits FCFA avant de payer.</p>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} style={{ display: "inline-flex", marginTop: 16 }}>
              <Link href="/products" className="btn-primary" style={{ display: "inline-flex" }}>Voir la collection</Link>
            </motion.div>
          </div>
        ) : (
          <div className="co-grid" style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 40, alignItems: "start" }}>
            {/* ── Left: form or processing/rejected ── */}
            <div style={{ display: "grid", gap: 20 }}>
              <AnimatePresence mode="wait">
                {(phase === "processing" || phase === "rejected") ? (
                  <motion.div key="provider" initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }} style={{ background: "#111", border: `1px solid ${phase === "rejected" ? "#ef4444" : "#1a1a1a"}`, padding: 24, display: "grid", gap: 14 }}>
                    <div style={{ fontSize: "0.62rem", letterSpacing: "0.22em", textTransform: "uppercase", color: phase === "rejected" ? "#ef4444" : "#666" }}>
                      {PAYMENT_META[payment].provider ?? PAYMENT_META[payment].label} — {phase === "rejected" ? "Échec" : "Traitement en cours"}
                    </div>
                    {phase === "processing" && (
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <span className="h-5 w-5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                        <span style={{ fontSize: "0.85rem", lineHeight: 1.7 }}>
                          {payment === "visa" && "Stripe — authentification 3D Secure en cours… ne ferme pas la page."}
                          {payment === "om" && `Notch — push Orange Money envoyé au ${form.phone || "+237…"}, confirme le code USSD #150# dans les 3 minutes.`}
                          {payment === "momo" && "CinetPay — push MTN MoMo envoyé, confirme le code dans ton app MoMo dans les 3 minutes."}
                          {payment === "cash" && "Commande enregistrée — prépare tes FCFA à la livraison."}
                        </span>
                      </div>
                    )}
                    {phase === "rejected" && (
                      <div style={{ display: "grid", gap: 12 }}>
                        <p style={{ fontSize: "0.85rem", lineHeight: 1.6, color: "#fca5a5" }}>{rejectMsg}</p>
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                          <button className="btn-primary" onClick={() => { setPhase("processing"); setRejectMsg(""); mutation.mutate(); }} style={{ cursor: "pointer" }}>Réessayer</button>
                          <button className="btn-secondary" onClick={() => { setPhase("form"); setPayment("cash"); }} style={{ cursor: "pointer" }}>Passer en Cash</button>
                          <button className="btn-secondary" onClick={() => { setPhase("form"); setRejectMsg(""); }} style={{ cursor: "pointer" }}>Modifier le paiement</button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div key="form" initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }} style={{ display: "grid", gap: 20 }}>
                    {hasOutOfStock && <div style={{ background: "#ef4444", color: "#fff", padding: "10px 14px", fontSize: "0.75rem" }}>Panier invalide — un produit dépasse le stock autorisé.</div>}

                    {/* Contact */}
                    <section style={{ background: "#111", border: "1px solid #1a1a1a", padding: 20 }}>
                      <h3 style={{ fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#888", marginBottom: 16 }}>Contact</h3>
                      <div style={{ display: "grid", gap: 14 }}>
                        <AnimatedInput label="Nom complet" id="c-name" value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} onBlur={() => setTouched((s) => ({ ...s, name: true }))} error={errors.name} placeholder="Jean Dupont" />
                        <AnimatedInput label="E-mail" id="c-email" type="email" value={form.email} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} onBlur={() => setTouched((s) => ({ ...s, email: true }))} error={errors.email} placeholder="ton@email.com" />
                        <AnimatedInput label="Téléphone WhatsApp" id="c-phone" type="tel" value={form.phone} onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))} onBlur={() => setTouched((s) => ({ ...s, phone: true }))} error={errors.phone} placeholder="+7 901 180 53 50" />
                      </div>
                    </section>

                    {/* Livraison */}
                    <section style={{ background: "#111", border: "1px solid #1a1a1a", padding: 20 }}>
                      <h3 style={{ fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#888", marginBottom: 16 }}>Livraison</h3>
                      <div style={{ display: "grid", gap: 14 }}>
                        <div>
                          <label htmlFor="c-city" style={{ fontSize: "0.62rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#666", display: "block", marginBottom: 6 }}>Ville</label>
                          <select
                            id="c-city"
                            value={form.city}
                            onChange={(e) => { setForm((s) => ({ ...s, city: e.target.value as CityId })); setTouched((s) => ({ ...s, street: true })); }}
                            style={{ width: "100%", background: "#0b0b0b", border: "1px solid #222", color: "#fff", padding: "12px 12px", fontSize: "0.8rem", cursor: "pointer", minHeight: 44 }}
                          >
                            {CITIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                          </select>
                        </div>
                        {/* Address with city prefix */}
                        <div>
                          <label htmlFor="c-street" style={{ fontSize: "0.62rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#666", display: "block", marginBottom: 6 }}>Adresse</label>
                          <div style={{ display: "flex", border: `1px solid ${errors.street ? "#ef4444" : "#222"}`, background: "#0b0b0b" }}>
                            <span style={{ padding: "12px 0 12px 12px", fontSize: "0.82rem", fontWeight: 700, color: "#444", whiteSpace: "nowrap", background: "#0f0f0f", borderRight: "1px solid #222" }}>{cityLabel},</span>
                            <input
                              id="c-street"
                              value={form.street}
                              onChange={(e) => setForm((s) => ({ ...s, street: e.target.value }))}
                              onBlur={() => setTouched((s) => ({ ...s, street: true }))}
                              placeholder="Avenue Kennedy, quartier…"
                              style={{ flex: 1, background: "transparent", border: "none", color: "#fff", padding: "12px 12px", fontSize: "0.82rem", outline: "none" }}
                              aria-invalid={!!errors.street}
                              aria-describedby={errors.street ? "c-street-err" : undefined}
                            />
                          </div>
                          {errors.street && <p id="c-street-err" style={{ color: "#ef4444", fontSize: "0.68rem", marginTop: 6 }}>{errors.street}</p>}
                        </div>
                        <AnimatedInput label="Notes (optionnel)" id="c-notes" value={form.notes} onChange={(e) => setForm((s) => ({ ...s, notes: e.target.value }))} placeholder="Étage, digicode…" />
                      </div>
                      <div style={{ marginTop: 16, fontSize: "0.72rem", color: "#888", lineHeight: 1.7, background: "#0b0b0b", border: "1px solid #1a1a1a", padding: 12 }}>
                        <strong style={{ color: "#fff" }}>{shippingMeta.label}</strong> — {shippingMeta.costFCFA === 0 ? "Gratuit" : `${FCFA(shippingMeta.costFCFA)} FCFA`} · ETA {shippingMeta.eta}
                      </div>
                    </section>

                    {/* Paiement */}
                    <section style={{ background: "#111", border: "1px solid #1a1a1a", padding: 20 }}>
                      <h3 style={{ fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#888", marginBottom: 12 }}>Paiement</h3>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 12 }}>
                        {(Object.keys(PAYMENT_META) as PaymentMethod[]).map((id) => (
                          <motion.button
                            key={id}
                            type="button"
                            onClick={() => { setPayment(id); if (id === "cash") setCashMode("cod"); }}
                            style={{ padding: "14px 6px", border: `1px solid ${payment === id ? "#fff" : "#222"}`, background: payment === id ? "#fff" : "#0b0b0b", color: payment === id ? "#0b0b0b" : "#aaa", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}
                            whileTap={reduce ? undefined : { scale: 0.96 }}
                            whileHover={reduce ? undefined : { scale: 1.02 }}
                          >
                            {PAYMENT_META[id].label}
                          </motion.button>
                        ))}
                      </div>
                      <p style={{ fontSize: "0.75rem", color: "#777", lineHeight: 1.6, marginBottom: 12 }}>{PAYMENT_META[payment].desc}</p>

                      {payment === "cash" && (
                        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                          <motion.button type="button" onClick={() => setCashMode("cod")} className="btn-secondary" whileTap={{ scale: 0.97 }} style={{ flex: 1, minWidth: 150, justifyContent: "center", borderColor: cashMode === "cod" ? "#fff" : "#222", background: cashMode === "cod" ? "#fff" : "transparent", color: cashMode === "cod" ? "#0b0b0b" : "#fff" }}>
                            💵 Cash à la livraison
                          </motion.button>
                          <motion.button type="button" onClick={() => setCashMode("shop")} className="btn-secondary" whileTap={{ scale: 0.97 }} style={{ flex: 1, minWidth: 150, justifyContent: "center", borderColor: cashMode === "shop" ? "#fff" : "#222", background: cashMode === "shop" ? "#fff" : "transparent", color: cashMode === "shop" ? "#0b0b0b" : "#fff" }}>
                            🏪 Retrait en boutique
                          </motion.button>
                        </div>
                      )}

                      {payment === "cash" && cashMode === "shop" && (
                        <div style={{ display: "grid", gap: 8, marginBottom: 12 }}>
                          <div style={{ fontSize: "0.62rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#666", marginBottom: 2 }}>Points YOLO — retrait FCFA</div>
                          {relevantShops.map((s) => (
                            <motion.a key={s.id} href={`https://www.google.com/maps/search/?api=1&query=${s.lat},${s.lng}`} target="_blank" rel="noopener" whileHover={reduce ? undefined : { scale: 1.01, y: -1 }} whileTap={reduce ? undefined : { scale: 0.98 }} transition={{ type: "spring", stiffness: 400, damping: 30 }} style={{ display: "grid", gap: 6, padding: "10px 14px", background: "#0b0b0b", border: "1px solid #1a1a1a", textDecoration: "none", color: "#fff" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase" }}>
                                <span>{s.name}</span>
                                <span style={{ color: "#25D366", fontSize: "0.6rem" }}>Itinéraire →</span>
                              </div>
                              <div style={{ fontSize: "0.65rem", color: "#666" }}>{s.address} · {s.hours}</div>
                              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", fontSize: "0.6rem", color: "#444" }}>
                                {cartSlugs.filter((slug) => (s.stock?.[slug] ?? 0) > 0).map((slug) => (
                                  <span key={slug} style={{ background: "#1a1a1a", padding: "2px 6px" }}>{slug.replace(/-/g, " ")} ×{s.stock[slug]}</span>
                                ))}
                              </div>
                            </motion.a>
                          ))}
                        </div>
                      )}

                      <AnimatePresence>
                        {payment === "visa" && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }} style={{ overflow: "hidden", display: "grid", gap: 8, marginTop: 8 }}>
                            <AnimatedInput label="Numéro Visa" id="visa-num" placeholder="4242 4242 4242 4242" />
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                              <AnimatedInput label="MM/AA" id="visa-exp" placeholder="12/27" />
                              <AnimatedInput label="CVC" id="visa-cvc" placeholder="123" />
                            </div>
                            <p style={{ fontSize: "0.6rem", color: "#444" }}>Test Stripe — 4242 4242 4242 4242 · FCFA via Stripe XAF</p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <AnimatePresence>
                        {(payment === "om" || payment === "momo") && (
                          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} style={{ fontSize: "0.72rem", color: "#666", lineHeight: 1.6, background: "#0b0b0b", border: "1px solid #1a1a1a", padding: 12, marginTop: 8 }}>
                            <strong>{PAYMENT_META[payment].provider}</strong> — {payment === "om" ? "Notch" : "CinetPay"} traitera le push vers ton numéro au moment du paiement. Tu auras 3 minutes pour confirmer le code USSD / MoMo.
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </section>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Right: summary (sticky) ── */}
            <motion.div initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.06 }} style={{ background: "#0f0f0f", border: "1px solid #1a1a1a", padding: 24, position: "sticky", top: 128 }}>
              <div style={{ fontSize: "0.65rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "#444", marginBottom: 12 }}>Résumé · FCFA · yolo.co</div>
              <div style={{ display: "grid", gap: 10, marginBottom: 12 }}>
                {items.map((i) => (
                  <div key={i.id} style={{ display: "flex", gap: 12, alignItems: "center", opacity: mutation.isPending ? 0.6 : 1, transition: "opacity 150ms" }}>
                    <img src={i.image} alt={i.name} style={{ width: 56, height: 70, objectFit: "cover", background: "#1a1a1a" }} loading="lazy" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{i.name}</div>
                      <div style={{ fontSize: "0.65rem", color: "#666" }}>{i.category} · ×{i.quantity}</div>
                    </div>
                    <div style={{ fontSize: "0.75rem" }}>{formatPrice(i.price * i.quantity)}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <input value={promo} onChange={(e) => setPromo(e.target.value.toUpperCase())} placeholder="YOLO10 / KENNEDY20" style={{ flex: 1, background: "#0b0b0b", border: "1px solid #222", color: "#fff", padding: "10px 12px", fontSize: "0.7rem", letterSpacing: "0.06em", minHeight: 44 }} />
                <motion.button onClick={() => { const res = applyPromo(subtotalFCFA + shippingFCFA, promo); if (!("error" in res)) setPromoApplied(promo); }} className="btn-secondary" style={{ padding: "0 14px" }} whileTap={reduce ? undefined : { scale: 0.97 }}>OK</motion.button>
              </div>
              <AnimatePresence>
                {promoApplied && <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} style={{ fontSize: "0.7rem", color: "#4ade80", marginBottom: 8 }}>Code <strong>{promoApplied}</strong> — -{discount.toLocaleString("fr-CM")} FCFA</motion.div>}
              </AnimatePresence>

              <div style={{ display: "grid", gap: 6, fontSize: "0.8rem", color: "#888", borderTop: "1px solid #1a1a1a", paddingTop: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span>Sous-total</span><span>{formatPrice(subtotalUSD)}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span>Livraison</span><span>{shippingFCFA === 0 ? "Gratuit" : `${FCFA(shippingFCFA)} FCFA`}</span></div>
                {discount > 0 && <div style={{ display: "flex", justifyContent: "space-between", color: "#4ade80" }}><span>Remise</span><span>-{discount.toLocaleString("fr-CM")} FCFA</span></div>}
                <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #1a1a1a", paddingTop: 10, marginTop: 4 }}><span style={{ fontWeight: 700, color: "#fff", letterSpacing: "0.1em", textTransform: "uppercase", fontSize: "0.7rem" }}>Total</span><span style={{ fontSize: "1.2rem", fontWeight: 700, color: "#fff" }}>{totalFCFA.toLocaleString("fr-CM")} FCFA</span></div>
              </div>

              {!isAuthenticated && (
                <div style={{ background: "#facc15", color: "#0b0b0b", padding: "10px 12px", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.06em", textAlign: "center", marginTop: 12 }}>
                  Connecte-toi d&apos;abord — commande bloquée sans login.
                </div>
              )}
              <motion.button
                onClick={handlePlace}
                disabled={isAuthenticated ? !canSubmit || mutation.isPending : mutation.isPending}
                style={{ width: "100%", marginTop: 8, height: 52, background: (isAuthenticated ? canSubmit : true) ? "#fff" : "#333", color: (isAuthenticated ? canSubmit : true) ? "#0b0b0b" : "#777", border: "none", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", fontSize: "0.75rem", display: "grid", placeItems: "center", cursor: isAuthenticated ? (canSubmit ? "pointer" : "not-allowed") : "pointer" }}
                whileTap={(isAuthenticated ? canSubmit : true) && !reduce ? { scale: 0.98 } : {}}
              >
                {mutation.isPending ? (
                  <span className="h-4 w-4 rounded-full border-2 border-black/20 border-t-black animate-spin" />
                ) : !isAuthenticated ? (
                  `Se connecter pour commander — ${FCFA(totalFCFA)} FCFA`
                ) : payment === "cash" ? (
                  cashMode === "shop" ? `Retrait boutique — ${FCFA(totalFCFA)} FCFA` : `Cash livraison — ${FCFA(totalFCFA)} FCFA`
                ) : (
                  `Payer ${FCFA(totalFCFA)} FCFA — ${PAYMENT_META[payment].label}`
                )}
              </motion.button>
              <p style={{ fontSize: "0.6rem", color: "#444", textAlign: "center", marginTop: 10, lineHeight: 1.5 }}>
                Avenue Kennedy, Yaoundé · <a href="https://wa.me/+79011805350" style={{ color: "#25D366" }}>WhatsApp aide</a> · yolo.co
              </p>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}