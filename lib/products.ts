import type { Product } from "./types";
import rawProducts from "@/data/products.json";

// Keep the storefront catalog electronics-only even if legacy records remain in the source file.
export const MOCK_PRODUCTS: Product[] = (rawProducts as Product[]).filter(
  (product) => product.category === "Electronics"
);

export async function getProducts(): Promise<Product[]> {
  await new Promise((r) => setTimeout(r, 200));
  return MOCK_PRODUCTS;
}

export async function getFeaturedProducts(): Promise<Product[]> {
  await new Promise((r) => setTimeout(r, 150));
  return MOCK_PRODUCTS.filter((p) => p.featured);
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  await new Promise((r) => setTimeout(r, 100));
  return MOCK_PRODUCTS.find((p) => p.slug === slug);
}

export async function getProductIds(): Promise<string[]> {
  return MOCK_PRODUCTS.map((p) => p.slug);
}

export async function getCategories(): Promise<string[]> {
  const cats = new Set(MOCK_PRODUCTS.map((p) => p.category));
  return Array.from(cats).sort();
}

export async function searchProducts(query: string, category?: string): Promise<Product[]> {
  await new Promise((r) => setTimeout(r, 150));
  let results = MOCK_PRODUCTS;

  if (query) {
    const q = query.toLowerCase();
    results = results.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }

  if (category && category !== "All") {
    results = results.filter((p) => p.category === category);
  }

  return results;
}
