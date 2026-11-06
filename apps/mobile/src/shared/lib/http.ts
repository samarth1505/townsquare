import { createHttpClient } from "@hub/core";
import { API_BASE_URL, MOBILE_CLIENT_HEADERS } from "./config";

// App initialisation: the ONLY place the phone app configures its HTTP client. This is the very same
// createHttpClient the web app uses: only the configuration differs (the mobile header, and, in the next step, how
// a session is refreshed).
export const plainHttp = createHttpClient({
  baseUrl: API_BASE_URL,
  headers: MOBILE_CLIENT_HEADERS,
});
