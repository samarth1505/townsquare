import { Router } from "express";
import { randomUUID } from "node:crypto";
import { connectedUserIds, dropAll, pushToUser, WS_EVENTS } from "../realtime.js";
import { deviceTokensFor } from "../services/deviceTokens.js";
import { sendPush, sentPushes } from "../services/pushSender.js";
import { telemetry } from "../services/telemetryStore.js";
import { knownUserIds, notificationsFor } from "./notifications.js";
import type { NotificationRecord } from "./notifications.js";

// DEMO ONLY (never mounted in production): triggers for practising the real-time features.
const router = Router();

// POST /dev/notify  {"title": "...", "body": "...", "id": "...", "times": 2}
// Saves a notification for every known user and pushes it to the ones that are connected right now (an offline user
// finds it on the next fetch, which is what the client's catch-up after a reconnect or a return to the app does).
// `times: 2` pushes the SAME id twice so you can watch the client de-duplicate it.
router.post("/notify", (req, res) => {
  const {
    title = "Server push",
    body = "Pushed live over the WebSocket.",
    id,
    times = 1,
  } = req.body ?? {};
  const delivered: Record<string, number> = {};
  for (const userId of new Set([...connectedUserIds(), ...knownUserIds()])) {
    const record: NotificationRecord = {
      id: typeof id === "string" ? id : randomUUID(),
      title: String(title),
      body: String(body),
      createdAt: new Date().toISOString(),
      read: false,
    };
    notificationsFor(userId).unshift(record); // saved first, so a client that reconnects later can still fetch it
    for (let i = 0; i < Number(times); i += 1) {
      delivered[userId] = pushToUser(userId, {
        type: WS_EVENTS.notificationCreated,
        notification: record,
      });
    }
    // Nobody is listening on a socket (the app is closed or in the background): fall back to a PUSH notification.
    if (delivered[userId] === 0) {
      sendPush(deviceTokensFor(userId), {
        title: record.title,
        body: record.body,
        data: { url: "/notifications" },
      });
    }
  }
  res.json({ delivered });
});

// GET /dev/pushes shows what the (mock) push sender was asked to deliver.
router.get("/pushes", (_req, res) => {
  res.json({ pushes: sentPushes });
});

// POST /dev/drop  {"code": 4401}  closes every socket with that code (default 1011 = server error).
router.post("/drop", (req, res) => {
  const code = Number(req.body?.code ?? 1011);
  res.json({ dropped: dropAll(code) });
});

// GET /dev/telemetry shows what the browser has reported; DELETE clears it.
router.get("/telemetry", (_req, res) => {
  res.json({ events: telemetry.events, errors: telemetry.errors });
});
router.delete("/telemetry", (_req, res) => {
  telemetry.events.length = 0;
  telemetry.errors.length = 0;
  res.status(204).end();
});

export default router;
