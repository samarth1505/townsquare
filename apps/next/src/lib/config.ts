// Server-side settings, read once here (never process.env scattered through components).
export const API_URL = process.env.API_URL ?? "http://localhost:4000";
export const SITE_URL = process.env.SITE_URL ?? "http://localhost:3000";
export const SITE_NAME = "Hub";

// How long (seconds) a rendered page or fetched data may be reused before the server refreshes it in the background.
export const REVALIDATE_SECONDS = 60;

// A slow API must not hang the page render: give up after this long (the error boundary then takes over).
export const FETCH_TIMEOUT_MS = 3000;

// Shared secret that proves a call to /api/revalidate comes from OUR backend. It is read from the environment and has
// NO default on purpose: if it is not configured, nobody can invalidate anything (the endpoint fails closed).
export const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET;
