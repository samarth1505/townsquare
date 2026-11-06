import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

// GET /stats : three headline numbers for the Lobby stat cards.
router.get("/", requireAuth, async (_req, res) => {
  await new Promise((resolve) => setTimeout(resolve, 600)); // simulate latency so the skeleton is visible
  res.json({ posts: 60, members: 1284, likesToday: 342 });
});

export default router;
