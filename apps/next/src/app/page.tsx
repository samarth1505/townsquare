import Link from "next/link";
import { getPosts } from "@/lib/api";

// No dynamic input (no cookies, no search params), so Next renders this page ONCE at build time (static, "SSG")
// and refreshes it in the background (ISR, because the data fetch has a revalidate time).
export default async function HomePage() {
  const page = await getPosts({ limit: 6 });
  return (
    <>
      <h1>Tips from the community</h1>
      <p className="muted">
        This page is rendered on the server: the tips below are in the HTML itself, not fetched by
        JavaScript.
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
      <Link href="/explore">Search all tips</Link>
    </>
  );
}
