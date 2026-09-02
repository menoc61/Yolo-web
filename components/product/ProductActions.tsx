"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useCartStore } from "@/stores/cart";
import { useWishlistStore } from "@/stores/wishlist";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/currency";
import { toast } from "sonner";

interface Props {
  product: Product;
}

export function ProductActions({ product }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const cartQuantity = useCartStore((s) => s.items.find((i) => i.id === product.id)?.quantity ?? 0);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist(product.id));
  const toggleItem = useWishlistStore((s) => s.toggleItem);
  const [loading, setLoading] = useState<"cart" | "buy" | null>(null);
  const [quantity, setQuantity] = useState(1);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (cartQuantity > 0) setQuantity(cartQuantity);
  }, [cartQuantity]);

  const changeQuantity = (next: number) => {
    if (product.inventory <= 0) return;
    const clamped = Math.max(1, Math.min(product.inventory, next));
    setQuantity(clamped);
    if (cartQuantity > 0) updateQuantity(product.id, clamped);
  };

  const itemPayload = () => ({
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.images[0],
    category: product.category,
  });

  const handleAddToCart = async () => {
    setLoading("cart");
    await new Promise((r) => setTimeout(r, 400));
    if (cartQuantity === 0) {
      addItem(itemPayload(), quantity);
    }
    setLoading(null);
    openCart();
    toast.success(`${quantity}× ${product.name} ajouté au panier`);
  };

  const handleBuyNow = async () => {
    setLoading("buy");
    await new Promise((r) => setTimeout(r, 400));
    if (cartQuantity === 0) {
      addItem(itemPayload(), quantity);
    }
    setLoading(null);
    openCart();
    window.location.href = "/checkout";
  };

  const handleShare = async () => {
    const url = `https://yolo-cm.vercel.app/products/${product.slug}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${product.name} — YOLO | ${formatPrice(product.price)} FCFA`,
          text: `${product.description} — ${product.rating ?? 4.8}★ · ${formatPrice(product.price)} FCFA`,
          url,
        });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Lien copié — partage sur WhatsApp ou réseaux");
    }
  };

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {/* Quantity selector */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: "0.7rem", color: "#666", letterSpacing: "0.1em", textTransform: "uppercase" }}>Quantité</span>
        <div style={{ display: "flex", alignItems: "center", border: "1px solid #333" }}>
          <motion.button
            onClick={() => changeQuantity(quantity - 1)}
            whileTap={{ scale: 0.9 }}
            style={{ width: 36, height: 36, background: "none", border: "none", color: "#fff", fontSize: "1rem", cursor: "pointer", display: "grid", placeItems: "center" }}
          >
            −
          </motion.button>
          <span style={{ width: 40, textAlign: "center", fontSize: "0.85rem", fontWeight: 700 }}>{quantity}</span>
          <motion.button
            onClick={() => changeQuantity(quantity + 1)}
            whileTap={{ scale: 0.9 }}
            style={{ width: 36, height: 36, background: "none", border: "none", color: "#fff", fontSize: "1rem", cursor: "pointer", display: "grid", placeItems: "center" }}
          >
            +
          </motion.button>
        </div>
        {quantity > 1 && <span style={{ fontSize: "0.7rem", color: "#666" }}>{formatPrice(product.price * quantity)}</span>}
      </div>

      {/* Action buttons */}
      <div className="product-detail__actions">
        <motion.button className="btn-primary" style={{ width: "100%", display: "grid", placeItems: "center", gap: 8 }} onClick={handleAddToCart} disabled={!!loading} whileTap={reduce ? undefined : { scale: 0.97 }} whileHover={reduce ? undefined : { scale: 1.01 }}>
          {loading === "cart" ? <span className="h-4 w-4 rounded-full border-2 border-black/20 border-t-black animate-spin" /> : `Ajouter — ${formatPrice(product.price * quantity)}`}
        </motion.button>
        <motion.button className="btn-secondary" style={{ width: "100%", display: "grid", placeItems: "center" }} onClick={handleBuyNow} disabled={!!loading} whileTap={reduce ? undefined : { scale: 0.97 }}>
          {loading === "buy" ? <span className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin" /> : "Acheter maintenant"}
        </motion.button>
      </div>

      {/* Secondary actions */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <motion.button
          onClick={() => { toggleItem(product.id); toast.success(isInWishlist ? "Retiré des favoris" : "Ajouté aux favoris"); }}
          whileTap={{ scale: 0.9 }}
          style={{ flex: 1, minWidth: 100, display: "grid", placeItems: "center", gap: 6, padding: "10px 0", background: isInWishlist ? "#1a1a1a" : "none", border: `1px solid ${isInWishlist ? "#ef4444" : "#333"}`, color: isInWishlist ? "#ef4444" : "#888", fontSize: "0.7rem", cursor: "pointer", letterSpacing: "0.06em" }}
        >
          <svg width={16} height={16} viewBox="0 0 24 24" fill={isInWishlist ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2}>
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.42 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.5 11.5z" />
          </svg>
          {isInWishlist ? "Favoris" : "Ajouter aux favoris"}
        </motion.button>
        <motion.button
          onClick={handleShare}
          whileTap={{ scale: 0.9 }}
          style={{ flex: 1, minWidth: 100, display: "grid", placeItems: "center", gap: 6, padding: "10px 0", background: "none", border: "1px solid #333", color: "#888", fontSize: "0.7rem", cursor: "pointer", letterSpacing: "0.06em" }}
        >
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          Partager
        </motion.button>
      </div>

      <a href={`https://wa.me/+79011805350?text=Bonjour YOLO — je veux ${encodeURIComponent(product.name)} (${formatPrice(product.price)} FCFA)`} target="_blank" style={{ fontSize: "0.7rem", textAlign: "center", color: "#25D366", textDecoration: "none", letterSpacing: "0.06em" }}>Commander via WhatsApp · Avenue Kennedy →</a>
    </div>
  );
}