"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import gsap from "gsap";
import { useReducedMotion, motion } from "motion/react";
import { toast } from "sonner";
import { AnimatedInput } from "@/components/ui/AnimatedInput";
import { useAuthStore } from "@/stores/auth";

function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const resetPassword = useAuthStore((s) => s.resetPassword);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Invalid email");
      return;
    }
    setError(undefined);
    setLoading(true);
    const res = await resetPassword(email.trim());
    setLoading(false);
    if (res.success) {
      toast.success("Reset link sent — check your inbox");
      router.push("/login?reset=1");
    } else {
      toast.error(res.error || "Reset failed");
    }
  };

  return (
    <div className="page-content">
      <div className="container" style={{ maxWidth: 480 }} ref={containerRef}>
        <div data-anim style={{ fontSize: "0.6rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "#666", marginBottom: 12 }}>
          Reset password
        </div>
        <h1 data-anim style={{ fontSize: "2rem", fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>
          Forgot password?
        </h1>
        <p data-anim style={{ color: "#777", marginBottom: 32, fontSize: "0.85rem" }}>
          Enter your email and we&apos;ll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div data-anim>
            <AnimatedInput
              id="reset-email"
              label="Email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={error}
            />
          </div>
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
              {loading ? "Sending…" : "Send reset link"}
            </motion.button>
          </div>
        </form>

        <div data-anim style={{ marginTop: 24, textAlign: "center" }}>
          <Link href="/login" style={{ fontSize: "0.75rem", color: "#666", textDecoration: "none", letterSpacing: "0.05em" }}>
            Remembered it? <span style={{ color: "#fff" }}>Back to sign in</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense>
      <ForgotPasswordForm />
    </Suspense>
  );
}
