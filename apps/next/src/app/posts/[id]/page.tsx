import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllPosts, getPost } from "@/lib/api";
import { notFoundMetadata, postJsonLd, postMetadata, toJsonLdString } from "@/lib/seo";
import LikeButton from "./LikeButton";

type Props = { params: Promise<{ id: string }> };

// THIS FILE DECLARES ITS OWN RENDERING STRATEGY (the decision is written in code, per route):
//  - generateStaticParams: build these pages ahead of time (SSG)
//  - revalidate = 60: refresh each page in the background at most once a minute (ISR)
// Must be a LITERAL number: Next reads it at build time without running your code (keep in step with lib/config.ts).
export const revalidate = 60;

export async function generateStaticParams() {
  return (await getAllPosts()).map((post) => ({ id: post.id }));
}

// Metadata is computed on the SERVER from the same data as the page, so crawlers and link-preview bots (which
// usually do not run JavaScript) see it in the HTML.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost((await params).id);
  return post ? postMetadata(post) : notFoundMetadata;
}

export default async function PostPage({ params }: Props) {
  const post = await getPost((await params).id);
  if (!post) notFound(); // renders not-found.tsx AND sends a real HTTP 404 (a "soft 404" would confuse Google)

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLdString(postJsonLd(post)) }}
      />
      <h1>{post.title}</h1>
      <p className="muted">
        By {post.author} · <time dateTime={post.createdAt}>{post.createdAt.slice(0, 10)}</time>
      </p>
      {/* width/height reserve the space (no layout shift); the first big image is the LCP, so it loads at high priority */}
      <img
        className="hero"
        src={post.imageUrl}
        width={1280}
        height={720}
        alt={`Illustration for ${post.title}`}
        fetchPriority="high"
      />
      {post.body.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
      {/* A CLIENT component inside a server page: only this small piece ships JavaScript to the browser. */}
      <LikeButton
        postId={post.id}
        initialLikes={post.likes}
      />
    </article>
  );
}
