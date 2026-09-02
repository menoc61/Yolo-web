"use client";
import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | null;
  icon?: React.ReactNode;
}

export function AnimatedInput({ label, error, icon, id, ...props }: Props) {
  const [focused, setFocused] = useState(false);
  const shouldReduce = useReducedMotion();
  const hasValue = Boolean(props.value && String(props.value).length > 0);
  const isActive = focused || hasValue;

  return (
    <div style={{ position: "relative" }}>
      <motion.div
        animate={
          shouldReduce ? {} : focused ? { scale: 1.01 } : { scale: 1 }
        }
        transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "relative",
          border: `1px solid ${error ? "#ef4444" : focused ? "#fff" : "#222"}`,
          background: "#0b0b0b",
          transition: "border-color 120ms ease",
        }}
      >
        <input
          id={id}
          {...props}
          onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
          placeholder={isActive ? props.placeholder : ""}
          style={{
            width: "100%",
            background: "transparent",
            border: "none",
            color: "#fff",
            padding: "22px 14px 10px 14px",
            fontSize: "0.85rem",
            outline: "none",
          }}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        <motion.label
          htmlFor={id}
          animate={
            shouldReduce ? {} : isActive ? { y: -10, scale: 0.78, color: error ? "#ef4444" : "#aaa" } : { y: 0, scale: 1, color: "#666" }
          }
          transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
          style={{
            position: "absolute",
            left: 14,
            top: isActive ? 8 : 16,
            fontSize: "0.7rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            pointerEvents: "none",
            transformOrigin: "left top",
          }}
        >
          {label}
        </motion.label>
        {icon && <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#444" }}>{icon}</span>}
      </motion.div>
      <AnimatePresence>
        {error && (
          <motion.p
            id={`${id}-error`}
            initial={shouldReduce ? { opacity: 0 } : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            style={{ color: "#ef4444", fontSize: "0.68rem", marginTop: 6, letterSpacing: "0.04em" }}
            role="alert"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
