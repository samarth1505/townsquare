import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getPosts } from "@/lib/api";
import SlowTrending from "./SlowTrending";

export const metadata: Metadata = {
  title: "Explore tips",
  description: "Search every tip shared by the community.",
};

// Reading `searchParams` makes this page DYNAMIC: it is rendered on the server for EVERY request (SSR), because the
// output depends on the URL's ?q=. (Compare with the home page, which is built once and reused.)
export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const page = await getPosts({ q, limit: 30 });

  return (
    <>
      <h1>Explore tips</h1>

      {/* A plain HTML form with method GET: it works with JavaScript turned OFF (progressive enhancement). */}
      <form
        action="/explore"
        className="search"
        role="search"
      >
        <label
          htmlFor="q"
          className="muted"
        >
          Search
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={q}
        />
        <button type="submit">Search</button>
      </form>

      {/* STREAMING: this part is slow. The rest of the page above is sent immediately; this box shows a placeholder
          and is filled in later, in the same HTTP response, when its data is ready. */}
      <Suspense
        fallback={
          <div
            className="card"
            aria-busy="true"
          >
            <div className="skeleton" />
            <div className="skeleton" />
          </div>
        }
      >
        <SlowTrending />
      </Suspense>

      <p aria-live="polite">
        {page?.items.length ?? 0} result(s){q ? ` for "${q}"` : ""}
      </p>
      <ul className="grid">
        {page?.items.map((post) => (
          <li
            key={post.id}
            className="card"
          >
            <h2>
              <Link href={`/posts/${post.id}`}>{post.title}</Link>
            </h2>
            <p className="muted">{post.excerpt}</p>
          </li>
        ))}
      </ul>
    </>
  );
}
