import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Créer un compte — YOLO Cameroun",
  description: "Créez votre compte YOLO Cameroun — historique commandes, avis, adresses de livraison Avenue Kennedy Yaoundé. Prix FCFA. yolo.co",
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
