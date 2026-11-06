import { fireEvent, render, screen } from "@testing-library/react-native";
import type { Notification } from "@hub/core";
import NotificationRow from "./NotificationRow";

const make = (over: Partial<Notification> = {}): Notification => ({
  id: "n1",
  title: "Welcome to Hub",
  body: "Say hello.",
  createdAt: new Date().toISOString(),
  read: false,
  ...over,
});

describe("<NotificationRow />", () => {
  it("tells a screen reader that an unread row is unread, and how to act on it", async () => {
    await render(
      <NotificationRow
        notification={make()}
        onSelect={jest.fn()}
      />,
    );
    const row = screen.getByRole("button", { name: "Unread. Welcome to Hub. Say hello." });
    expect(row).toBeOnTheScreen();
    expect(row.props.accessibilityHint).toBe("Marks this notification as read");
  });

  it("a read row has no 'Unread' and no hint", async () => {
    await render(
      <NotificationRow
        notification={make({ read: true })}
        onSelect={jest.fn()}
      />,
    );
    const row = screen.getByRole("button", { name: "Welcome to Hub. Say hello." });
    expect(row.props.accessibilityHint).toBeUndefined();
  });

  it("reports the id of the pressed notification", async () => {
    const onSelect = jest.fn();
    await render(
      <NotificationRow
        notification={make({ id: "n42" })}
        onSelect={onSelect}
      />,
    );
    await fireEvent.press(screen.getByRole("button"));
    expect(onSelect).toHaveBeenCalledWith("n42");
  });
});
