import {
  createRealtimeClient,
  parseNotificationEvent,
  REALTIME_PATH,
  toWebSocketUrl,
} from "@hub/core";
import { API_BASE_URL, MOBILE_CLIENT_HEADERS } from "./config";
import { authSession } from "./authSession";
import { notificationService } from "./notificationService";
import { sessionManager } from "./session";
import { showToast } from "./toasts";

// The shape of React Native's WebSocket constructor. The browser typings only know the first two arguments.
type NativeWebSocket = new (
  url: string,
  protocols: string | string[] | null,
  options: { headers: Record<string, string> },
) => WebSocket;

// Composition root for the live connection. React Native has a global WebSocket just like the browser, so the
// core client runs unchanged. The differences from the web are only: refreshSession comes from the secure-storage
// session manager, and the "toast" is a banner.
export const notificationRealtime = createRealtimeClient({
  url: toWebSocketUrl(API_BASE_URL) + REALTIME_PATH,
  getToken: authSession.getAccessToken,
  refreshSession: sessionManager.refresh,
  // React Native's WebSocket (unlike the browser's) accepts HEADERS as a third argument. The API uses `x-client: mobile`
  // to tell the phone from a web page: RN on iOS invents an Origin header from the URL, which the API's browser-origin
  // check would otherwise reject (the phone would reconnect forever).
  createSocket: (url) =>
    new (WebSocket as unknown as NativeWebSocket)(url, null, { headers: MOBILE_CLIENT_HEADERS }),
  onMessage: (data) => {
    const notification = parseNotificationEvent(data); // null for anything that is not a valid notification
    // receive() is true only for a NEW notification, so a duplicate push never shows a second banner.
    if (notification && notificationService.receive(notification)) {
      showToast({ id: notification.id, title: notification.title, body: notification.body });
    }
  },
  onReconnected: () => void notificationService.sync(), // fetch what we missed while the socket was down
});
