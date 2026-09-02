import type { Metadata } from "next";
import { HeroSection } from "@/components/cms/HeroSection";
import { FeaturedProducts } from "@/components/product/FeaturedProducts";

export const metadata: Metadata = {
  title: "YOLO — Avenue Kennedy, Yaoundé | yolo.co",
  description: "YOLO Cameroun — boutique premium Avenue Kennedy Yaoundé. Electronics, apparel, lifestyle en FCFA. Livraison express, Orange Money, MoMo. Avénue Kennedy Yaoundé, Cameroun. yolo.co",
  alternates: { canonical: "https://yolo.co" },
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedProducts />
    </>
  );
}
