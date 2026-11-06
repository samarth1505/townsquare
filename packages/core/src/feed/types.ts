export interface FeedPost {
  id: string;
  title: string;
  author: string;
  excerpt: string;
  likes: number;
  imageUrl: string;
  createdAt: string; // ISO date string
}

// One page of results. nextCursor is null when there are no more pages.
export interface FeedPage {
  items: FeedPost[];
  nextCursor: string | null;
}

// How the server should order results. Absent = the default order.
export type FeedSort = "likes";

export interface FeedQuery {
  q?: string;
  sort?: FeedSort;
  cursor?: string;
  limit?: number;
}

// A post with its full text, for the detail page. `body` is a list of paragraphs.
export interface PostDetail extends FeedPost {
  body: string[];
}
