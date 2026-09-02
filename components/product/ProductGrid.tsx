"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import gsap from "gsap";
import { useCartStore } from "@/stores/cart";
import { useWishlistStore } from "@/stores/wishlist";
import type { Product } from "@/lib/types";
import type { RefObject, ForwardedRef } from "react";
import { AnimatedCarousel } from "@/components/ui/AnimatedCarousel";
import { formatPrice } from "@/lib/currency";
import { RatingInline } from "./ProductRating";

interface Props {
  product: Product;
  imageRef?: RefObject<HTMLImageElement> | ForwardedRef<HTMLImageElement>;
}

export function ProductCard({ product }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const prefersReduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const shouldReduce = mounted ? prefersReduce : false;
  const storedIsInWishlist = useWishlistStore((s) => s.isInWishlist(product.id));
  const isInWishlist = mounted ? storedIsInWishlist : false;

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggleWishlist = () => {
    if (shouldReduce) return;
    useWishlistStore.getState().toggleItem(product.id);
    const heartSvg = document.querySelector(`.wishlist-heart svg`) as SVGSVGElement | null;
    if (heartSvg) {
      gsap.fromTo(
        heartSvg,
        { scale: 1 },
        {
          scale: 1.3,
          duration: 0.3,
          ease: "back.out(1.7)",
          onComplete: () => gsap.to(heartSvg, { scale: 1, duration: 0.3, ease: "back.out(1.7)" }),
        },
      );
    }
  };

  const handleAddToCart = (event: React.MouseEvent) => {
    event.preventDefault();
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      category: product.category,
    });
    openCart();
  };

  return (
    <article className="product-card">
      <Link href={`/products/${product.slug}`} aria-label={`${product.name} — ${product.category}`}>
        <div className="product-card__image-wrap group">
          {product.discountPercent && (
            <span style={{ position: "absolute", top: 12, left: 12, zIndex: 2, background: "#fff", color: "#0b0b0b", fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.08em", padding: "5px 8px" }}>
              -{product.discountPercent}% · PROMO
            </span>
          )}
          <AnimatedCarousel
            images={product.images}
            alt={product.name}
            aspectRatio="3/4"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            autoPlay={false}
            className="h-full w-full"
          />
          <div className="product-card__info pointer-events-none">
            <span className="product-card__category">{product.category}</span>
            <h3 className="product-card__name">{product.name}</h3>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 6, flexWrap: "wrap" }}>
              <span className="product-card__price">{formatPrice(product.price)}</span>
              {product.originalPrice && <span style={{ fontSize: "0.7rem", color: "#666", textDecoration: "line-through" }}>{formatPrice(product.originalPrice)}</span>}
            </div>
            <div style={{ marginTop: 8 }}>
              <RatingInline rating={product.rating ?? 4.7} count={product.reviewCount ?? 98} />
            </div>
          </div>
        </div>
      </Link>

      <motion.button
        className="wishlist-heart"
        aria-label={isInWishlist ? "Retirer des favoris" : "Ajouter aux favoris"}
        onClick={handleToggleWishlist}
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          background: isInWishlist ? "#fff" : "none",
          border: "none",
          color: isInWishlist ? "#ef4444" : "#666",
          padding: 4,
          zIndex: 10,
          cursor: "pointer",
          borderRadius: "50%",
          width: 36,
          height: 36,
          display: "grid",
          placeItems: "center",
        }}
      >
        <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor" style={{ width: "100%", height: "100%" }}>
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.42 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.5 11.5zM12 4l-1.63-1.49C10.5 1.86 8.35 1.56 6 1.56 2.47 1.56 0.5 3.42 0 5.25c1.74 1.31 3.56 2.09 5.46 2.09 1.86 0 3.68-.77 5.17-1.53l1.45 1.32C13.5 5.74 12 7.08 12 8.5z" />
        </svg>
      </motion.button>

      <div className="product-card__overlay">
        <motion.button className="btn-primary" onClick={handleAddToCart} whileTap={{ scale: 0.96 }} transition={{ type: "spring", stiffness: 400, damping: 30 }}>
          Add to Cart
        </motion.button>
        <motion.div whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
          <Link href={`/products/${product.slug}`} className="btn-secondary">
            View
          </Link>
        </motion.div>
      </div>

      <div className="product-card__actions">
        <motion.button className="product-card__actions-add" onClick={handleAddToCart} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 400, damping: 30 }}>
          Ajouter au panier
        </motion.button>
        <Link href={`/products/${product.slug}`} className="product-card__actions-view" aria-label={`Voir ${product.name}`}>
          Voir
        </Link>
      </div>
    </article>
  );
}
