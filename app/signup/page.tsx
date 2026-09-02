"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import gsap from "gsap";
import { useReducedMotion, motion } from "motion/react";
import { toast } from "sonner";
import { AnimatedInput } from "@/components/ui/AnimatedInput";
import { useAuthStore } from "@/stores/auth";

export default function SignupPage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const register = useAuthStore((s) => s.register);
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle);
  const shouldReduce = useReducedMotion();

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (shouldReduce || !containerRef.current) return;
    const els = containerRef.current.querySelectorAll("[data-anim]");
    gsap.set(els, { opacity: 0, y: 24 });
    gsap.to(els, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.08,
      ease: "power3.out",
      delay: 0.1,
    });
  }, [shouldReduce]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!firstName.trim()) e.firstName = "First name is required";
    if (!lastName.trim()) e.lastName = "Last name is required";
    if (!email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Invalid email";
    if (!password) e.password = "Password is required";
    else if (password.length < 6) e.password = "Min 6 characters";
    if (password !== confirmPassword) e.confirmPassword = "Passwords don't match";
    if (!agreed) e.agreed = "You must agree to the terms";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const res = await register(`${firstName.trim()} ${lastName.trim()}`, email.trim(), password);
    setLoading(false);
    if (res.success) {
      toast.success("Account created!");
      router.push("/");
    } else {
      toast.error(res.error || "Signup failed");
    }
  };

  const handleGoogle = async () => {
    const res = await loginWithGoogle();
    if (res.success) {
      toast.success("Signed up with Google");
      router.push("/");
    } else {
      toast.error("Google sign-up failed");
    }
  };

  return (
    <div className="page-content">
      <div className="container" style={{ maxWidth: 480 }} ref={containerRef}>
        <div data-anim style={{ fontSize: "0.6rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "#666", marginBottom: 12 }}>
          Join YOLO
        </div>
        <h1 data-anim style={{ fontSize: "2rem", fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>
          Create account
        </h1>
        <p data-anim style={{ color: "#777", marginBottom: 32, fontSize: "0.85rem" }}>
          Start shopping, track orders, and save your favorites.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div data-anim style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <AnimatedInput
              id="signup-first"
              label="First name"
              autoComplete="given-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              error={errors.firstName}
            />
            <AnimatedInput
              id="signup-last"
              label="Last name"
              autoComplete="family-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              error={errors.lastName}
            />
          </div>
          <div data-anim>
            <AnimatedInput
              id="signup-email"
              label="Email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
            />
          </div>
          <div data-anim>
            <AnimatedInput
              id="signup-password"
              label="Password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
            />
          </div>
          <div data-anim>
            <AnimatedInput
              id="signup-confirm"
              label="Confirm password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
            />
          </div>

          <div data-anim style={{ display: "flex", alignItems: "flex-start", gap: 10, marginTop: 4 }}>
            <motion.button
              type="button"
              onClick={() => setAgreed(!agreed)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              style={{
                width: 18,
                height: 18,
                flexShrink: 0,
                marginTop: 2,
                background: agreed ? "#fff" : "transparent",
                border: `1px solid ${errors.agreed ? "#ef4444" : agreed ? "#fff" : "#333"}`,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s",
              }}
            >
              {agreed && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.5 6.5L9 1" stroke="#0b0b0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </motion.button>
            <span style={{ fontSize: "0.72rem", color: "#666", lineHeight: 1.5 }}>
              I agree to the{" "}
              <Link href="/terms" style={{ color: "#fff", textDecoration: "none" }}>
                Terms &amp; Conditions
              </Link>
            </span>
          </div>
          {errors.agreed && (
            <p style={{ color: "#ef4444", fontSize: "0.68rem", marginTop: -8 }}>{errors.agreed}</p>
          )}

          <div data-anim>
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={shouldReduce ? {} : { scale: 1.02 }}
              whileTap={shouldReduce ? {} : { scale: 0.97 }}
              style={{
                width: "100%",
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
              {loading ? "Creating…" : "Create account"}
            </motion.button>
          </div>
        </form>

        {/* Divider */}
        <div data-anim style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0 16px" }}>
          <div style={{ flex: 1, height: 1, background: "#222" }} />
          <span style={{ fontSize: "0.62rem", color: "#555", letterSpacing: "0.2em", textTransform: "uppercase" }}>or</span>
          <div style={{ flex: 1, height: 1, background: "#222" }} />
        </div>

        {/* Google button */}
        <div data-anim>
          <motion.button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            whileHover={shouldReduce ? {} : { scale: 1.02 }}
            whileTap={shouldReduce ? {} : { scale: 0.97 }}
            style={{
              width: "100%",
              height: 52,
              background: "transparent",
              color: "#fff",
              fontSize: "0.75rem",
              fontWeight: 600,
              letterSpacing: "0.08em",
              border: "1px solid #333",
              cursor: loading ? "wait" : "pointer",
              fontFamily: "inherit",
              opacity: loading ? 0.6 : 1,
              transition: "opacity 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
            }}
          >
            <svg width={18} height={18} viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z" />
              <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z" />
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z" />
            </svg>
            Continue with Google
          </motion.button>
        </div>

        <div data-anim style={{ marginTop: 24, textAlign: "center" }}>
          <Link href="/login" style={{ fontSize: "0.75rem", color: "#666", textDecoration: "none", letterSpacing: "0.05em" }}>
            Already have an account? <span style={{ color: "#fff" }}>Sign in</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
