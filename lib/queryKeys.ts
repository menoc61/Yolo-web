// Single source of truth for TanStack Query keys so server-side prefetch
// (app/page.tsx, app/products/page.tsx) and client-side hooks (hooks/useProducts.ts)
// always address the exact same cache entries.
export const productsKey = ["products"] as const;
export const featuredProductsKey = ["products", "featured"] as const;
export const categoriesKey = ["categories"] as const;

export const productKey = (slug: string) => ["product", slug] as const;
export const searchProductsKey = (query: string, category?: string) =>
  ["products", "search", query, category] as const;