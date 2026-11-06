import {
  createRealtimeClient,
  parseNotificationEvent,
  REALTIME_PATH,
  toWebSocketUrl,
} from "@hub/core";
import { API_BASE_URL } from "./config";
import { authSession } from "./authSession";
import { refreshSession } from "./http";
import { notificationService } from "./notificationService";
import { showToast } from "./toasts";

// Composition root for the live connection: ONE client for the whole app (started/stopped by the login lifecycle).
export const notificationRealtime = createRealtimeClient({
  url: toWebSocketUrl(API_BASE_URL) + REALTIME_PATH,
  getToken: authSession.getAccessToken,
  refreshSession,
  onMessage: (data) => {
    const notification = parseNotificationEvent(data); // null for anything that is not a valid notification
    // receive() is true only for a NEW notification, so a duplicate push never shows a second toast.
    if (notification && notificationService.receive(notification)) {
      showToast({ id: notification.id, title: notification.title, body: notification.body });
    }
  },
  onReconnected: () => void notificationService.sync(), // fetch what we missed while the socket was down
});
