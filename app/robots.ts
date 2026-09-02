import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api/", "/cart", "/checkout?*"] },
      { userAgent: "Googlebot", allow: "/" },
    ],
    sitemap: "https://yolo.co/sitemap.xml",
    host: "https://yolo.co",
  };
}
