import { getPosts } from "@/lib/api";

const SIMULATED_DELAY_MS = 1500;

// An ASYNC SERVER COMPONENT: it can `await` data directly while rendering (no useEffect, no loading state of its own).
export default async function SlowTrending() {
  await new Promise((resolve) => setTimeout(resolve, SIMULATED_DELAY_MS)); // pretend this data source is slow
  const page = await getPosts({ limit: 3 });
  return (
    <section
      className="card"
      aria-label="Trending"
    >
      <h2>Trending now</h2>
      <ul>
        {page?.items.map((post) => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </section>
  );
}
