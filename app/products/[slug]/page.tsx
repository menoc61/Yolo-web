import { notFound } from "next/navigation";
import { getProductBySlug, getProductIds } from "@/lib/products";
import { ProductActions } from "@/components/product/ProductActions";
import { AnimatedCarousel } from "@/components/ui/AnimatedCarousel";
import { formatPrice } from "@/lib/currency";
import { ProductRating } from "@/components/product/ProductRating";
import ProductViewCounter from "@/components/product/ProductViewCounter";
import { RecommendedSection } from "@/components/product/RecommendedProducts";
import { ShopMapSection } from "@/components/cms/ShopMapSection";
import { ProductJsonLd } from "@/components/seo/JsonLd";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const ids = await getProductIds();
  return ids.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: `${product.name} — YOLO | ${product.category} · ${formatPrice(product.price)} FCFA`,
    description: `${product.description} — ${product.rating ?? 4.8}★ (${product.reviewCount ?? 0} avis) · ${formatPrice(product.price)} FCFA · Avenue Kennedy, Yaoundé · yolo.co`,
    alternates: { canonical: `https://yolo.co/products/${slug}` },
    openGraph: {
      title: `${product.name} — YOLO | ${product.category} · ${formatPrice(product.price)} FCFA`,
      description: `${product.description} — ${product.rating ?? 4.8}★ (${product.reviewCount ?? 0} avis) · ${formatPrice(product.price)} FCFA`,
      url: `https://yolo.co/products/${slug}`,
      siteName: "YOLO",
      locale: "fr_CM",
      type: "website",
      images: [{ url: product.images[0], width: 800, height: 600, alt: product.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} — YOLO | ${formatPrice(product.price)} FCFA`,
      description: `${product.rating ?? 4.8}★ (${product.reviewCount ?? 0} avis) · ${formatPrice(product.price)} FCFA`,
      images: [product.images[0]],
    },
    keywords: [product.name, product.category, "YOLO", "FCFA", "Avenue Kennedy", "Yaoundé", "Cameroun"],
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  return (
    <>
      <ProductJsonLd product={product} />
      <div className="page-content" style={{ paddingBottom: 0 }}>
      <div className="container">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" style={{ fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#555", marginBottom: 18, display: "flex", gap: 8 }}>
          <a href="/products" style={{ color: "#777", textDecoration: "none" }}>Collection</a>
          <span style={{ color: "#444" }}>/</span>
          <a href={`/products?category=${encodeURIComponent(product.category)}`} style={{ color: "#fff", textDecoration: "none" }}>{product.category}</a>
          {product.outOfStock && <span style={{ marginLeft: 8, background: "#ef4444", color: "#fff", padding: "2px 6px", fontSize: "0.6rem" }}>RUPTURE</span>}
          {product.inventory <= 3 && !product.outOfStock && <span style={{ marginLeft: 8, background: "#facc15", color: "#0b0b0b", padding: "2px 6px", fontSize: "0.6rem" }}>Plus que {product.inventory}</span>}
        </nav>

        <div className="product-detail">
          {/* Gallery — optimized animated carousel with 4 images, micro-interactions */}
          <div className="product-detail__gallery">
            <AnimatedCarousel
              images={product.images}
              alt={product.name}
              priority
              autoPlay
              intervalMs={3800}
              aspectRatio="3/4"
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="rounded-none"
            />
            <div style={{ display: "flex", gap: 8, padding: 10, background: "#0f0f0f", borderTop: "1px solid #1a1a1a", fontSize: "0.6rem", color: "#555", letterSpacing: "0.08em", textTransform: "uppercase", justifyContent: "space-between" }}>
              <span>Created {new Date(product.createdAt).toLocaleDateString("fr-CM")} · by {product.createdBy}</span>
              <span>{product.inventory} en stock · {product.available ? "Dispo" : "Indispo"}</span>
            </div>
          </div>

          {/* Info — tight spacing, balanced */}
          <div className="product-detail__info">
            <div className="product-detail__category">{product.category}</div>
            <h1 className="product-detail__name">{product.name}</h1>
            <div className="product-detail__price">{formatPrice(product.price)} <span style={{ fontSize: "0.62rem", color: "#666", letterSpacing: "0.1em", fontWeight: 600 }}>FCFA · yolo.co</span> {product.originalPrice && <span style={{ fontSize: "0.78rem", color: "#444", textDecoration: "line-through" }}>{formatPrice(product.originalPrice)}</span>}</div>
            <div style={{ marginTop: 10 }}>
              <ProductRating rating={product.rating ?? 4.8} count={product.reviewCount ?? 127} compact={false} />
            </div>
            <div style={{ marginTop: 8 }}>
              <ProductViewCounter slug={slug} initialViews={product.views ?? 0} />
            </div>
            <p className="product-detail__description" style={{ marginTop: 12 }}>{product.description}</p>

            <ul className="product-detail__details">
              {product.details.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>

            <ProductActions product={product} />
            <div style={{ marginTop: 14, fontSize: "0.65rem", color: "#333", lineHeight: 1.6 }}>
              SKU {product.id} · Créé {new Date(product.createdAt).toLocaleDateString()} · {product.deletedAt ? `Supprimé ${product.deletedAt} par ${product.deletedBy}` : "Actif"} · yolo.co Avenue Kennedy
            </div>
          </div>
        </div>

        {/* Recommendation — backend-ready */}
        <RecommendedSection currentId={product.id} />
        {/* Micro-interactions + Leaflet shops */}
        <ShopMapSection productSlug={product.slug} productName={product.name} />
      </div>
    </div>
    </>
  );
}
