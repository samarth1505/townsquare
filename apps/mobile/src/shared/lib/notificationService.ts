import {
  createNotificationCache,
  createNotificationService,
  createStore,
  initialNotificationsState,
  notificationsReducer,
} from "@hub/core";
import { notificationsApi } from "./apiClient";
import { asyncStorage } from "./asyncStorage";

// Composition root for notifications: ONE store and ONE service for the whole app. It is the same wiring as the web's
// notificationService.ts; only the storage differs (AsyncStorage here, localStorage there).
export const notificationStore = createStore(notificationsReducer, initialNotificationsState);
export const notificationService = createNotificationService({
  api: notificationsApi,
  store: notificationStore,
  cache: createNotificationCache(asyncStorage), // saved copy on disk, one entry per user
});
