"use cache";

import rawProducts from "@/data/products.json";
import type { Product } from "./types";

const MOCK_PRODUCTS = rawProducts as Product[];

export async function getProductsCached(): Promise<Product[]> {
  return MOCK_PRODUCTS;
}
export async function getFeaturedProductsCached(): Promise<Product[]> {
  return MOCK_PRODUCTS.filter((p) => p.featured);
}
