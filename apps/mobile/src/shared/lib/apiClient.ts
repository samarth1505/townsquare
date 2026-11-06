import { createAuthApi, createFeedApi, createHttpClient, createNotificationsApi } from "@hub/core";
import { API_BASE_URL, MOBILE_CLIENT_HEADERS } from "./config";
import { authSession } from "./authSession";
import { sessionManager } from "./session";

// The client for calls that need a LOGGED-IN user: it attaches the access token, and when a request gets 401 it
// refreshes the session ONCE (single-flight) and retries. It is the same createHttpClient as the web app's `apiHttp`;
// only the refresh function differs (cookie on the web, secure-storage token here).
export const apiHttp = createHttpClient({
  baseUrl: API_BASE_URL,
  headers: MOBILE_CLIENT_HEADERS,
  getAccessToken: authSession.getAccessToken,
  refreshSession: sessionManager.refresh,
});

// Account calls that need a logged-in user (the plain `authApi` is for login and refresh, which must not use this client).
export const accountApi = createAuthApi(apiHttp);

// The feed is private data, so it also goes through the logged-in client (token attached, silent refresh on 401).
export const feedApi = createFeedApi(apiHttp);

// Notifications are private too, so they use the logged-in client.
export const notificationsApi = createNotificationsApi(apiHttp);
