import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import ProductsPageClient from "@/components/product/ProductsPageClient";
import { getProducts, getCategories } from "@/lib/products";
import { productsKey, categoriesKey } from "@/lib/queryKeys";

export default async function ProductsPage() {
  // Server-prefetch the catalog + categories so the server-rendered HTML and the
  // first client render are identical (fixes the skeleton-vs-product hydration mismatch).
  const queryClient = new QueryClient();
  await Promise.all([
    queryClient.prefetchQuery({ queryKey: productsKey, queryFn: getProducts }),
    queryClient.prefetchQuery({ queryKey: categoriesKey, queryFn: getCategories }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductsPageClient />
    </HydrationBoundary>
  );
}
