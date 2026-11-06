import { Router } from "express";
import { POSTS, bodyFor, imageUrlFor } from "../services/posts.js";

// PUBLIC, read-only data: no login. Search engines, link-preview bots and server-side rendering all need to read
// pages WITHOUT a user session, so the content they show must come from endpoints like these.
// `Cache-Control: public` lets a CDN or the framework's cache reuse the answer for a minute.
const router = Router();
const CACHE = "public, max-age=60";

router.get("/posts", (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 12, 100);
  const start = Number(req.query.cursor) || 0;
  const q = typeof req.query.q === "string" ? req.query.q.trim().toLowerCase() : "";
  const matching = q
    ? POSTS.filter((p) => `${p.title} ${p.author}`.toLowerCase().includes(q))
    : POSTS;
  const origin = `${req.protocol}://${req.get("host")}`;
  const items = matching
    .slice(start, start + limit)
    .map((p) => ({ ...p, imageUrl: imageUrlFor(origin, p) }));
  const next = start + limit;
  res
    .set("Cache-Control", CACHE)
    .json({ items, nextCursor: next < matching.length ? String(next) : null });
});

router.get("/posts/:id", (req, res) => {
  const post = POSTS.find((p) => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: "not_found" });
  const origin = `${req.protocol}://${req.get("host")}`;
  res
    .set("Cache-Control", CACHE)
    .json({ ...post, imageUrl: imageUrlFor(origin, post), body: bodyFor(post) });
});

export default router;
