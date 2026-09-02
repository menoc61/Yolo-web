"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { useCartStore } from "@/stores/cart";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal());
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);

  if (items.length === 0) {
    return (
      <div className="page-content">
        <div className="container">
          <div className="products-section__label">Your Cart</div>
          <h1 className="page-title">Cart</h1>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 24,
              padding: "80px 0",
              color: "#333",
            }}
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            <p style={{ fontSize: "0.8rem", letterSpacing: "0.15em", textTransform: "uppercase" }}>
              Your cart is empty
            </p>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
              <Link href="/products" className="btn-primary">
                Browse Products
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="container">
        <div className="products-section__label">Your Cart</div>
        <h1 className="page-title">Cart</h1>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 380px",
            gap: 64,
            alignItems: "start",
          }}
        >
          {/* Items */}
          <div>
            <div
              style={{
                borderBottom: "1px solid #1a1a1a",
                paddingBottom: 16,
                marginBottom: 0,
                display: "grid",
                gridTemplateColumns: "80px 1fr auto",
                gap: 20,
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#333" }}>Product</span>
              <span style={{ fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#333" }}>Details</span>
              <span style={{ fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#333" }}>Total</span>
            </div>

            {items.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "80px 1fr auto",
                  gap: 20,
                  alignItems: "center",
                  padding: "24px 0",
                  borderBottom: "1px solid #1a1a1a",
                }}
              >
                <Image
                  src={item.image}
                  alt={item.name}
                  width={80}
                  height={100}
                  style={{ objectFit: "cover", background: "#111" }}
                />
                <div>
                  <div
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {item.name}
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "#444", marginTop: 4, letterSpacing: "0.05em" }}>
                    {item.category}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginTop: 12,
                    }}
                  >
                    <motion.button
                      style={{
                        background: "none",
                        border: "1px solid #2a2a2a",
                        color: "#fff",
                        width: 28,
                        height: 28,
                        cursor: "pointer",
                        fontSize: "0.9rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      −
                    </motion.button>
                    <span style={{ fontSize: "0.8rem", minWidth: 16, textAlign: "center" }}>
                      {item.quantity}
                    </span>
                    <motion.button
                      style={{
                        background: "none",
                        border: "1px solid #2a2a2a",
                        color: "#fff",
                        width: 28,
                        height: 28,
                        cursor: "pointer",
                        fontSize: "0.9rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      +
                    </motion.button>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                  <div style={{ fontSize: "0.9rem", fontWeight: 300 }}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                  <motion.button
                    style={{
                      background: "none",
                      border: "none",
                      color: "#333",
                      cursor: "pointer",
                      fontSize: "0.65rem",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      transition: "color 0.2s",
                    }}
                    onClick={() => removeItem(item.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    Remove
                  </motion.button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div
            style={{
              background: "#0f0f0f",
              border: "1px solid #1a1a1a",
              padding: 32,
              position: "sticky",
              top: 128,
            }}
          >
            <div
              style={{
                fontSize: "0.65rem",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "#333",
                marginBottom: 24,
                fontWeight: 600,
              }}
            >
              Order Summary
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 8,
                fontSize: "0.8rem",
                color: "#555",
              }}
            >
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 8,
                fontSize: "0.8rem",
                color: "#555",
              }}
            >
              <span>Shipping</span>
              <span style={{ color: "#555" }}>Calculated at checkout</span>
            </div>
            <div
              style={{
                borderTop: "1px solid #1a1a1a",
                marginTop: 16,
                paddingTop: 16,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  fontSize: "0.7rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  color: "#888",
                }}
              >
                Total
              </span>
              <span style={{ fontSize: "1.2rem", fontWeight: 700 }}>
                ${subtotal.toFixed(2)}
              </span>
            </div>
            <motion.button className="btn-primary" style={{ width: "100%", marginTop: 28 }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
              Proceed to Checkout
            </motion.button>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
              <Link
                href="/products"
                className="btn-secondary"
                style={{ width: "100%", marginTop: 10, display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                Continue Shopping
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
