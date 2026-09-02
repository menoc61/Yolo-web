import { useQuery } from "@tanstack/react-query";
import { getProducts, getFeaturedProducts, getProductBySlug, searchProducts, getCategories } from "@/lib/products";

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ["products", "featured"],
    queryFn: getFeaturedProducts,
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: () => getProductBySlug(slug),
    enabled: !!slug,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });
}

export function useSearchProducts(query: string, category?: string) {
  return useQuery({
    queryKey: ["products", "search", query, category],
    queryFn: () => searchProducts(query, category),
    enabled: !!(query || category),
  });
}
