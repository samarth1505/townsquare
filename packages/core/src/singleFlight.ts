// Wraps an async task so that callers who arrive WHILE it is running share the same promise,
// instead of starting a second run. Once it settles, the next call starts a fresh run.
// Used for the token refresh: refresh tokens are single-use, so two parallel refreshes would break one of them.
export function singleFlight<T>(task: () => Promise<T>): () => Promise<T> {
  let inFlight: Promise<T> | null = null;
  return () =>
    (inFlight ??= task().finally(() => {
      inFlight = null;
    }));
}
