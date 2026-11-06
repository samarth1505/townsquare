import { errorReporter } from "./monitoring";

// The one function the app calls to report a caught error (the ErrorBoundary uses it). WHERE it goes (console,
// our collector, Sentry) is decided in ./monitoring, so no component knows about any vendor.
export function reportError(error: Error, context?: Record<string, unknown>): void {
  errorReporter.captureError(error, context);
}
