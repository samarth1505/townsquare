import { redact, redactError } from "./redact";
import type { ErrorContext, ErrorReporter } from "./types";

export const noopErrorReporter: ErrorReporter = {
  captureError: () => {},
  setUser: () => {},
  addBreadcrumb: () => {},
};

// Development: print instead of sending.
export function createConsoleErrorReporter(
  log: Pick<Console, "error" | "debug"> = console,
): ErrorReporter {
  return {
    captureError: (error, context) => log.error("[error]", error, context),
    setUser: (user) => log.debug("[error] user", user),
    addBreadcrumb: (message, data) => log.debug("[error] breadcrumb", message, data),
  };
}

// FAN-OUT: send to several reporters at once. Each call is isolated in try/catch: monitoring must NEVER break the
// app, and one failing vendor must not stop the others.
export function combineErrorReporters(reporters: ErrorReporter[]): ErrorReporter {
  const each = (call: (reporter: ErrorReporter) => void) => {
    for (const reporter of reporters) {
      try {
        call(reporter);
      } catch {
        // swallow: a broken reporter is not worth crashing the page for
      }
    }
  };
  return {
    captureError: (error, context) => each((r) => r.captureError(error, context)),
    setUser: (user) => each((r) => r.setUser(user)),
    addBreadcrumb: (message, data) => each((r) => r.addBreadcrumb(message, data)),
  };
}

// DECORATOR: wraps a reporter and cleans everything BEFORE it reaches it, so every adapter behind it is safe by
// construction (one place to get privacy right, instead of trusting each adapter).
export function withRedaction(reporter: ErrorReporter): ErrorReporter {
  return {
    captureError: (error, context) =>
      reporter.captureError(
        error instanceof Error ? redactError(error) : redact(error),
        redact(context) as ErrorContext | undefined,
      ),
    setUser: (user) => reporter.setUser(user), // an id only; the type forbids anything else
    addBreadcrumb: (message, data) =>
      reporter.addBreadcrumb(redact(message) as string, redact(data) as ErrorContext | undefined),
  };
}

const MAX_REMEMBERED = 100;

// DECORATOR: the same error repeated within a short window is reported ONCE. A render loop or a failing timer can
// throw the same error thousands of times a minute; that floods the vendor (cost, rate limits) and hides real news.
export function withDedupe(
  reporter: ErrorReporter,
  { windowMs = 10_000, now = Date.now }: { windowMs?: number; now?: () => number } = {},
): ErrorReporter {
  const lastSeen = new Map<string, number>();
  return {
    ...reporter,
    captureError(error, context) {
      const key = error instanceof Error ? `${error.name}:${error.message}` : String(error);
      const time = now();
      const previous = lastSeen.get(key);
      if (previous !== undefined && time - previous < windowMs) return;
      lastSeen.set(key, time);
      if (lastSeen.size > MAX_REMEMBERED) {
        for (const [k, t] of lastSeen) if (time - t >= windowMs) lastSeen.delete(k); // forget old keys: no leak
      }
      reporter.captureError(error, context);
    },
  };
}
