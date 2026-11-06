import type { ErrorContext, ErrorReporter } from "@hub/core";

// Only the parts of the SDK we use. Typing against this small shape also lets a test pass a fake SDK.
type SentrySdk = Pick<
  typeof import("@sentry/browser"),
  "init" | "captureException" | "setUser" | "addBreadcrumb"
>;

type SentryOptions = {
  dsn: string;
  environment: string;
  release?: string;
  // The loader is a parameter so a test can supply a fake; in the app it is a DYNAMIC import.
  load?: () => Promise<SentrySdk>;
};

const MAX_QUEUED_CALLS = 50;

// A Sentry adapter that is LAZY-LOADED. `import("@sentry/browser")` makes the bundler put the SDK in its own file
// that is downloaded after the page starts, so it never delays the first render (the SDK is large).
// Calls made before it has loaded are queued and replayed in order.
export function createSentryReporter({
  dsn,
  environment,
  release,
  load = () => import("@sentry/browser"),
}: SentryOptions): ErrorReporter {
  let sdk: SentrySdk | null = null;
  let queue: Array<(sdk: SentrySdk) => void> = [];

  load()
    .then((loaded) => {
      loaded.init({
        dsn,
        environment,
        release,
        // Our own pipeline (global handlers -> dedupe -> redaction) is the ONLY way errors reach Sentry, so the
        // privacy rules apply to everything. Sentry's built-in window handlers would bypass it: switch them off.
        integrations: (defaults) =>
          defaults.filter((integration) => integration.name !== "GlobalHandlers"),
      });
      sdk = loaded;
      const pending = queue;
      queue = [];
      pending.forEach((call) => call(loaded));
    })
    .catch(() => {
      queue = []; // blocked by an ad blocker or offline: monitoring must never break the app
    });

  // Run now if loaded, otherwise remember it (up to a limit, so a failed load cannot grow memory forever).
  function run(call: (sdk: SentrySdk) => void) {
    if (sdk) call(sdk);
    else if (queue.length < MAX_QUEUED_CALLS) queue.push(call);
  }

  return {
    captureError: (error: unknown, context?: ErrorContext) =>
      run((s) => s.captureException(error, { extra: context })),
    setUser: (user) => run((s) => s.setUser(user)),
    addBreadcrumb: (message, data) =>
      run((s) => s.addBreadcrumb({ category: "app", message, data })),
  };
}
