import {
  createAuthApi,
  createFeedApi,
  createNotificationsApi,
  createStatsApi,
  createWidgetsApi,
} from "@hub/core";
import { apiHttp, plainHttp } from "./http";

// Composition root: feature APIs are built once from the shared clients.
// Business layers import these ready-made objects and never deal with base URLs.
export const authApi = createAuthApi(plainHttp);
export const feedApi = createFeedApi(apiHttp);
export const statsApi = createStatsApi(apiHttp);
export const widgetsApi = createWidgetsApi(apiHttp);
export const notificationsApi = createNotificationsApi(apiHttp);
