import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mot de passe oublié — YOLO Cameroun",
  description: "Réinitialisez votre mot de passe YOLO Cameroun. Compte Avenue Kennedy Yaoundé — yolo.co",
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
