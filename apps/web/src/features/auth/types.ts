// The login flow's state types are shared with the mobile app, so they live in @hub/core.
export type { SendState, VerifyState } from "@hub/core";

// Router state the guard attaches when it redirects to login, read by the login page. (Web-only: a URL concept.)
export type LoginRedirectState = { from?: string };
