"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { useReducedMotion, motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { AnimatedInput } from "@/components/ui/AnimatedInput";
import { useAuthStore } from "@/stores/auth";

const STEPS = [
  { num: 1, label: "Business Info" },
  { num: 2, label: "About You" },
  { num: 3, label: "Confirm" },
];

const BUSINESS_TYPES = ["Electronics", "Fashion", "Food & Beverage", "Other"];

export default function PartnerPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [businessName, setBusinessName] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [message, setMessage] = useState("");

  const applyAsPartner = useAuthStore((s) => s.applyAsPartner);
  const shouldReduce = useReducedMotion();

  const wrapperRef = useRef<HTMLDivElement>(null);
  const stepRef = useRef<HTMLDivElement>(null);

  const animateStep = () => {
    if (shouldReduce || !stepRef.current) return;
    const els = stepRef.current.querySelectorAll("[data-anim]");
    gsap.set(els, { opacity: 0, y: 20 });
    gsap.to(els, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      stagger: 0.06,
      ease: "power3.out",
    });
  };

  useEffect(() => {
    animateStep();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, shouldReduce]);

  const validateStep = (s: number) => {
    const e: Record<string, string> = {};
    if (s === 1) {
      if (!businessName.trim()) e.businessName = "Required";
      if (!contactName.trim()) e.contactName = "Required";
      if (!phone.trim()) e.phone = "Required";
      if (!city.trim()) e.city = "Required";
      if (!businessType) e.businessType = "Required";
    }
    if (s === 2) {
      if (!message.trim()) e.message = "Tell us about your business";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextStep = () => {
    if (!validateStep(step)) return;
    setDirection(1);
    setStep((s) => Math.min(s + 1, 3));
  };

  const prevStep = () => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleSubmit = async () => {
    setLoading(true);
    const res = await applyAsPartner(businessName.trim(), contactName.trim(), phone.trim(), city.trim(), businessType);
    setLoading(false);
    if (res.success) {
      toast.success("Application submitted!");
      router.push("/");
    } else {
      toast.error(res.error || "Submission failed");
    }
  };

  return (
    <div className="page-content">
      <div className="container" style={{ maxWidth: 560 }} ref={wrapperRef}>
        <div style={{ fontSize: "0.6rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "#666", marginBottom: 12 }}>
          Partner with YOLO
        </div>
        <h1 style={{ fontSize: "2rem", fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>
          Sell on YOLO
        </h1>
        <p style={{ color: "#777", marginBottom: 32, fontSize: "0.85rem" }}>
          Reach thousands of customers across Cameroun.
        </p>

        {/* Progress */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 40 }}>
          {STEPS.map((s, i) => (
            <div key={s.num} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  background: step >= s.num ? "#fff" : "transparent",
                  color: step >= s.num ? "#0b0b0b" : "#555",
                  border: `1px solid ${step >= s.num ? "#fff" : "#333"}`,
                  transition: "all 0.3s",
                }}
              >
                {s.num}
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ width: 40, height: 1, background: step > s.num ? "#fff" : "#333", transition: "background 0.3s" }} />
              )}
            </div>
          ))}
          <span style={{ fontSize: "0.6rem", color: "#555", letterSpacing: "0.1em", marginLeft: 8 }}>
            {STEPS[step - 1].label}
          </span>
        </div>

        {/* Step content */}
        <div style={{ position: "relative", overflow: "hidden" }}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              ref={stepRef}
              custom={direction}
              initial={shouldReduce ? {} : { opacity: 0, x: direction * 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={shouldReduce ? {} : { opacity: 0, x: direction * -60 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              {step === 1 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div data-anim>
                    <AnimatedInput
                      id="biz-name"
                      label="Business name"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      error={errors.businessName}
                    />
                  </div>
                  <div data-anim>
                    <AnimatedInput
                      id="biz-contact"
                      label="Contact name"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      error={errors.contactName}
                    />
                  </div>
                  <div data-anim style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <AnimatedInput
                      id="biz-phone"
                      label="Phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      error={errors.phone}
                    />
                    <AnimatedInput
                      id="biz-city"
                      label="City"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      error={errors.city}
                    />
                  </div>
                  <div data-anim>
                    <label style={{ fontSize: "0.7rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "#666", display: "block", marginBottom: 8 }}>
                      Business type
                    </label>
                    <select
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value)}
                      style={{
                        width: "100%",
                        height: 52,
                        background: "#0b0b0b",
                        border: `1px solid ${errors.businessType ? "#ef4444" : "#222"}`,
                        color: businessType ? "#fff" : "#666",
                        padding: "0 14px",
                        fontSize: "0.85rem",
                        fontFamily: "inherit",
                        outline: "none",
                        cursor: "pointer",
                        appearance: "none",
                      }}
                    >
                      <option value="" disabled>Select type</option>
                      {BUSINESS_TYPES.map((t) => (
                        <option key={t} value={t} style={{ background: "#111" }}>{t}</option>
                      ))}
                    </select>
                    {errors.businessType && (
                      <p style={{ color: "#ef4444", fontSize: "0.68rem", marginTop: 6 }}>{errors.businessType}</p>
                    )}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div data-anim>
                    <label style={{ fontSize: "0.7rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "#666", display: "block", marginBottom: 8 }}>
                      Tell us about your business
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={6}
                      placeholder="What do you sell? Why YOLO?"
                      style={{
                        width: "100%",
                        background: "#0b0b0b",
                        border: `1px solid ${errors.message ? "#ef4444" : "#222"}`,
                        color: "#fff",
                        padding: "16px 14px",
                        fontSize: "0.85rem",
                        fontFamily: "inherit",
                        outline: "none",
                        resize: "vertical",
                        lineHeight: 1.6,
                      }}
                    />
                    {errors.message && (
                      <p style={{ color: "#ef4444", fontSize: "0.68rem", marginTop: 6 }}>{errors.message}</p>
                    )}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div data-anim style={{ background: "#111", border: "1px solid #1a1a1a", padding: "20px 16px" }}>
                    <div style={{ fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#555", marginBottom: 16, fontWeight: 600 }}>
                      Application Summary
                    </div>
                    {[
                      ["Business", businessName],
                      ["Contact", contactName],
                      ["Phone", phone],
                      ["City", city],
                      ["Type", businessType],
                    ].map(([label, value]) => (
                      <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1a1a1a" }}>
                        <span style={{ fontSize: "0.72rem", color: "#555", letterSpacing: "0.05em" }}>{label}</span>
                        <span style={{ fontSize: "0.72rem", color: "#fff" }}>{value}</span>
                      </div>
                    ))}
                  </div>
                  <div data-anim style={{ background: "#111", border: "1px solid #1a1a1a", padding: "16px" }}>
                    <div style={{ fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#555", marginBottom: 8, fontWeight: 600 }}>
                      Your message
                    </div>
                    <p style={{ fontSize: "0.8rem", color: "#aaa", lineHeight: 1.6 }}>{message}</p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
          {step > 1 && (
            <motion.button
              type="button"
              onClick={prevStep}
              whileHover={shouldReduce ? {} : { scale: 1.02 }}
              whileTap={shouldReduce ? {} : { scale: 0.97 }}
              style={{
                flex: "0 0 auto",
                height: 52,
                padding: "0 28px",
                background: "transparent",
                color: "#fff",
                fontSize: "0.75rem",
                fontWeight: 700,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                border: "1px solid #333",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Back
            </motion.button>
          )}
          <motion.button
            type="button"
            onClick={step === 3 ? handleSubmit : nextStep}
            disabled={loading}
            whileHover={shouldReduce ? {} : { scale: 1.02 }}
            whileTap={shouldReduce ? {} : { scale: 0.97 }}
            style={{
              flex: 1,
              height: 52,
              background: "#fff",
              color: "#0b0b0b",
              fontSize: "0.75rem",
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              border: "none",
              cursor: loading ? "wait" : "pointer",
              fontFamily: "inherit",
              opacity: loading ? 0.6 : 1,
              transition: "opacity 0.2s",
            }}
          >
            {loading ? "Submitting…" : step === 3 ? "Submit application" : "Continue"}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
