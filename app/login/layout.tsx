import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connexion — YOLO Cameroun",
  description: "Connectez-vous à votre compte YOLO Cameroun pour vos commandes, avis et adresses. Avenue Kennedy Yaoundé — yolo.co",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
