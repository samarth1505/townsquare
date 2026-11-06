type Report = (error: unknown, context?: Record<string, unknown>) => void;

// Catches the errors an ErrorBoundary CANNOT: an error thrown in an event handler or a timer (window "error"
// event) and a promise that failed with nobody handling it ("unhandledrejection"). Without these, such failures
// are invisible to us: the user just sees something not working.
// Returns a function that removes the listeners.
export function installGlobalErrorHandlers(report: Report): () => void {
  const onError = (event: ErrorEvent) => {
    // For a script from another origin the browser hides the details and gives only "Script error." with no stack.
    report(event.error ?? new Error(event.message), {
      source: "window.onerror",
      file: event.filename,
      line: event.lineno,
    });
  };
  const onRejection = (event: PromiseRejectionEvent) => {
    const reason = event.reason;
    report(reason instanceof Error ? reason : new Error(`Unhandled rejection: ${String(reason)}`), {
      source: "unhandledrejection",
    });
  };

  window.addEventListener("error", onError);
  window.addEventListener("unhandledrejection", onRejection);
  return () => {
    window.removeEventListener("error", onError);
    window.removeEventListener("unhandledrejection", onRejection);
  };
}
