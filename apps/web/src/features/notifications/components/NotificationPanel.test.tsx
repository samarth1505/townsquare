import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Notification } from "@hub/core";
import { notificationService, notificationStore } from "@/shared/lib/notificationService";
import NotificationPanel from "./NotificationPanel";

const make = (id: string, over: Partial<Notification> = {}): Notification => ({
  id,
  title: `Title ${id}`,
  body: `Body ${id}`,
  createdAt: "2026-10-27T10:00:00.000Z", // FIXED: tests must not depend on the clock (the list is sorted by time)
  read: false,
  ...over,
});

// The panel reads the real store, so a test "sets the scene" by dispatching the state it wants to see.
const setState = (action: Parameters<typeof notificationStore.dispatch>[0]) =>
  act(() => notificationStore.dispatch(action));

describe("<NotificationPanel />", () => {
  afterEach(() => {
    setState({ type: "reset" });
    vi.restoreAllMocks();
  });

  it("shows a loading skeleton while the first load runs", () => {
    setState({ type: "load/started" });
    const { container } = render(<NotificationPanel id="panel" />);
    expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument();
  });

  it("shows an error with a retry button when loading failed", async () => {
    const load = vi.spyOn(notificationService, "load").mockResolvedValue();
    setState({ type: "load/failed", code: "network_error" });
    render(<NotificationPanel id="panel" />);

    expect(screen.getByRole("alert")).toHaveTextContent("Couldn't load notifications.");
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(load).toHaveBeenCalledTimes(1);
  });

  it("shows the empty message when there is nothing", () => {
    setState({ type: "load/succeeded", items: [] });
    render(<NotificationPanel id="panel" />);
    expect(screen.getByText("You're all caught up.")).toBeInTheDocument();
  });

  it("lists the notifications and marks unread ones for screen readers", () => {
    setState({
      type: "load/succeeded",
      items: [make("a", { createdAt: "2026-10-27T11:00:00.000Z" }), make("b", { read: true })],
    });
    render(<NotificationPanel id="panel" />);

    const rows = screen.getAllByRole("listitem"); // newest first: a, then b
    expect(rows).toHaveLength(2);
    expect(within(rows[0]!).getByText("Unread")).toBeInTheDocument(); // screen-reader-only text
    expect(within(rows[1]!).queryByText("Unread")).not.toBeInTheDocument();
  });

  it("clicking an unread item asks the service to mark THAT id as read", async () => {
    const markRead = vi.spyOn(notificationService, "markRead").mockResolvedValue(true);
    setState({ type: "load/succeeded", items: [make("a"), make("b")] });
    render(<NotificationPanel id="panel" />);

    await userEvent.click(screen.getByRole("button", { name: /Title b/ }));
    expect(markRead).toHaveBeenCalledWith("b");
  });

  it("tells the user when saving failed", async () => {
    vi.spyOn(notificationService, "markRead").mockResolvedValue(false);
    setState({ type: "load/succeeded", items: [make("a")] });
    render(<NotificationPanel id="panel" />);

    await userEvent.click(screen.getByRole("button", { name: /Title a/ }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Couldn't mark it as read");
  });

  it("disables 'Mark all as read' when everything is read", () => {
    setState({ type: "load/succeeded", items: [make("a", { read: true })] });
    render(<NotificationPanel id="panel" />);
    expect(screen.getByRole("button", { name: "Mark all as read" })).toBeDisabled();
  });

  it("explains that the list is the saved copy when the browser is offline", () => {
    const online = vi.spyOn(window.navigator, "onLine", "get").mockReturnValue(false);
    setState({ type: "load/succeeded", items: [make("a")] });
    render(<NotificationPanel id="panel" />);
    expect(screen.getByRole("status")).toHaveTextContent("You're offline");
    online.mockRestore();
  });
});
