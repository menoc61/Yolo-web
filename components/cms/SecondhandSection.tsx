"use client";

import products from "@//data/products.json";
import { formatPrice } from "@/lib/currency";
import { motion } from "motion/react";
import { useReducedMotion } from "motion/react";
import { ProductCard } from "@/components/product/ProductGrid";

const SecondhandSection = () => {
  const reduce = useReducedMotion();
  const secondhand = products.filter((p: any) => p.outOfStock);

  return (
    <motion.div
      className="section secondhand"
      whileHover={{ opacity: 0.8 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: reduce ? 0 : 0.2 }}
    >
      <div className="container">
        <h2 className="section__title">Secondhand</h2>
        <p className="section__subtitle">
          Unique pieces with history — available while supplies last
        </p>
        {secondhand.length > 0 ? (
          <div className="product-grid product-grid--secondhand">
            {secondhand.map((p: any) => (
              <ProductCard key={p.id} product={p} showRating showActions />
            ))}
          </div>
        ) : (
          <p className="section__empty">No secondhand items currently available</p>
        )}
      </div>
    </motion.div>
  );
};

export default SecondhandSection;