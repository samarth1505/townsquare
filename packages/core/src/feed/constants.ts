export const FEED_ENDPOINTS = {
  list: "/feed",
} as const;

// Read-only endpoints that need NO login: what search engines and link previews (and the Next.js app) can fetch.
export const PUBLIC_FEED_ENDPOINTS = {
  posts: "/public/posts",
  post: (id: string) => `/public/posts/${encodeURIComponent(id)}`,
} as const;

// Query keys identify cached server data. Defined once so every hook and every cache update uses the same key.
export const FEED_QUERY_KEY = ["feed"] as const;
export const FEED_PAGE_SIZE = 12;
