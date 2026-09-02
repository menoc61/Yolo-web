"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { useState } from "react";

const CACHE_KEY = "yolo-query-cache";
const CACHE_MAX_AGE = 1000 * 60 * 60 * 24 * 7; // 7 days local-first

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => {
    const client = new QueryClient({
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
    });

    // Local-first: cache query results in localStorage so the shop works offline
    // persistQueryClient returns [unsubscribe, restorePromise] — it never returns a
    // QueryClient, so keep using the original `client` instance.
    if (typeof window !== "undefined" && window.localStorage) {
      const persister = createSyncStoragePersister({
        key: CACHE_KEY,
        storage: window.localStorage,
      });
      void persistQueryClient({ queryClient: client, persister, maxAge: CACHE_MAX_AGE });
    }

    return client;
  });

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}