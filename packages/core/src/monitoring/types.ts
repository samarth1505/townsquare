import type { OtpChannel } from "../auth";

// ---- Error reporting -------------------------------------------------------------------------------------------
export type ErrorContext = Record<string, unknown>;

// What the app needs from "an error monitoring service". The app depends on THIS, never on a vendor SDK, so the
// vendor (Sentry, Bugsnag, a first-party collector...) can be swapped or combined without touching a component.
export interface ErrorReporter {
  captureError(error: unknown, context?: ErrorContext): void;
  setUser(user: { id: string } | null): void; // an opaque id ONLY: never phone, email or name
  addBreadcrumb(message: string, data?: ErrorContext): void; // "what the user did before the crash"
}

// ---- Analytics -------------------------------------------------------------------------------------------------
// The catalogue of EVERY event the app may send, with the exact properties of each. A typo in an event name, or a
// missing/extra property, is a compile error, and the list doubles as documentation of what we collect.
export interface AnalyticsEventMap {
  page_viewed: { path: string }; // pathname only, never the query string
  login_succeeded: { channel: OtpChannel };
  logout: Record<string, never>;
  notification_marked_read: { source: "item" | "all" };
  web_vital: { metric: string; value: number; rating: string };
}
export type AnalyticsEventName = keyof AnalyticsEventMap;

export interface AnalyticsEvent {
  name: AnalyticsEventName;
  props: Record<string, unknown>;
  timestamp: number;
  sessionId: string;
  userId: string | null;
}

export interface Analytics {
  track<N extends AnalyticsEventName>(name: N, props: AnalyticsEventMap[N]): void;
  identify(userId: string): void;
  reset(): void; // logout: flush what is pending, then forget the user and start a new session
  setConsent(granted: boolean): void; // nothing is recorded without consent
  flush(): void; // send what is queued now (called when the page is being hidden)
}

// How a batch of events leaves the device. Fire-and-forget: analytics must never block or break the app.
export interface AnalyticsTransport {
  send(events: AnalyticsEvent[]): void;
}
