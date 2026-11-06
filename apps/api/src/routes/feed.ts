import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { POSTS, imageUrlFor } from "../services/posts.js";

const router = Router();

// GET /feed?q=<text>&cursor=<opaque>&limit=<n>   (needs a valid access token)
// Cursor pagination: the client sends back the `nextCursor` it received. Here the cursor is just an offset;
// real systems use a stable id/timestamp so inserts don't shift pages.
router.get("/", requireAuth, async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 12, 30);
  const start = Number(req.query.cursor) || 0;
  const q = typeof req.query.q === "string" ? req.query.q.trim().toLowerCase() : "";

  const sort = req.query.sort === "likes" ? "likes" : "default";
  const matching = q
    ? POSTS.filter((p) => `${p.title} ${p.author}`.toLowerCase().includes(q))
    : POSTS;
  // sort=likes -> most liked first (ties broken by id so the order, and therefore the cursor, is stable)
  const filtered =
    sort === "likes"
      ? [...matching].sort((a, b) => b.likes - a.likes || a.id.localeCompare(b.id))
      : matching;
  const items = filtered.slice(start, start + limit);
  const next = start + limit;

  await new Promise((resolve) => setTimeout(resolve, 400)); // simulate network latency so loading states are visible
  const origin = `${req.protocol}://${req.get("host")}`;
  const withImages = items.map((post) => ({
    ...post,
    imageUrl: imageUrlFor(origin, post),
  }));
  res.json({ items: withImages, nextCursor: next < filtered.length ? String(next) : null });
});

export default router;
