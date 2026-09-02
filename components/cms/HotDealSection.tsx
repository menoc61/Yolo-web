"use client";

import products from "@//data/products.json";
import { formatPrice } from "@/lib/currency";
import { motion } from "motion/react";
import { useReducedMotion } from "motion/react";
import { ProductCard } from "@/components/product/ProductGrid";

const HotDealSection = () => {
  const reduce = useReducedMotion();
  const discounted = products.filter((p: any) => p.discountPercent && p.discountPercent > 0);

  return (
    <motion.div
      className="section hot-deal"
      whileHover={{ opacity: 0.8 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: reduce ? 0 : 0.2 }}
    >
      <div className="container">
        <h2 className="section__title">Hot Deal</h2>
        <p className="section__subtitle">
          Offers too good to miss — limited time only
        </p>
        {discounted.length > 0 ? (
          <div className="product-grid product-grid--hot-deal">
            {discounted.map((p: any) => (
              <ProductCard key={p.id} product={p} showRating showActions />
            ))}
          </div>
        ) : (
          <p className="section__empty">No hot deals available at the moment</p>
        )}
      </div>
    </motion.div>
  );
};

export default HotDealSection;