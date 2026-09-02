"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function useReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return prefersReduced;
}

export interface AnimationOptions {
  delay?: number;
  duration?: number;
  ease?: string;
  stagger?: number | { amount: number };
}

export interface SectionAnimationOptions extends AnimationOptions {
  trigger?: Element | string;
  start?: string;
  end?: string;
  scrub?: boolean | number;
  markers?: boolean;
}

export function useGSAPAnimation(
  callback: (ctx: gsap.Context) => void,
  dependencies: React.DependencyList = []
) {
  const ctxRef = useRef<gsap.Context | null>(null);

  useEffect(() => {
    ctxRef.current = gsap.context((ctx) => {
      callback(ctx);
    });

    return () => {
      ctxRef.current?.revert();
    };
  }, dependencies);
}

export function useSectionReveal(
  ref: React.RefObject<HTMLElement>,
  options: SectionAnimationOptions = {}
) {
  const {
    delay = 0,
    duration = 1,
    ease = "expo.out",
    trigger,
    start = "top 80%",
    end = "bottom 20%",
    scrub = false,
    markers = false,
  } = options;

  useGSAPAnimation((ctx) => {
    const element = ref.current;
    if (!element) return;

    const triggers = element.querySelectorAll("[data-reveal]");
    if (triggers.length === 0) return;

    triggers.forEach((el, index) => {
      const elementDelay = delay + (index * 0.1);

      ctx.add(
        gsap.fromTo(
          el,
          {
            opacity: 0,
            y: 40,
          },
          {
            opacity: 1,
            y: 0,
            duration,
            ease,
            delay: elementDelay,
            scrollTrigger: {
              trigger: trigger || el,
              start,
              end,
              scrub,
              markers,
              toggleActions: "play none none reverse",
            },
          }
        )
      );
    });
  }, [delay, duration, ease, trigger, start, end, scrub, markers]);
}

export function useProductImageScale(
  refs: React.RefObject<HTMLImageElement>[] | React.RefObject<React.RefObject<HTMLImageElement>[]>,
  options: AnimationOptions = {}
) {
  const {
    delay = 0,
    duration = 1.6,
    ease = "expo.inOut",
    stagger = 0.4,
  } = options;

  useGSAPAnimation((ctx) => {
    const refArray = Array.isArray(refs) ? refs : (refs.current ?? []);
    const images = refArray.map((ref) => ref.current).filter(Boolean) as HTMLImageElement[];
    if (images.length === 0) return;

    const staggerAmount = typeof stagger === "number" ? stagger : stagger.amount / images.length;

    images.forEach((img, index) => {
      ctx.add(
        gsap.fromTo(
          img,
          { scale: 1.4 },
          {
            scale: 1,
            duration,
            ease,
            delay: delay + index * staggerAmount,
          }
        )
      );
    });
  }, [delay, duration, ease, stagger, refs]);
}

export function useStaggeredFadeIn(
  refs: (React.RefObject<HTMLElement> | null)[],
  options: AnimationOptions = {}
) {
  const {
    delay = 0,
    duration = 0.8,
    ease = "power3.out",
    stagger = 0.1,
    y = 20,
  } = options;

  useGSAPAnimation((ctx) => {
    const elements = refs.map((ref) => ref.current).filter(Boolean) as HTMLElement[];
    if (elements.length === 0) return;

    const staggerAmount = typeof stagger === "number" ? stagger : stagger.amount / elements.length;

    elements.forEach((el, index) => {
      ctx.add(
        gsap.fromTo(
          el,
          { opacity: 0, y },
          {
            opacity: 1,
            y: 0,
            duration,
            ease,
            delay: delay + index * staggerAmount,
          }
        )
      );
    });
  }, [delay, duration, ease, stagger, y, refs]);
}

export function useLineTextAnimation(
  ref: React.RefObject<HTMLElement>,
  options: AnimationOptions & { skewY?: number } = {}
) {
  const {
    delay = 0,
    duration = 1.3,
    ease = "power4.out",
    stagger = 0.18,
    skewY = 7,
  } = options;

  useGSAPAnimation((ctx) => {
    const element = ref.current;
    if (!element) return;

    const spans = element.querySelectorAll("span");
    if (spans.length === 0) return;

    const staggerAmount = typeof stagger === "number" ? stagger : stagger.amount / spans.length;

    spans.forEach((span, index) => {
      ctx.add(
        gsap.fromTo(
          span,
          { y: "110%", skewY },
          {
            y: "0%",
            skewY: 0,
            duration,
            ease,
            delay: delay + index * staggerAmount,
          }
        )
      );
    });
  }, [delay, duration, ease, stagger, skewY, ref]);
}

export function useIntroOverlayAnimation(
  topPanelSelector: string,
  bottomPanelSelector: string,
  options: AnimationOptions = {}
) {
  const {
    delay = 0,
    duration = 1.2,
    ease = "expo.inOut",
    stagger = 0.08,
  } = options;

  useGSAPAnimation((ctx) => {
    const topPanels = document.querySelectorAll(topPanelSelector);
    const bottomPanels = document.querySelectorAll(bottomPanelSelector);

    if (topPanels.length > 0) {
      ctx.add(
        gsap.to(topPanels, {
          y: "-100%",
          duration,
          ease,
          stagger,
          delay,
        })
      );
    }

    if (bottomPanels.length > 0) {
      ctx.add(
        gsap.to(bottomPanels, {
          y: "100%",
          duration,
          ease,
          stagger,
          delay: delay - 0.2,
        }),
        "-=1.0"
      );
    }
  }, [delay, duration, ease, stagger, topPanelSelector, bottomPanelSelector]);
}

export function useScrollReveal(
  selector: string = "[data-scroll-reveal]",
  options: {
    y?: number;
    opacity?: number;
    duration?: number;
    ease?: string;
    stagger?: number;
    start?: string;
    batch?: boolean;
  } = {}
) {
  const {
    y = 40,
    opacity = 0,
    duration = 0.8,
    ease = "power3.out",
    stagger = 0.1,
    start = "top 85%",
    batch = true,
  } = options;

  const reduced = useReducedMotion();

  useGSAPAnimation((ctx) => {
    if (reduced) {
      gsap.set(selector, { opacity: 1, y: 0 });
      return;
    }

    if (batch) {
      ScrollTrigger.batch(selector, {
        onEnter: (elements) => {
          gsap.fromTo(
            elements,
            { opacity, y },
            {
              opacity: 1,
              y: 0,
              duration,
              ease,
              stagger,
              overwrite: true,
            }
          );
        },
        start,
      });
    } else {
      const elements = document.querySelectorAll(selector);
      elements.forEach((el, i) => {
        gsap.fromTo(
          el,
          { opacity, y },
          {
            opacity: 1,
            y: 0,
            duration,
            ease,
            delay: i * stagger,
            scrollTrigger: {
              trigger: el,
              start,
              toggleActions: "play none none none",
            },
          }
        );
      });
    }
  }, [selector, y, opacity, duration, ease, stagger, start, batch, reduced]);
}