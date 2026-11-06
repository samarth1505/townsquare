import type { HttpClient } from "../http";
import { NOTIFICATION_ENDPOINTS } from "./constants";
import type { NotificationsResponse } from "./types";

export function createNotificationsApi(http: HttpClient) {
  return {
    list: () => http.get<NotificationsResponse>(NOTIFICATION_ENDPOINTS.list),
    markRead: (id: string) => http.post<void>(NOTIFICATION_ENDPOINTS.read(id)),
    markAllRead: () => http.post<void>(NOTIFICATION_ENDPOINTS.readAll),
    registerDevice: (token: string) =>
      http.post<void>(NOTIFICATION_ENDPOINTS.registerDevice, { token }),
    unregisterDevice: (token: string) =>
      http.post<void>(NOTIFICATION_ENDPOINTS.unregisterDevice, { token }),
  };
}

export type NotificationsApi = ReturnType<typeof createNotificationsApi>;
