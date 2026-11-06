import type { AnalyticsTransport, ErrorReporter } from "@hub/core";
import { sendJson } from "./transport";

type Send = (url: string, payload: unknown) => void;

const MAX_BREADCRUMBS = 20;

// An ErrorReporter that posts to OUR OWN API: the same job Sentry does, without a third party. It keeps the
// user id and the last few breadcrumbs, and attaches them to each report so a developer can see what led to it.
export function createCollectorErrorReporter(url: string, send: Send = sendJson): ErrorReporter {
  let user: { id: string } | null = null;
  const breadcrumbs: Array<{ message: string; data?: unknown; timestamp: number }> = [];

  return {
    captureError(error, context) {
      const err = error instanceof Error ? error : new Error(String(error));
      send(url, {
        name: err.name,
        message: err.message,
        stack: err.stack,
        context,
        user,
        breadcrumbs: [...breadcrumbs],
        path: location.pathname, // the pathname only: a query string can carry tokens
        timestamp: Date.now(),
      });
    },
    setUser(next) {
      user = next;
    },
    addBreadcrumb(message, data) {
      breadcrumbs.push({ message, data, timestamp: Date.now() });
      if (breadcrumbs.length > MAX_BREADCRUMBS) breadcrumbs.shift(); // a ring buffer: only the latest few
    },
  };
}

export function createCollectorAnalyticsTransport(
  url: string,
  send: Send = sendJson,
): AnalyticsTransport {
  return { send: (events) => send(url, { events }) };
}
