"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (document.body) document.body.style.visibility = "visible";
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(ref.current, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.45, ease: "power3.out", overwrite: true });
    });
    return () => ctx.revert();
  }, [pathname]);

  return <div ref={ref} style={{ willChange: "transform" }}>{children}</div>;
}
