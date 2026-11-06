import { QueryClient } from "@tanstack/react-query";

const STALE_TIME_MS = 30_000; // data counts as fresh for 30 s: no refetch while it is fresh

export const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: STALE_TIME_MS, retry: 1 } },
});
