"use client";
export function Skeleton({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`skeleton ${className}`} style={{ borderRadius: 4, ...style }} aria-hidden />;
}
export function ProductCardSkeleton() {
  return (
    <div className="product-card">
      <div className="product-card__image-wrap skeleton" style={{ background: "#1a1a1a" }} />
      <div style={{ padding: 16, display: "grid", gap: 8 }}>
        <div className="skeleton" style={{ height: 10, width: "40%" }} />
        <div className="skeleton" style={{ height: 14, width: "70%" }} />
        <div className="skeleton" style={{ height: 10, width: "30%" }} />
      </div>
    </div>
  );
}
