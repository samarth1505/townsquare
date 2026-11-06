export interface BackoffOptions {
  baseMs: number;
  maxMs: number;
}

// EXPONENTIAL BACKOFF + JITTER. attempt 0, 1, 2, 3 ... gives a ceiling of base, 2x, 4x, 8x ... capped at maxMs.
// The delay is then picked between half the ceiling and the full ceiling ("equal jitter").
//   - Exponential: a server that is struggling gets breathing room instead of a hammering.
//   - Jitter: if the server restarts and 10,000 clients dropped at the same instant, they must NOT all
//     come back at the same instant (a "thundering herd"). Randomness spreads them out.
// `random` is a parameter so tests can control it.
export function backoffDelay(
  attempt: number,
  { baseMs, maxMs }: BackoffOptions,
  random: () => number = Math.random,
): number {
  const ceiling = Math.min(maxMs, baseMs * 2 ** attempt);
  const half = ceiling / 2;
  return Math.round(half + random() * half);
}
