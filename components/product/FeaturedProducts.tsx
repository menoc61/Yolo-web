"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ProductCard } from "./ProductGrid";
import { useFeaturedProducts } from "@/hooks/useProducts";
import { useScrollReveal } from "@/hooks/useAnimations";

export function FeaturedProducts() {
  const { data, isLoading } = useFeaturedProducts();
  const shouldReduce = useReducedMotion();

  // Scroll reveal for section header — transform/opacity only, ease-out, 220ms
  useScrollReveal(".products-section__label, .products-section__title", {
    y: 14,
    duration: 0.45,
    stagger: 0.06,
    batch: false,
  });

  return (
    <section className="products-section">
      <div className="container">
        <div className="products-section__label" data-scroll-reveal>Featured</div>
        <h2 className="products-section__title" data-scroll-reveal>The Collection</h2>

        {isLoading ? (
          <div className="product-grid">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="product-card"
                initial={shouldReduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="product-card__image-wrap skeleton animate-pulse" style={{ background: "#1a1a1a" }} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="product-grid">
            {data?.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <Link href="/products" className="products-section__link" data-scroll-reveal>
          View all products
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
