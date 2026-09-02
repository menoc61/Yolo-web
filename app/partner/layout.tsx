import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Devenir partenaire — YOLO Cameroun",
  description: "Rejoignez YOLO comme partenaire — marketplace Avenue Kennedy Yaoundé, produits FCFA, logistique Cameroun & CEMAC. yolo.co",
};

export default function PartnerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
