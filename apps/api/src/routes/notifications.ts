import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { registerDeviceToken, unregisterDeviceToken } from "../services/deviceTokens.js";

export interface NotificationRecord {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

// DEMO: marking THIS notification as read always fails on the server, so the client's optimistic update
// must be rolled back (the interesting case: "what if the request fails?").
const FAILING_ID = "n-fail";

function seed(): NotificationRecord[] {
  const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();
  return [
    {
      id: "n1",
      title: "Welcome to Hub",
      body: "Take a look around and say hello.",
      createdAt: minutesAgo(2),
      read: false,
    },
    {
      id: "n2",
      title: "Asha liked your post",
      body: '"React tip #1" got a new like.',
      createdAt: minutesAgo(35),
      read: false,
    },
    {
      id: "n3",
      title: "New: the Trending tab",
      body: "See what the community loves right now.",
      createdAt: minutesAgo(180),
      read: false,
    },
    {
      id: FAILING_ID,
      title: "Demo: this one fails to save",
      body: "Marking it read fails on the server, so the UI must roll back.",
      createdAt: minutesAgo(300),
      read: false,
    },
    {
      id: "n4",
      title: "Your phone was verified",
      body: "Thanks for confirming your number.",
      createdAt: minutesAgo(1440),
      read: true,
    },
  ];
}

// In-memory store per user (a real server uses a database).
const byUser = new Map<string, NotificationRecord[]>();
export function notificationsFor(userId: string): NotificationRecord[] {
  let list = byUser.get(userId);
  if (!list) {
    list = seed();
    byUser.set(userId, list);
  }
  return list;
}

// Every user the server has seen (so a demo trigger can save a notification for someone who is offline right now).
export const knownUserIds = () => [...byUser.keys()];

const router = Router();
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

router.get("/", requireAuth, async (req, res) => {
  await delay(300);
  res.json({ items: notificationsFor(req.user!.sub) });
});

// Push registration. "devices/remove" is a POST because the shared HTTP client only has get and post.
const tokenFrom = (body: unknown): string | null => {
  const token = (body as { token?: unknown } | undefined)?.token;
  return typeof token === "string" && token.length > 0 && token.length < 512 ? token : null;
};
router.post("/devices", requireAuth, (req, res) => {
  const token = tokenFrom(req.body);
  if (!token) return res.status(400).json({ error: "invalid_token" });
  registerDeviceToken(req.user!.sub, token);
  res.status(204).end();
});
router.post("/devices/remove", requireAuth, (req, res) => {
  const token = tokenFrom(req.body);
  if (!token) return res.status(400).json({ error: "invalid_token" });
  unregisterDeviceToken(req.user!.sub, token);
  res.status(204).end();
});

// Must be declared BEFORE "/:id/read", otherwise "read-all" would be treated as an id.
router.post("/read-all", requireAuth, async (req, res) => {
  await delay(200);
  for (const n of notificationsFor(req.user!.sub)) n.read = true;
  res.status(204).end();
});

router.post("/:id/read", requireAuth, async (req, res) => {
  await delay(250);
  const id = req.params.id;
  if (id === FAILING_ID) return res.status(500).json({ error: "could_not_save" });
  const target = notificationsFor(req.user!.sub).find((n) => n.id === id);
  if (!target) return res.status(404).json({ error: "not_found" });
  target.read = true;
  res.status(204).end();
});

export default router;
