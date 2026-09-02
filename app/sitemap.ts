import type { MetadataRoute } from "next";
import rawProducts from "@/data/products.json";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://yolo.co";
  const now = new Date();
  const products = (rawProducts as any[]).map((p) => ({
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
