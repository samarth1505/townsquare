import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/api";
import { SITE_URL } from "@/lib/config";

// /sitemap.xml: the list of URLs we WANT search engines to know about, built from real data.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPosts();
  return [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/explore`, changeFrequency: "daily", priority: 0.7 },
    ...posts.map((post) => ({
      url: `${SITE_URL}/posts/${post.id}`,
      lastModified: post.createdAt,
      changeFrequency: "weekly" as const,
    })),
  ];
}
