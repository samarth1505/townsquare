import { render } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import * as Notifications from "expo-notifications";
import PushNavigator from "./PushNavigator";

jest.mock("expo-router", () => ({ useRouter: jest.fn() }));

const navigate = jest.fn();

// What expo-notifications gives us after the user taps a notification (only the parts we read).
const tap = (
  id: string,
  data: unknown,
  actionIdentifier = Notifications.DEFAULT_ACTION_IDENTIFIER,
) =>
  ({ actionIdentifier, notification: { request: { identifier: id, content: { data } } } }) as never;

const respondWith = (response: unknown) =>
  jest.mocked(Notifications.useLastNotificationResponse).mockReturnValue(response as never);

describe("<PushNavigator />", () => {
  beforeEach(() => {
    navigate.mockClear();
    jest.mocked(useRouter).mockReturnValue({ navigate } as never);
  });

  it("opens the screen named in the notification", async () => {
    respondWith(tap("push-1", { url: "/account" }));
    await render(<PushNavigator />);
    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith("/account");
  });

  it("does nothing when no notification was tapped", async () => {
    respondWith(null);
    await render(<PushNavigator />);
    expect(navigate).not.toHaveBeenCalled();
  });

  it("refuses a target that is not on the allow-list", async () => {
    respondWith(tap("push-2", { url: "https://evil.example.com" }));
    await render(<PushNavigator />);
    expect(navigate).not.toHaveBeenCalled();
  });

  it("ignores the dismiss action", async () => {
    respondWith(tap("push-3", { url: "/account" }, "expo.modules.notifications.actions.DISMISS"));
    await render(<PushNavigator />);
    expect(navigate).not.toHaveBeenCalled();
  });

  it("handles the same tap only once, even if the component mounts again (logout, login)", async () => {
    respondWith(tap("push-4", { url: "/notifications" }));
    const first = await render(<PushNavigator />);
    await first.unmount();
    await render(<PushNavigator />);
    expect(navigate).toHaveBeenCalledTimes(1);
  });
});
