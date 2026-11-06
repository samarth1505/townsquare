import { Router } from "express";

const router = Router();

// GET /images/p12.svg?w=320 : a generated placeholder picture (different colour per post), resized by ?w=
// This route plays the role of a CDN image-transform service: same original, different widths.
// PUBLIC on purpose: an <img> tag cannot send an Authorization header.
router.get("/:file", (req, res) => {
  const match = /^(p\d+)\.svg$/.exec(req.params.file);
  if (!match) return res.status(404).json({ error: "not_found" });

  const id = match[1] ?? "p0";
  const width = Math.min(Math.max(Number(req.query.w) || 640, 40), 1920); // clamp: never trust client input
  const height = Math.round((width * 9) / 16);
  const hue = (Number(id.slice(1)) * 47) % 360;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 640 360">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="hsl(${hue} 70% 55%)"/><stop offset="1" stop-color="hsl(${(hue + 60) % 360} 70% 40%)"/>
  </linearGradient></defs>
  <rect width="640" height="360" fill="url(#g)"/>
  <text x="320" y="200" font-family="sans-serif" font-size="64" fill="white" text-anchor="middle">${id.toUpperCase()}</text>
</svg>`;
  // Public + long-lived + immutable: a CDN (and the browser) may cache each (id, width) variant for a year.
  res.type("image/svg+xml").set("Cache-Control", "public, max-age=31536000, immutable").send(svg);
});

export default router;
