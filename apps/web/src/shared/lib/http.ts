import { createAuthApi, createHttpClient, singleFlight } from "@hub/core";
import { API_BASE_URL } from "./config";
import { authSession } from "./authSession";

// App initialisation: the ONLY place the web app configures its HTTP clients.

// 1) Plain client: no token, no refresh logic. Used by the auth endpoints themselves
//    (otherwise a failing /auth/refresh would try to refresh itself forever).
export const plainHttp = createHttpClient({ baseUrl: API_BASE_URL });

// 2) The token refresh, shared by EVERY caller (HTTP client and WebSocket). singleFlight makes parallel callers
//    wait for ONE refresh: refresh tokens are single-use, so a second parallel refresh would fail.
export const refreshSession = singleFlight(async () => {
  try {
    const session = await createAuthApi(plainHttp).refresh();
    authSession.setAccessToken(session.accessToken);
    return true;
  } catch {
    authSession.expire(); // refresh cookie missing/expired: the user must log in again
    return false;
  }
});

// 3) API client: attaches the access token, and on 401 refreshes once and retries.
export const apiHttp = createHttpClient({
  baseUrl: API_BASE_URL,
  getAccessToken: authSession.getAccessToken,
  refreshSession,
});
