import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Collection — YOLO Avenue Kennedy, Yaoundé",
  description: "La collection YOLO Cameroun — ordinateurs, audio, claviers, accessoires connectes et electronique du quotidien. Prix en FCFA, filtres par categorie et prix. Livraison Avenue Kennedy Yaoundé. yolo.co",
};

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
