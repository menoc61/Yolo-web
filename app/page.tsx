import type { Metadata } from "next";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { HeroSection } from "@/components/cms/HeroSection";
import { FeaturedProducts } from "@/components/product/FeaturedProducts";
import { getFeaturedProducts } from "@/lib/products";
import { featuredProductsKey } from "@/lib/queryKeys";

export const metadata: Metadata = {
  title: "YOLO — Avenue Kennedy, Yaoundé | yolo.co",
  description: "YOLO Cameroun — boutique premium d'electronique et d'accessoires connectes, Avenue Kennedy Yaoundé. Prix en FCFA, livraison express, Orange Money et MoMo. yolo.co",
  alternates: { canonical: "https://yolo-cm.vercel.app" },
};

export default async function HomePage() {
  // Server-prefetch the featured catalog so the server-rendered HTML and the first
  // client render agree (fixes the skeleton-vs-product hydration mismatch).
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: featuredProductsKey,
    queryFn: getFeaturedProducts,
  });

  return (
    <>
      <HeroSection />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <FeaturedProducts />
      </HydrationBoundary>
    </>
  );
}
