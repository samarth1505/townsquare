import { fireEvent, render, screen } from "@testing-library/react-native";
import { ApiError, type Notification } from "@hub/core";
import { notificationsApi } from "@/shared/lib/apiClient";
import { notificationStore } from "@/shared/lib/notificationService";
import NotificationsScreen from "./NotificationsScreen";

// The network and the socket are the only things faked. The store, reducer, service and screen are the REAL ones, so
// this tests the optimistic update and its rollback exactly as the phone runs them.
jest.mock("@/shared/lib/apiClient", () => ({
  notificationsApi: {
    list: jest.fn(),
    markRead: jest.fn(),
    markAllRead: jest.fn(),
    registerDevice: jest.fn(),
    unregisterDevice: jest.fn(),
  },
}));
jest.mock("@/shared/lib/realtime", () => {
  const { createStore } = require("@hub/core");
  return {
    notificationRealtime: { status: createStore((_current: string, next: string) => next, "open") },
  };
});

const api = jest.mocked(notificationsApi);

const make = (id: string, over: Partial<Notification> = {}): Notification => ({
  id,
  title: `Title ${id}`,
  body: "Body",
  createdAt: "2026-10-29T10:00:00.000Z",
  read: false,
  ...over,
});

const seed = (...items: Notification[]) =>
  notificationStore.dispatch({ type: "load/succeeded", items });

describe("<NotificationsScreen />", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    notificationStore.dispatch({ type: "reset" });
  });

  it("shows the saved list, newest first, and the live-connection status", async () => {
    seed(make("old", { createdAt: "2026-10-29T08:00:00.000Z" }), make("new"));
    await render(<NotificationsScreen />);
    const rows = screen.getAllByRole("button", { name: /Title/ });
    expect(rows[0].props.accessibilityLabel).toContain("Title new");
    expect(rows[1].props.accessibilityLabel).toContain("Title old");
    expect(screen.getByText("Live updates on")).toBeOnTheScreen();
  });

  it("pressing a row marks it read at once (optimistic) and tells the server", async () => {
    seed(make("a"));
    api.markRead.mockResolvedValue(undefined);
    await render(<NotificationsScreen />);
    await fireEvent.press(screen.getByRole("button", { name: /Unread. Title a/ }));
    expect(screen.queryByRole("button", { name: /Unread/ })).toBeNull();
    expect(api.markRead).toHaveBeenCalledTimes(1);
    expect(api.markRead).toHaveBeenCalledWith("a");
  });

  it("rolls the row back and shows an error when the server refuses", async () => {
    seed(make("a"));
    api.markRead.mockRejectedValue(new ApiError(500, "could_not_save"));
    await render(<NotificationsScreen />);
    await fireEvent.press(screen.getByRole("button", { name: /Unread. Title a/ }));
    expect(screen.getByRole("button", { name: /Unread. Title a/ })).toBeOnTheScreen(); // unread again
    expect(screen.getByText("Couldn't mark it as read. Please try again.")).toBeOnTheScreen();
  });

  it("'Mark all as read' is disabled when nothing is unread", async () => {
    seed(make("a", { read: true }));
    await render(<NotificationsScreen />);
    expect(screen.getByRole("button", { name: "Mark all as read" })).toBeDisabled();
  });

  it("'Mark all as read' clears every unread row", async () => {
    seed(make("a"), make("b"));
    api.markAllRead.mockResolvedValue(undefined);
    await render(<NotificationsScreen />);
    await fireEvent.press(screen.getByRole("button", { name: "Mark all as read" }));
    expect(screen.queryByRole("button", { name: /Unread/ })).toBeNull();
    expect(api.markAllRead).toHaveBeenCalledTimes(1);
  });
});
