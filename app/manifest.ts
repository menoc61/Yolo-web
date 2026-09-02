import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "yolo-co",
    name: "YOLO — Avenue Kennedy, Yaoundé",
    short_name: "YOLO",
    description: "Premium e-commerce Cameroun — FCFA — yolo.co",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0b0b0b",
    theme_color: "#0b0b0b",
    categories: ["shopping", "business", "lifestyle"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    lang: "fr-CM",
    shortcuts: [
      {
        name: "Tous les produits",
        short_name: "Produits",
        url: "/products",
      },
      {
        name: "Panier",
        short_name: "Panier",
        url: "/cart",
      },
    ],
  };
}