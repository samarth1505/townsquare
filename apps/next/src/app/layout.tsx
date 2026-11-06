import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { SITE_NAME, SITE_URL } from "@/lib/config";
import "./globals.css";

// Default metadata for EVERY page. A page can override any part of it. `metadataBase` lets relative URLs in
// metadata (like an image path) become the absolute URLs that crawlers and social networks need.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME}: tips from the community`, template: `%s | ${SITE_NAME}` },
  description: "Short, practical tips shared by the Hub community.",
  openGraph: { siteName: SITE_NAME, type: "website" },
};

// The root layout is a SERVER component: it renders once on the server and sends plain HTML.
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a
          href="#content"
          className="skip"
        >
          Skip to main content
        </a>
        <header className="site">
          <Link
            href="/"
            className="brand"
          >
            {SITE_NAME}
          </Link>
          <nav aria-label="Main">
            <Link href="/explore">Explore</Link> <Link href="/hydration-demo">Hydration demo</Link>
          </nav>
        </header>
        <main
          id="content"
          tabIndex={-1}
        >
          {children}
        </main>
      </body>
    </html>
  );
}
