import type { Metadata } from "next";
import { ProfileClient } from "@/components/profile/ProfileClient";

export const metadata: Metadata = {
  title: "Mon profil — YOLO Avenue Kennedy",
  description: "Historique commandes, avis, ratings, retours — yolo.co",
};

export default function ProfilePage() {
  return <ProfileClient />;
}
