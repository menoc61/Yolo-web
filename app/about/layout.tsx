import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "À propos — YOLO Avenue Kennedy, Yaoundé",
  description: "YOLO Cameroun — notre histoire, notre boutique physique Avenue Kennedy à Yaoundé. FAQ livraison, paiement FCFA (Visa, Orange Money, MoMo, COD), retours. yolo.co",
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
