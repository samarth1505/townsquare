import type { NextConfig } from "next";

const config: NextConfig = {
  // @hub/core is shipped as TypeScript source (no build step), so Next must compile it as part of this app.
  transpilePackages: ["@hub/core"],

  // Security headers on every response: set once, centrally, so no page can forget them.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" }, // the browser must not guess a file's type
          { key: "X-Frame-Options", value: "DENY" }, // nobody may embed our pages in a frame (clickjacking)
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" }, // do not leak full URLs to other sites
        ],
      },
    ];
  },
};

export default config;
