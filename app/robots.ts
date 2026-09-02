import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/icons/", "/images/"],
        disallow: ["/api/", "/cart", "/checkout", "/login", "/signup", "/profile", "/forgot-password"],
      },
    ],
    sitemap: "https://yolo-cm.vercel.app/sitemap.xml",
    host: "https://yolo-cm.vercel.app",
  };
}
