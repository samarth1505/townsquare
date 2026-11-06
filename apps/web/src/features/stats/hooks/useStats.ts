import { useQuery } from "@tanstack/react-query";
import { statsApi } from "@/shared/lib/api";

// Plain query: this component handles its own error state inline (compare with the widgets, which THROW to a boundary).
export function useStats() {
  return useQuery({
    queryKey: ["stats"],
    queryFn: () => statsApi.get(),
  });
}
