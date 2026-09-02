"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { useEffect, useState } from "react";

const CACHE_KEY = "yolo-query-cache";
const CACHE_MAX_AGE = 1000 * 60 * 60 * 24 * 7; // 7 days local-first

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            gcTime: CACHE_MAX_AGE,
            retry: (failureCount, error) => {
              // local-first: don't hammer a dead backend when the user is offline
              if (typeof navigator !== "undefined" && !navigator.onLine) return false;
              return failureCount < 2;
            },
          },
        },
      })
  );

  // Local-first: persist query results in localStorage so the shop works offline.
  // Deliberately started in an effect (after the hydration commit): restoring the
  // persisted cache during the very first render can outpace React's hydration and
  // cause server/client markup mismatches (e.g. skeleton vs. hydrated product card).
  useEffect(() => {
    if (typeof window === "undefined" || !window.localStorage) return;
    const persister = createSyncStoragePersister({
      key: CACHE_KEY,
      storage: window.localStorage,
    });
    const [unsubscribe] = persistQueryClient({
      queryClient,
      persister,
      maxAge: CACHE_MAX_AGE,
    });
    return () => unsubscribe();
  }, [queryClient]);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}