// Endpoint-ready recommendation — client calls /api/recommendations?productId=&limit=
// For now: heuristic same-category + rating desc + not outOfStock, ready to swap to backend.

import type { Product } from "./types";
import { MOCK_PRODUCTS } from "./products";

export interface RecommendationOptions {
  limit?: number;
  // future backend filters: userId, session, city, priceRange, excludeOutOfStock
}

/**
 * getRecommendations — prepare for backend endpoint:
 * GET /api/recommendations?productId=p1&limit=4
 * Server will use collaborative filtering / category + vector later.
 * This client fallback keeps UI shippable before backend.
 */
export async function getRecommendations(productId: string, opts: RecommendationOptions = {}): Promise<Product[]> {
  const limit = opts.limit ?? 4;
  // Simulate network latency for skeleton testing
  await new Promise((r) => setTimeout(r, 280));

  const current = MOCK_PRODUCTS.find((p) => p.id === productId);
  if (!current) return MOCK_PRODUCTS.filter((p) => !p.outOfStock && p.available).slice(0, limit);

  // heuristic: same category first, then rating, then inventory, exclude self + deleted/outOfStock
  const sameCat = MOCK_PRODUCTS.filter((p) => p.id !== productId && p.category === current.category && !p.outOfStock && !p.deletedAt).sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  const others = MOCK_PRODUCTS.filter((p) => p.id !== productId && p.category !== current.category && !p.outOfStock && !p.deletedAt).sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

  const merged = [...sameCat, ...others].slice(0, limit);

  // Attach debug for endpoint migration: log what backend would return
  if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.debug("[recommendations] fallback:", { productId, merged: merged.map((m) => m.slug) });
  }

  return merged;
}

// Server-side helper for generateMetadata / RSC — will be replaced by fetch(`${API}/recommendations?productId=${id}`)
export async function fetchRecommendationsServer(productId: string, limit = 4): Promise<Product[]> {
  // "use cache" placeholder — when backend ready, uncomment:
  // "use cache";
  // return fetch(`${process.env.NEXT_PUBLIC_API_URL}/recommendations?productId=${productId}&limit=${limit}`, { next: { revalidate: 3600 } }).then(r=>r.json())
  return getRecommendations(productId, { limit });
}
