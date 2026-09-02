import type { Metadata } from "next";
import { CheckoutClient } from "@/components/checkout/CheckoutClient";

export const metadata: Metadata = {
  title: "Checkout — YOLO Avenue Kennedy | FCFA",
  description: "Paiement sécurisé Visa, Orange Money, MTN MoMo, Cash on Delivery. Livraison Avenue Kennedy Yaoundé & Cameroun — yolo.co",
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}
