"use client";
import { useQuery } from "@tanstack/react-query";
import { getRecommendations } from "@/lib/recommendations";

export function useRecommendations(productId: string, limit = 4) {
  return useQuery({
    queryKey: ["recommendations", productId, limit],
    queryFn: () => getRecommendations(productId, { limit }),
    enabled: !!productId,
    staleTime: 1000 * 60 * 5,
  });
}
