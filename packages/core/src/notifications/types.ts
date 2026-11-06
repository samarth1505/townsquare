export interface Notification {
  id: string;
  title: string;
  body: string;
  createdAt: string; // ISO date
  read: boolean;
}

export type NotificationsStatus = "idle" | "loading" | "ready" | "error";

export interface NotificationsState {
  status: NotificationsStatus;
  items: Notification[]; // newest first
  errorCode: string | null;
}

export interface NotificationsResponse {
  items: Notification[];
}
