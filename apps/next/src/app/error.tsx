"use client"; // error boundaries must be client components: they need the reset() callback and state

// Shown when a server component throws while rendering (for example the API is down or times out). Without it the
// user would see a blank framework error page. `reset` re-renders the segment and tries again.
// `digest` is a short id Next attaches: the real error message stays in the SERVER logs (never sent to the browser),
// and the digest lets support match what a user saw to a log line.
export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div role="alert">
      <h1>Something went wrong</h1>
      <p className="muted">We couldn't load this page. Please try again.</p>
      {error.digest && <p className="muted">Reference: {error.digest}</p>}
      <button
        type="button"
        onClick={reset}
      >
        Try again
      </button>
    </div>
  );
}
