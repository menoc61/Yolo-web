import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Panier — YOLO Avenue Kennedy",
  description: "Votre panier YOLO — articles, quantités et total en FCFA. Paiement sécurisé Visa, Orange Money, MTN MoMo. Livraison Avenue Kennedy Yaoundé. yolo.co",
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
