import "@testing-library/react-native/matchers"; // adds toBeOnTheScreen(), toBeDisabled(), toHaveTextContent()...

// Runs before every test file. The native modules below do not exist in a Jest (Node) environment, so each is replaced
// by a small fake: the tests exercise OUR code, not Expo's.
jest.mock("expo-notifications", () => ({
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  setBadgeCountAsync: jest.fn(async () => true),
  getPermissionsAsync: jest.fn(async () => ({ granted: false, canAskAgain: true })),
  requestPermissionsAsync: jest.fn(async () => ({ granted: true, canAskAgain: true })),
  useLastNotificationResponse: jest.fn(() => null),
  DEFAULT_ACTION_IDENTIFIER: "expo.modules.notifications.actions.DEFAULT",
  AndroidImportance: { DEFAULT: 3 },
}));

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

// SafeAreaView needs the device's insets (notch height); there is no device here, so use the library's own fake.
jest.mock(
  "react-native-safe-area-context",
  () => require("react-native-safe-area-context/jest/mock").default,
);
