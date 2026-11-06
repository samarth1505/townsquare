import { useQuery } from "@tanstack/react-query";
import { widgetsApi } from "@/shared/lib/api";

export function useTrendingTopics() {
  return useQuery({
    queryKey: ["widgets", "topics"],
    queryFn: () => widgetsApi.topics(),
    // On failure, THROW the error during render so the nearest error boundary catches it.
    // retry: false -> the first failure surfaces immediately (and "Try again" does the retrying).
    throwOnError: true,
    retry: false,
  });
}
