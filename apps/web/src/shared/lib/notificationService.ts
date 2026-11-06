import {
  createNotificationCache,
  createNotificationService,
  createStore,
  initialNotificationsState,
  notificationsReducer,
} from "@hub/core";
import { notificationsApi } from "./api";
import { webStorage } from "./storage";

// Composition root for notifications: ONE store and ONE service for the whole app (module singletons).
export const notificationStore = createStore(notificationsReducer, initialNotificationsState);
export const notificationService = createNotificationService({
  api: notificationsApi,
  store: notificationStore,
  cache: createNotificationCache(webStorage), // saved copy in localStorage, one entry per user
});
