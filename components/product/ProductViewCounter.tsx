"use client";

import { useEffect, useState } from "react";

interface Props {
  slug: string;
  initialViews: number;
}

const sessionsKey = (slug: string) => `yolo:viewed-session:${slug}`;
const totalKey = (slug: string) => `yolo:views-total:${slug}`;

export default function ProductViewCounter({ slug, initialViews }: Props) {
  const [views, setViews] = useState(initialViews);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const total = Number(localStorage.getItem(totalKey(slug)) || initialViews);
    if (!sessionStorage.getItem(sessionsKey(slug))) {
      sessionStorage.setItem(sessionsKey(slug), "1");
      const next = total + 1;
      localStorage.setItem(totalKey(slug), String(next));
      setViews(next);
    } else {
      setViews(total);
    }
  }, [slug, initialViews]);

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.68rem", color: "#777", letterSpacing: "0.1em", textTransform: "uppercase" }}>
      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
      {views.toLocaleString("fr-CM")} vues
    </span>
  );
}