import type { MetadataRoute } from "next";
import { MOCK_PRODUCTS } from "@/lib/products";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://yolo-cm.vercel.app";
  const now = new Date();
  const products = MOCK_PRODUCTS.map((p) => ({
    url: `${base}/products/${p.slug}`,
    lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
    changeFrequency: "weekly" as const,
    priority: p.featured ? 0.9 : 0.7,
  }));
  return [
    { url: base, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/products`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    ...products,
  ];
}
