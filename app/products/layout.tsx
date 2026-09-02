import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Collection — YOLO Avenue Kennedy, Yaoundé",
  description: "La collection YOLO Cameroun — electronics, apparel, footwear, home & décor, beauty. Prix en FCFA, filtres par catégorie et prix, 44 produits. Livraison Avenue Kennedy Yaoundé. yolo.co",
};

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
