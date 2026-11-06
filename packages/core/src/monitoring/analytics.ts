import { redact } from "./redact";
import type { Analytics, AnalyticsEvent, AnalyticsTransport } from "./types";

export interface AnalyticsConfig {
  transport: AnalyticsTransport;
  consent: boolean; // start value; a cookie banner calls setConsent() later
  maxBatchSize?: number; // send when this many events are waiting...
  flushIntervalMs?: number; // ...or when the oldest has waited this long
  now?: () => number;
  createSessionId?: () => string;
}

const DEFAULT_MAX_BATCH = 20;
const DEFAULT_FLUSH_MS = 5000;
const randomId = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

// Collects events and sends them in BATCHES. One request per click would be wasteful (battery, network, server
// load); one request per few seconds, plus one when the page is hidden, is the usual compromise.
export function createAnalytics({
  transport,
  consent: initialConsent,
  maxBatchSize = DEFAULT_MAX_BATCH,
  flushIntervalMs = DEFAULT_FLUSH_MS,
  now = Date.now,
  createSessionId = randomId,
}: AnalyticsConfig): Analytics {
  let consent = initialConsent;
  let userId: string | null = null;
  let sessionId = createSessionId();
  let queue: AnalyticsEvent[] = [];
  let timer: ReturnType<typeof setTimeout> | null = null;

  function flush() {
    if (timer) clearTimeout(timer);
    timer = null;
    if (queue.length === 0) return;
    const batch = queue;
    queue = [];
    try {
      transport.send(batch);
    } catch {
      // fire-and-forget: a failed send must never reach the user
    }
  }

  return {
    track(name, props) {
      if (!consent) return; // no consent, no data: the event is not even queued
      queue.push({
        name,
        props: redact(props) as Record<string, unknown>, // belt and braces: no phone/token can slip into props
        timestamp: now(),
        sessionId,
        userId, // stamped NOW, so a later logout cannot re-label an event that already happened
      });
      if (queue.length >= maxBatchSize) flush();
      else timer ??= setTimeout(flush, flushIntervalMs);
    },
    identify(id) {
      userId = id;
    },
    reset() {
      // Each queued event already carries the previous user's id (stamped when it happened), so nothing can be
      // mislabelled. We flush NOW so the last user's events leave the device at logout instead of lingering.
      flush();
      userId = null;
      sessionId = createSessionId(); // the next person is a NEW session
    },
    setConsent(granted) {
      consent = granted;
      if (!granted) {
        if (timer) clearTimeout(timer);
        timer = null;
        queue = []; // withdrawn consent: drop everything not yet sent
      }
    },
    flush,
  };
}
