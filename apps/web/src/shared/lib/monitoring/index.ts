import {
  combineErrorReporters,
  createAnalytics,
  createConsoleErrorReporter,
  withDedupe,
  withRedaction,
} from "@hub/core";
import type { ErrorReporter } from "@hub/core";
import { IS_DEV, APP_ENV, MONITORING_ENDPOINTS, SENTRY_DSN } from "../config";
import { createCollectorAnalyticsTransport, createCollectorErrorReporter } from "./collector";
import { createSentryReporter } from "./sentry";

// Composition root for monitoring. The app only ever imports `errorReporter` and `analytics` from here.

// 1) WHICH destinations receive errors.
const destinations: ErrorReporter[] = [createCollectorErrorReporter(MONITORING_ENDPOINTS.errors)];
if (IS_DEV) destinations.unshift(createConsoleErrorReporter());
if (SENTRY_DSN) destinations.push(createSentryReporter({ dsn: SENTRY_DSN, environment: APP_ENV }));

// 2) The PIPELINE every error passes through, outermost first:  dedupe -> redact -> fan out to the destinations.
export const errorReporter = withDedupe(withRedaction(combineErrorReporters(destinations)));

// 3) Analytics: batched and sent to our collector.
// Consent starts TRUE here because this demo has no cookie banner. In a real app it starts false and the banner
// calls analytics.setConsent(true) (required by privacy law in many regions).
export const analytics = createAnalytics({
  transport: createCollectorAnalyticsTransport(MONITORING_ENDPOINTS.events),
  consent: true,
});

// When the tab is hidden or closed, send what is still queued (the batch timer would be too late).
// "visibilitychange" is the reliable signal on mobile browsers; "pagehide" covers the rest.
export function installPageHideFlush(): () => void {
  const flushIfHidden = () => {
    if (document.visibilityState === "hidden") analytics.flush();
  };
  const flush = () => analytics.flush();
  document.addEventListener("visibilitychange", flushIfHidden);
  window.addEventListener("pagehide", flush);
  return () => {
    document.removeEventListener("visibilitychange", flushIfHidden);
    window.removeEventListener("pagehide", flush);
  };
}

export { installGlobalErrorHandlers } from "./globalHandlers";
