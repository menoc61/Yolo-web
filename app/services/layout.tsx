import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services — YOLO Avenue Kennedy, Yaoundé",
  description: "Services YOLO Cameroun — livraison express Yaoundé/Cameroun/CEMAC, retrait en boutique Avenue Kennedy, paiement FCFA Visa/OM/MoMo/COD. Essayage, retours, réparation. yolo.co",
};

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
