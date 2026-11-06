import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/config";

// /robots.txt: tells crawlers what they may visit and where the sitemap is. (It is a request, not security:
// well-behaved bots obey it, and a page you list as "disallow" is still reachable by anyone with the link.)
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/hydration-demo" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
