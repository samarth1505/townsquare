import express, { Router } from "express";
import { store, telemetry } from "../services/telemetryStore.js";

const MAX_ITEMS_PER_REQUEST = 100;

// These endpoints are ANONYMOUS on purpose: navigator.sendBeacon (used when a page is closing) cannot set an
// Authorization header, and errors can happen before login. In production you protect them with size limits, rate
// limiting per IP, and validation, which is why the body limit and the item cap are here.
//
// sendBeacon posts "text/plain" (a content type that needs no CORS preflight), so we parse the body as JSON ourselves.
const router = Router();
router.use(express.json({ type: "*/*", limit: "100kb" }));

router.post("/events", (req, res) => {
  const events = req.body?.events;
  if (!Array.isArray(events)) return res.status(400).json({ error: "invalid_batch" });
  store(telemetry.events, events.slice(0, MAX_ITEMS_PER_REQUEST));
  res.status(204).end();
});

router.post("/errors", (req, res) => {
  if (typeof req.body !== "object" || req.body === null) {
    return res.status(400).json({ error: "invalid_error" });
  }
  store(telemetry.errors, [{ ...req.body, receivedAt: new Date().toISOString() }]);
  res.status(204).end();
});

export default router;
