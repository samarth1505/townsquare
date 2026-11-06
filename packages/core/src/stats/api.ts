import type { HttpClient } from "../http";
import { STATS_ENDPOINTS } from "./constants";
import type { Stats } from "./types";

export function createStatsApi(http: HttpClient) {
  return {
    get: () => http.get<Stats>(STATS_ENDPOINTS.get),
  };
}
