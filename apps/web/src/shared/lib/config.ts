// Central place for environment-based settings. Components never read import.meta.env directly.
export const API_BASE_URL: string = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

export const IS_DEV: boolean = import.meta.env.DEV;
export const APP_ENV: string = import.meta.env.MODE; // "development" | "production"
// Optional: error monitoring with Sentry is switched on only when a DSN is configured (in a git-ignored .env).
export const SENTRY_DSN: string | undefined = import.meta.env.VITE_SENTRY_DSN || undefined;

// Where the browser reports errors and analytics batches (our own first-party collector).
export const MONITORING_ENDPOINTS = {
  events: `${API_BASE_URL}/monitoring/events`,
  errors: `${API_BASE_URL}/monitoring/errors`,
} as const;
