"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import gsap from "gsap";
import { useAuthStore } from "@/stores/auth";
import { useOrdersStore } from "@/stores/orders";
import { useGSAPAnimation } from "@/hooks/useAnimations";
import { AnimatedInput } from "@/components/ui/AnimatedInput";
import { formatPrice } from "@/lib/currency";
import { toast } from "sonner";

type Tab = "orders" | "reviews" | "settings" | "tracking" | "adresses";

interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  default: boolean;
}

interface TrackingEvent {
  name: string;
  date: string;
  status: "completed" | "pending";
  description?: string;
}

const statusBadgeColors: Record<string, { bg: string; text: string }> = {
  pending_push: { bg: "#f59e0b", text: "#fff" }, // en cours (amber)
  delivered: { bg: "#10b981", text: "#fff" }, // livré (green)
  paid: { bg: "#3b82f6", text: "#fff" }, // paid (blue)
  cod_pending: { bg: "#6b7280", text: "#fff" }, // en attente paiement (gray)
  delivered_final: { bg: "#10b981", text: "#fff" },
};

const statusLabels: Record<string, string> = {
  pending_push: "en cours",
  delivered: "livré",
  paid: "payé",
  cod_pending: "en attente paiement",
  delivered_final: "livré",
};

const statusDescriptions: Record<string, string> = {
  pending_push: "Commande confirmée en attente de paiement",
  delivered: "Commande livrée avec succès",
  paid: "Paiement reçu",
  cod_pending: "En attente de confirmation de paiement",
  delivered_final: "Livraison terminée",
};

export function ProfileClient() {
  const { user, isAuthenticated, login, logout, updateProfile } = useAuthStore();
  const { orders, reviews, addReview, clearHistory } = useOrdersStore();
  const [tab, setTab] = useState<Tab>("orders");
  const [reviewForm, setReviewForm] = useState({ productName: "", rating: 5, comment: "" });
  const [profileForm, setProfileForm] = useState({ name: user?.name ?? "", phone: user?.phone ?? "" });
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [newAddress, setNewAddress] = useState<Partial<Address>>({});
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduce = useReducedMotion();

  // GSAP micro-interaction: stagger cards on tab change
  useGSAPAnimation((ctx) => {
    if (shouldReduce || !containerRef.current) return;
    gsap.fromTo(
      ".profile-card",
      { y: 14, opacity: 0, scale: 0.98 },
      { y: 0, opacity: 1, scale: 1, duration: 0.45, ease: "power3.out", stagger: 0.06, overwrite: true }
    );
  }, [tab, orders.length, reviews.length]);

  // GSAP timeline: reveal entire profile page on mount with staggered sections
  useGSAPAnimation((ctx) => {
    if (shouldReduce || !containerRef.current) return;
    const timeline = gsap.timeline({ defaults: { duration: 0.6, ease: "power3.out" } });
    timeline
      .fromTo(
        ".profile-stats .stat-card",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.15, overwrite: true }
      )
      .fromTo(
        ".profile-tabs",
        { y: 10, opacity: 0 },
        { y: 0, opacity: 1, overwrite: true }
      )
      .fromTo(
        ".profile-content",
        { y: 10, opacity: 0 },
        { y: 0, opacity: 1, overwrite: true }
      );
  }, [shouldReduce]);

  // Track tab switch with GSAP
  useGSAPAnimation((ctx) => {
    if (shouldReduce) return;
    const tabElements = containerRef.current?.querySelectorAll(
      '.profile-tab-button[data-tab]'
    );
    if (tabElements?.length) {
      tabElements.forEach((el, i) => {
        ctx.add(
          gsap.fromTo(
            el,
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.3, delay: i * 0.05, overwrite: true }
          )
        );
      });
    }
  }, [tab, shouldReduce]);

  // Address: add new address
  const handleAddAddress = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newAddress.name || !newAddress.street || !newAddress.city) return;
      const newAddressObj: Address = {
        id: "addr_" + Date.now(),
        name: newAddress.name,
        street: newAddress.street ?? "",
        city: newAddress.city,
        postalCode: newAddress.postalCode ?? "",
        country: newAddress.country ?? "Cameroun",
        default: false,
      };
      setAddresses((prev) => [newAddressObj, ...prev]);
      setNewAddress({});
    },
    [newAddress]
  );

  // Address: toggle default
  const handleToggleDefault = useCallback(
    (id: string) =>
      setAddresses(
        (prev) =>
          prev.map((a) => (a.id === id ? { ...a, default: !a.default } : a))
      ),
    []
  );

  // Address: delete with confirmation dialog
  const handleDeleteAddress = useCallback(
    async (id: string) => {
      if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette adresse ?")) return;
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    },
    []
  );

  // Address: edit form prepopulation
  const handleStartEdit = useCallback(
    (id: string) => {
      const addr = addresses.find((a) => a.id === id);
      if (addr) {
        setNewAddress({
          name: addr.name,
          street: addr.street,
          city: addr.city,
          postalCode: addr.postalCode,
          country: addr.country,
        });
        setEditingAddressId(id);
      }
    },
    [addresses]
  );

  if (!isAuthenticated || !user) {
    return (
      <div className="page-content">
        <div className="container" style={{ maxWidth: 480, textAlign: "center", padding: "60px 0" }}>
          <h1 className="page-title" style={{ marginBottom: 16 }}>Mon profil</h1>
          <p style={{ color: "#777", marginBottom: 20 }}>Connecte-toi pour voir historique, avis et commandes Avenue Kennedy</p>
        </div>
      </div>
    );
  }

  // Compute profile stats
  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, o) => sum + o.totalFCFA, 0);
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return (
    <div className="page-content">
      <div className="container">
        {/* Profile Stats — SVG icons, mono theme */}
        <div className="profile-stats">
          <div className="stat-card">
            <div className="stat-card__label">Total commandes</div>
            <div className="stat-card__value">{totalOrders}</div>
            <div className="stat-card__divider" />
            <svg className="stat-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
          </div>
          <div className="stat-card">
            <div className="stat-card__label">Total dépensé</div>
            <div className="stat-card__value">{formatPrice(totalSpent)}</div>
            <div className="stat-card__divider" />
            <svg className="stat-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
          </div>
          <div className="stat-card">
            <div className="stat-card__label">Moyenne avis</div>
            <div className="stat-card__value">{avgRating.toFixed(1)} ★</div>
            <div className="stat-card__divider" />
            <svg className="stat-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
        </div>

        <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap", marginBottom: 24 }}>
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              width={64}
              height={64}
              style={{ borderRadius: "50%", border: "1px solid #222", objectFit: "cover", width: 64, height: 64 }}
            />
          ) : (
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#fff", color: "#0b0b0b", display: "grid", placeItems: "center", fontSize: "1.4rem", fontWeight: 700, border: "1px solid #222" }}>
              {(user.name || "U").charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 style={{ fontSize: "1.4rem", fontWeight: 700, textTransform: "uppercase" }}>{user.name}</h1>
            <p style={{ color: "#666", fontSize: "0.8rem" }}>{user.email} · Depuis {new Date(user.createdAt).toLocaleDateString("fr-CM")} · yolo.co</p>
          </div>
          <motion.button onClick={logout} className="btn-secondary" style={{ marginLeft: "auto", height: 40, padding: "0 18px", fontSize: "0.7rem" }} whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.02 }}>
            Déconnexion
          </motion.button>
        </div>

        <div className="profile-tabs">
{(["orders", "reviews", "settings", "tracking", "adresses"] as Tab[]).map((t) => (
            <motion.button
              key={t}
              onClick={() => setTab(t)}
              className={`profile-tab-button${tab === t ? " is-active" : ""}`}
              data-tab={t}
              whileTap={{ scale: 0.97 }}
              whileHover={{ y: -2 }}
            >
              {t === "orders"
                ? `Commandes (${orders.length})`
                : t === "reviews"
                ? `Avis (${reviews.length})`
                : t === "tracking"
                ? `Suivi (${orders.length})`
                : t === "adresses"
                ? `Adresses`
                : "Profil & utilitaires"}
            </motion.button>
          ))}
        </div>

        <div ref={containerRef}>
          <AnimatePresence mode="wait">
            {tab === "orders" && (
              <motion.div key="orders" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }} style={{ display: "grid", gap: 12 }}>
                {orders.length === 0 ? (
                  <p style={{ color: "#555", textAlign: "center", padding: 40 }}>Aucune commande — tes achats Avenue Kennedy apparaîtront ici</p>
                ) : (
                  orders.map((o) => (
                    <div key={o.id}>
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => setExpandedOrderId(expandedOrderId === o.id ? null : o.id)}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setExpandedOrderId(expandedOrderId === o.id ? null : o.id); } }}
                        className="profile-card"
                        style={{ display: "flex", gap: 14, alignItems: "center", cursor: "pointer", transition: "border-color 0.2s" }}
                      >
                        <img src={o.items[0]?.image} alt={o.items[0]?.name} style={{ width: 64, height: 80, objectFit: "cover", background: "#1a1a1a" }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>{o.id} · {o.status}</div>
                          <div style={{ fontSize: "0.7rem", color: "#666" }}>{new Date(o.date).toLocaleDateString("fr-CM")} · {o.shipping} · {o.payment.toUpperCase()}</div>
                          <div style={{ fontSize: "0.7rem", color: "#888", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{o.items.map((i) => `${i.name} x${i.qty}`).join(" · ")}</div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                          <div style={{ fontWeight: 700, fontSize: "0.85rem" }}>{formatPrice(o.totalFCFA)}</div>
                          <span style={{ fontSize: "0.6rem", color: "#444", letterSpacing: "0.1em", textTransform: "uppercase" }}>{expandedOrderId === o.id ? "Fermer" : "Détails"}</span>
                        </div>
                      </div>
                      <AnimatePresence>
                        {expandedOrderId === o.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                            style={{ overflow: "hidden" }}
                          >
                            <div style={{ background: "#0b0b0b", border: "1px solid #1a1a1a", borderTop: "none", padding: 16, display: "grid", gap: 12 }}>
                              <div style={{ fontSize: "0.65rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "#666", fontWeight: 700 }}>Articles</div>
                              {o.items.map((item, idx) => (
                                <div key={idx} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                                  <img src={item.image} alt={item.name} style={{ width: 40, height: 50, objectFit: "cover", background: "#1a1a1a" }} />
                                  <span style={{ flex: 1, fontSize: "0.75rem", color: "#ddd" }}>{item.name}</span>
                                  <span style={{ fontSize: "0.7rem", color: "#777" }}>x{item.qty}</span>
                                </div>
                              ))}
                              <div style={{ height: 1, background: "#1a1a1a" }} />
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "#888" }}>
                                <span>Mode de paiement</span>
                                <span style={{ textTransform: "uppercase" }}>{o.payment}</span>
                              </div>
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "#888" }}>
                                <span>Livraison</span>
                                <span>{o.shipping}</span>
                              </div>
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "#888" }}>
                                <span>Référence</span>
                                <span>{o.id}</span>
                              </div>
                              <div style={{ height: 1, background: "#1a1a1a" }} />
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                                <span style={{ fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#666", fontWeight: 700 }}>Total FCFA</span>
                                <span style={{ fontSize: "1.1rem", fontWeight: 700 }}>{formatPrice(o.totalFCFA)}</span>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))
                )}
              </motion.div>
            )}

            {tab === "reviews" && (
              <motion.div key="reviews" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.28 }} style={{ display: "grid", gap: 16 }}>
                <div className="profile-form-card">
                  <h3 className="profile-form-card__title">Laisser un avis</h3>
                  <AnimatedInput label="Produit" id="review-product" value={reviewForm.productName} onChange={(e) => setReviewForm({ ...reviewForm, productName: e.target.value })} placeholder="Nom du produit" />
                  <div style={{ display: "flex", gap: 6 }}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <motion.button key={n} onClick={() => setReviewForm({ ...reviewForm, rating: n })} style={{ width: 36, height: 36, display: "grid", placeItems: "center", background: reviewForm.rating >= n ? "#fff" : "#1a1a1a", color: reviewForm.rating >= n ? "#0b0b0b" : "#555", border: "1px solid #222", fontWeight: 700 }} whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.08 }} transition={{ type: "spring", stiffness: 500, damping: 20 }}>
                        {n}★
                      </motion.button>
                    ))}
                  </div>
                  <textarea value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} placeholder="Ton feedback (10 caractères min)" rows={3} style={{ background: "#0b0b0b", border: "1px solid #222", color: "#fff", padding: "12px 14px", fontSize: "0.85rem", resize: "vertical", outline: "none", fontFamily: "inherit", lineHeight: 1.6, transition: "border-color 120ms ease" }} onFocus={(e) => e.currentTarget.style.borderColor = "#fff"} onBlur={(e) => e.currentTarget.style.borderColor = "#222"} />
                  <motion.button
                    onClick={() => {
                      if (reviewForm.comment.trim().length < 10 || !reviewForm.productName.trim()) return;
                      addReview({ id: "rv_" + Date.now(), productId: "p1", productName: reviewForm.productName, rating: reviewForm.rating, comment: reviewForm.comment, date: new Date().toISOString() });
                      setReviewForm({ productName: "", rating: 5, comment: "" });
                    }}
                    className="btn-primary"
                    whileTap={{ scale: 0.97 }}
                    style={{ justifyContent: "center" }}
                  >
                    Publier avis
                  </motion.button>
                </div>
                {reviews.map((r) => (
                  <div key={r.id} className="profile-card" style={{ background: "#0f0f0f", border: "1px solid #1a1a1a", padding: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                      <strong style={{ fontSize: "0.8rem", textTransform: "uppercase" }}>{r.productName}</strong>
                      <span style={{ color: "#facc15", fontSize: "0.75rem" }}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                    </div>
                    <p style={{ fontSize: "0.8rem", color: "#aaa", marginTop: 6, lineHeight: 1.6 }}>{r.comment}</p>
                    <p style={{ fontSize: "0.65rem", color: "#444", marginTop: 6 }}>{new Date(r.date).toLocaleDateString("fr-CM")}</p>
                  </div>
                ))}
              </motion.div>
            )}

            {tab === "settings" && (
              <motion.div key="settings" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} style={{ display: "grid", gap: 16 }}>
                <div className="profile-form-card">
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <h3 className="profile-form-card__title" style={{ margin: 0 }}>Profil</h3>
                    <span style={{ fontSize: "0.58rem", letterSpacing: "0.12em", textTransform: "uppercase", padding: "3px 8px", borderRadius: 4, background: "#1a1a1a", color: "#aaa", fontWeight: 700 }}>{user.role}</span>
                  </div>
                  <AnimatedInput label="Nom" id="prof-name" value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} placeholder="Ton nom" />
                  <AnimatedInput label="Téléphone" id="prof-phone" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} placeholder="+237 699 00 00 00" />
                  <motion.button onClick={() => { updateProfile(profileForm.name, profileForm.phone); toast.success("Profil mis à jour — Avenue Kennedy"); }} className="btn-primary" whileTap={{ scale: 0.97 }}>
                    Sauvegarder
                  </motion.button>
                  <div style={{ display: "flex", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
                    <motion.button onClick={clearHistory} style={{ background: "none", border: "1px solid #222", color: "#666", padding: "8px 14px", fontSize: "0.65rem", cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.1em", textTransform: "uppercase" }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>Effacer historique</motion.button>
                    <a href="https://wa.me/237699000000" target="_blank" style={{ background: "#25D366", color: "#0b0b0b", padding: "8px 14px", fontSize: "0.65rem", fontWeight: 700, textDecoration: "none", letterSpacing: "0.1em", textTransform: "uppercase" }}>WhatsApp Support</a>
                  </div>
                  <p style={{ fontSize: "0.6rem", color: "#444" }}>Export factures FCFA · Retours 7j · Avenue Kennedy · yolo.co</p>
                </div>
              </motion.div>
            )}

            {tab === "tracking" && (
              <motion.div key="tracking" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }} style={{ display: "grid", gap: 16 }}>
                <div style={{ background: "#111", border: "1px solid #1a1a1a", padding: 16, borderRadius: 8 }}>
                  <h3 style={{ fontSize: "0.75rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#aaa", marginBottom: 16 }}>Historique de suivi des commandes</h3>
                  {orders.map((o) => (
                    <div key={o.id} className="profile-card" style={{ marginBottom: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <div>
                          <div style={{ fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase" }}>{o.id}</div>
                          <div style={{ fontSize: "0.7rem", color: "#666" }}>{new Date(o.date).toLocaleDateString("fr-CM")}</div>
                        </div>
                        <span
                          style={{
                            padding: "6px 12px",
                            borderRadius: 20,
                            fontSize: "0.65rem",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            background: statusBadgeColors[o.status]?.bg ?? "#333",
                            color: statusBadgeColors[o.status]?.text ?? "#fff",
                          }}
                        >
                          {statusLabels[o.status] || o.status}
                        </span>
                      </div>

                      {/* Trackable events timeline */}
                      <div style={{ position: "relative", paddingLeft: 20 }}>
                        <div
                          style={{
                            position: "absolute",
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: 2,
                            borderLeft: "1px solid #333",
                            marginLeft: 10,
                          }}
                        />
                        {[
                          { name: "Confirmée", date: o.date, completed: true },
                          { name: "Payée", date: o.date, completed: o.status === "paid" || o.status === "delivered" },
                          { name: "Expédiée", date: o.date, completed: o.status === "delivered" },
                          { name: "Livrée", date: o.date, completed: o.status === "delivered" },
                        ].map((event, i) => (
                          <div
                            key={i}
                            style={{
                              position: "relative",
                              padding: "8px 0",
                              fontSize: "0.65rem",
                              color: event.completed ? "#10b981" : "#666",
                            }}
                          >
                            <span
                              style={{
                                display: "inline-block",
                                width: 12,
                                height: 12,
                                borderRadius: "50%",
                                background: event.completed ? "#10b981" : "#333",
                                position: "absolute",
                                left: -20,
                                marginRight: 8,
                                flexShrink: 0,
                              }}
                            />
                            {event.name}
                            <span style={{ marginLeft: 8, color: "#555", fontSize: "0.6rem" }}>{event.date ? new Date(event.date).toLocaleDateString("fr-CM") : "—"}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {tab === "adresses" && (
              <motion.div key="adresses" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }} style={{ display: "grid", gap: 16 }}>
                <div style={{ background: "#111", border: "1px solid #1a1a1a", padding: 16, borderRadius: 8 }}>
                  <h3 style={{ fontSize: "0.75rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#aaa", marginBottom: 16 }}>
                    Gestion des adresses
                  </h3>

                  {/* Add / Edit address form */}
                  <form onSubmit={editingAddressId ? (e) => {
                    e.preventDefault();
                    if (!newAddress.name || !newAddress.street || !newAddress.city) return;
                    setAddresses((prev) => prev.map((a) => a.id === editingAddressId ? { ...a, name: newAddress.name!, street: newAddress.street ?? "", city: newAddress.city!, postalCode: newAddress.postalCode ?? "", country: newAddress.country ?? "Cameroun" } : a));
                    setEditingAddressId(null);
                    setNewAddress({});
                  } : handleAddAddress} style={{ marginBottom: 24 }}>
                    <div style={{ display: "grid", gap: 16, marginBottom: 16 }}>
                      <AnimatedInput
                        label="Nom complet"
                        id="addr-name"
                        value={newAddress.name ?? ""}
                        onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                        placeholder="Ex: Jean Dupont"
                      />
                      <AnimatedInput
                        label="Rue / Numéro"
                        id="addr-street"
                        value={newAddress.street ?? ""}
                        onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                        placeholder="Ex: 123 Avenue Kennedy"
                      />
                      <AnimatedInput
                        label="Ville"
                        id="addr-city"
                        value={newAddress.city ?? ""}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        placeholder="Ex: Yaoundé"
                      />
                      <AnimatedInput
                        label="Code postal"
                        id="addr-postal"
                        value={newAddress.postalCode ?? ""}
                        onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                        placeholder="Ex: 00237"
                      />
                      <AnimatedInput
                        label="Pays"
                        id="addr-country"
                        value={newAddress.country ?? ""}
                        onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                        placeholder="Ex: Cameroun"
                      />
                    </div>
                    <motion.button
                      type="submit"
                      style={{
                        width: "100%",
                        padding: "12px",
                        background: "#fff",
                        border: "none",
                        borderRadius: 6,
                        color: "#0b0b0b",
                        fontWeight: 700,
                        fontSize: "0.8rem",
                        fontFamily: "inherit",
                        cursor: "pointer",
                      }}
                      whileTap={{ scale: 0.97 }}
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      {editingAddressId ? "Mettre à jour" : "Enregistrer adresse"}
                    </motion.button>
                    {editingAddressId && (
                      <motion.button
                        type="button"
                        onClick={() => { setEditingAddressId(null); setNewAddress({}); }}
                        style={{ width: "100%", padding: "10px", background: "none", border: "1px solid #333", color: "#666", fontWeight: 600, fontSize: "0.75rem", fontFamily: "inherit", cursor: "pointer", borderRadius: 6, letterSpacing: "0.08em", textTransform: "uppercase" }}
                        whileTap={{ scale: 0.97 }}
                      >
                        Annuler
                      </motion.button>
                    )}
                  </form>

                  {/* List of saved addresses */}
                  {addresses.length === 0 ? (
                    <p style={{ color: "#555", textAlign: "center", padding: 20 }}>Aucune adresse enregistrée — ajoutez votre première adresse ci-dessus</p>
                  ) : (
                    <div style={{ display: "grid", gap: 12 }}>
                      {addresses.map((addr) => (
                        <div
                          key={addr.id}
                          style={{
                            background: "#0f0f0f",
                            border: "1px solid #1a1a1a",
                            padding: 14,
                            borderRadius: 6,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase" }}>{addr.name}</div>
                            <div style={{ fontSize: "0.65rem", color: "#666", marginTop: 2 }}>
                              {addr.street}, {addr.city} {addr.postalCode}
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <motion.button
                              onClick={() => handleStartEdit(addr.id)}
                              whileTap={{ scale: 0.97 }}
                              whileHover={{ scale: 1.02 }}
                              transition={{ type: "spring", stiffness: 400, damping: 25 }}
                              style={{
                                padding: "6px 12px",
                                background: "#1a1a1a",
                                border: "1px solid #333",
                                borderRadius: 4,
                                color: "#ccc",
                                fontSize: "0.65rem",
                                fontWeight: 600,
                                fontFamily: "inherit",
                                cursor: "pointer",
                              }}
                            >
                              Modifier
                            </motion.button>
                            <motion.button
                              onClick={() => handleToggleDefault(addr.id)}
                              whileTap={{ scale: 0.97 }}
                              whileHover={{ scale: 1.02 }}
                              transition={{ type: "spring", stiffness: 400, damping: 25 }}
                              style={{
                                padding: "6px 12px",
                                background: addr.default ? "#fff" : "#1a1a1a",
                                border: "1px solid #333",
                                borderRadius: 4,
                                color: addr.default ? "#0b0b0b" : "#666",
                                fontSize: "0.65rem",
                                fontWeight: 600,
                              }}
                            >
                              {addr.default ? "Par défaut" : "Définir comme défaut"}
                            </motion.button>
                            <motion.button
                              onClick={() => handleDeleteAddress(addr.id)}
                              whileTap={{ scale: 0.97 }}
                              whileHover={{ scale: 1.02 }}
                              transition={{ type: "spring", stiffness: 400, damping: 25 }}
                              style={{
                                padding: "6px 12px",
                                background: "none",
                                border: "1px solid #444",
                                borderRadius: 4,
                                color: "#888",
                                fontSize: "0.65rem",
                                fontWeight: 600,
                              }}
                            >
                              Supprimer
                            </motion.button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}