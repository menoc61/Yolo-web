"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

interface AnimatedCarouselProps {
  images: string[];
  alt: string;
  priority?: boolean;
  autoPlay?: boolean;
  intervalMs?: number;
  aspectRatio?: string; // e.g. "3/4"
  sizes?: string;
  className?: string;
}

const BLUR_PLACEHOLDER =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MDAiIGhlaWdodD0iMTAwMCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzFhMWExYSIvPjwvc3ZnPg==";

export function AnimatedCarousel({
  images,
  alt,
  priority = false,
  autoPlay = true,
  intervalMs = 3200,
  aspectRatio = "3/4",
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  className = "",
}: AnimatedCarouselProps) {
  const [index, setIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const shouldReduce = useReducedMotion();
  const timerRef = useRef<number | null>(null);

  const count = images.length;

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % count);
  }, [count]);

  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + count) % count);
  }, [count]);

  // Auto-play with pause on hover/drag + reduced motion
  useEffect(() => {
    if (shouldReduce || !autoPlay || isHovered || isDragging || count <= 1) return;
    timerRef.current = window.setInterval(next, intervalMs);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [shouldReduce, autoPlay, isHovered, isDragging, intervalMs, next, count]);

  // Keyboard nav
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, [next, prev]);

  if (count === 0) return null;
  if (count === 1) {
    return (
      <div className={`relative overflow-hidden ${className}`} style={{ aspectRatio }}>
        <Image
          src={images[0]}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          placeholder="blur"
          blurDataURL={BLUR_PLACEHOLDER}
          style={{ objectFit: "cover" }}
          fetchPriority={priority ? "high" : "auto"}
          quality={85}
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label={alt}
      className={`group relative overflow-hidden bg-[#1a1a1a] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 ${className}`}
      style={{ aspectRatio }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
    >
      {/* Slides - transform/opacity only, 220ms ease-out, staggered not needed here */}
      <AnimatePresence initial={false} mode="popLayout" custom={index}>
        <motion.div
          key={index}
          className="absolute inset-0 will-change-transform"
          initial={
            shouldReduce
              ? { opacity: 0 }
              : { opacity: 0, transform: "translateX(16px) scale(1.02)" }
          }
          animate={{ opacity: 1, transform: "translateX(0px) scale(1)" }}
          exit={
            shouldReduce
              ? { opacity: 0 }
              : { opacity: 0, transform: "translateX(-16px) scale(0.99)" }
          }
          transition={
            shouldReduce
              ? { duration: 0.01 }
              : { duration: 0.42, ease: [0.23, 1, 0.32, 1] }
          }
          drag={shouldReduce ? false : "x"}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.14}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={(_, info) => {
            setIsDragging(false);
            const threshold = 48;
            if (info.offset.x < -threshold) next();
            else if (info.offset.x > threshold) prev();
          }}
        >
          <Image
            src={images[index]}
            alt={`${alt} — image ${index + 1} of ${count}`}
            fill
            sizes={sizes}
            priority={priority && index === 0}
            placeholder="blur"
            blurDataURL={BLUR_PLACEHOLDER}
            style={{ objectFit: "cover" }}
            draggable={false}
            fetchPriority={priority && index === 0 ? "high" : "auto"}
            quality={priority ? 85 : 80}
          />
          {/* Micro highlight on hover */}
          <motion.div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/15 to-transparent opacity-0 group-hover:opacity-100"
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Micro: progress bar */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] bg-white/10">
        <motion.div
          key={index}
          initial={{ transform: "scaleX(0)" }}
          animate={{ transform: "scaleX(1)" }}
          transition={
            shouldReduce || isHovered || isDragging
              ? { duration: 0 }
              : { duration: intervalMs / 1000, ease: "linear" }
          }
          style={{ transformOrigin: "left", height: "100%", background: "white" }}
        />
      </div>

      {/* Arrows - micro scale on hover, gated to pointer:fine via CSS */}
      <motion.button
        type="button"
        aria-label="Previous image"
        onClick={prev}
        className="absolute left-2 top-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center rounded-full bg-black/55 text-white backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-[150ms] ease-[var(--ease-out,linear)]"
        style={{ display: count <= 1 ? "none" : undefined }}
        whileHover={shouldReduce ? undefined : { scale: 1.08 }}
        whileTap={shouldReduce ? undefined : { scale: 0.94 }}
        transition={shouldReduce ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 28 }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </motion.button>

      <motion.button
        type="button"
        aria-label="Next image"
        onClick={next}
        className="absolute right-2 top-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center rounded-full bg-black/55 text-white backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-[150ms] ease-[var(--ease-out,linear)]"
        style={{ display: count <= 1 ? "none" : undefined }}
        whileHover={shouldReduce ? undefined : { scale: 1.08 }}
        whileTap={shouldReduce ? undefined : { scale: 0.94 }}
        transition={shouldReduce ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 28 }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </motion.button>

      {/* Dots - micro pulse */}
      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5">
        {images.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === index}
            onClick={() => setIndex(i)}
            className="group/dot relative grid place-items-center p-1"
          >
            <motion.span
              className={`block h-1.5 rounded-full transition-colors ${i === index ? "w-6 bg-white" : "w-1.5 bg-white/45 group-hover/dot:bg-white/70"}`}
              animate={i === index && !shouldReduce ? { scale: [1, 1.08, 1] } : { scale: 1 }}
              transition={i === index && !shouldReduce ? { duration: 0.35, ease: [0.23, 1, 0.32, 1] } : { duration: 0.15 }}
              layout
            />
          </button>
        ))}
      </div>

      {/* Count badge — bottom-right above dots, clear of wishlist heart */}
      <div className="pointer-events-none absolute right-3 bottom-8 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-medium tracking-wide text-white backdrop-blur border border-white/10">
        {index + 1} / {count}
      </div>
    </div>
  );
}
