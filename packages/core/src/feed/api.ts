import type { HttpClient } from "../http";
import { FEED_ENDPOINTS } from "./constants";
import type { FeedPage, FeedQuery } from "./types";

export function createFeedApi(http: HttpClient) {
  return {
    list: ({ q, sort, cursor, limit }: FeedQuery = {}) => {
      const params = new URLSearchParams(); // builds and escapes the query string safely
      if (q) params.set("q", q);
      if (sort) params.set("sort", sort);
      if (cursor) params.set("cursor", cursor);
      if (limit) params.set("limit", String(limit));
      const qs = params.toString();
      return http.get<FeedPage>(FEED_ENDPOINTS.list + (qs ? `?${qs}` : ""));
    },
  };
}

export type FeedApi = ReturnType<typeof createFeedApi>;
