import { PUBLIC_FEED_ENDPOINTS } from "@hub/core";
import type { FeedPage, PostDetail } from "@hub/core";
import { API_URL, FETCH_TIMEOUT_MS, REVALIDATE_SECONDS } from "./config";

// Names for groups of cached data. When a post changes, the backend asks us to invalidate a TAG, and every cached
// page or fetch that used it is refreshed (see app/api/revalidate/route.ts).
export const CACHE_TAGS = {
  posts: "posts", // every list of posts
  post: (id: string) => `post-${id}`, // one post
} as const;

// The ONLY place the server components talk to the API (a "data access layer"). Pages never call fetch() themselves,
// so timeouts, caching and error rules live in one file.
// Server-side: no CORS, no access token in a browser, and the result becomes HTML before the user sees it.
async function getJson<T>(path: string, tags: string[]): Promise<T | null> {
  const res = await fetch(`${API_URL}${path}`, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS), // never let a slow API freeze the render
    next: { revalidate: REVALIDATE_SECONDS, tags },
  });
  if (res.status === 404) return null; // "does not exist" is a normal outcome, not an error
  if (!res.ok) throw new Error(`API answered ${res.status} for ${path}`); // caught by the nearest error.tsx
  return (await res.json()) as T;
}

export function getPosts({ q = "", cursor = "0", limit = 12 } = {}): Promise<FeedPage | null> {
  const query = new URLSearchParams({ q, cursor, limit: String(limit) });
  return getJson<FeedPage>(`${PUBLIC_FEED_ENDPOINTS.posts}?${query}`, [CACHE_TAGS.posts]);
}

export const getPost = (id: string) =>
  getJson<PostDetail>(PUBLIC_FEED_ENDPOINTS.post(id), [CACHE_TAGS.posts, CACHE_TAGS.post(id)]);

// Every post, following the cursor until there are no more pages (used by generateStaticParams and the sitemap).
export async function getAllPosts() {
  const all: FeedPage["items"] = [];
  let cursor: string | null = "0";
  while (cursor !== null) {
    const page: FeedPage | null = await getPosts({ cursor, limit: 100 });
    if (!page) break;
    all.push(...page.items);
    cursor = page.nextCursor;
  }
  return all;
}
