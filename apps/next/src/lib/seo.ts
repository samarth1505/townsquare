import type { Metadata } from "next";
import type { PostDetail } from "@hub/core";
import { SITE_NAME, SITE_URL } from "./config";

// The SEO MODULE. Pages do not hand-write meta tags: they call these builders. In an organisation this lives in a
// shared package owned by the SEO/platform team, so every page gets the same rules (canonical, Open Graph, structured
// data), and a rule changes in one place.

export function postMetadata(post: PostDetail): Metadata {
  const url = `/posts/${post.id}`;
  return {
    title: post.title, // the layout's template makes it "<title> | Hub"
    description: post.excerpt,
    alternates: { canonical: url }, // the ONE official address (avoids duplicate-content penalties)
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url,
      publishedTime: post.createdAt,
      authors: [post.author],
      images: [{ url: post.imageUrl, width: 1200, height: 630, alt: post.title }],
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.excerpt },
  };
}

export const notFoundMetadata: Metadata = { title: "Post not found", robots: { index: false } };

// Structured data: the same facts in machine-readable form (schema.org), used for rich search results.
export function postJsonLd(post: PostDetail) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: post.imageUrl,
    datePublished: post.createdAt,
    author: { "@type": "Person", name: post.author },
    publisher: { "@type": "Organization", name: SITE_NAME },
    mainEntityOfPage: `${SITE_URL}/posts/${post.id}`,
  };
}

// Turns data into text for a <script type="application/ld+json"> tag. "<" is escaped so that content containing
// "</script>" can never close the tag early and inject HTML (an XSS hole).
export const toJsonLdString = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");
