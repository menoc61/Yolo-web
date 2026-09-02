import { useQuery } from "@tanstack/react-query";
import {
  getProducts,
  getFeaturedProducts,
  getProductBySlug,
  searchProducts,
  getCategories,
} from "@/lib/products";
import {
  productsKey,
  featuredProductsKey,
  categoriesKey,
  productKey,
  searchProductsKey,
} from "@/lib/queryKeys";

export function useProducts() {
  return useQuery({
    queryKey: productsKey,
    queryFn: getProducts,
  });
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: featuredProductsKey,
    queryFn: getFeaturedProducts,
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: productKey(slug),
    queryFn: () => getProductBySlug(slug),
    enabled: !!slug,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: categoriesKey,
    queryFn: getCategories,
  });
}

export function useSearchProducts(query: string, category?: string) {
  return useQuery({
    queryKey: searchProductsKey(query, category),
    queryFn: () => searchProducts(query, category),
    enabled: !!(query || category),
  });
}
