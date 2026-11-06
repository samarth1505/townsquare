import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const TOPICS = [
  { name: "React", posts: 128 },
  { name: "TypeScript", posts: 96 },
  { name: "Performance", posts: 74 },
  { name: "Accessibility", posts: 51 },
];

router.get("/topics", requireAuth, async (_req, res) => {
  await delay(400);
  res.json({ items: TOPICS });
});

// DEMO: deliberately flaky. Two failures, then one success, repeating, so we can practise isolated widget failures.
let suggestionCalls = 0;
router.get("/suggestions", requireAuth, async (_req, res) => {
  await delay(300);
  suggestionCalls += 1;
  if (suggestionCalls % 3 !== 0) return res.status(500).json({ error: "suggestions_unavailable" });
  res.json({
    items: [
      { id: "m1", name: "Asha", role: "Frontend engineer" },
      { id: "m2", name: "Ravi", role: "Mobile developer" },
      { id: "m3", name: "Meera", role: "Designer" },
    ],
  });
});

export default router;
