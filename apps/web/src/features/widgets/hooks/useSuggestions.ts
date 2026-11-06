import { useQuery } from "@tanstack/react-query";
import { widgetsApi } from "@/shared/lib/api";

export function useSuggestions() {
  return useQuery({
    queryKey: ["widgets", "suggestions"],
    queryFn: () => widgetsApi.suggestions(),
    throwOnError: true,
    retry: false,
  });
}
