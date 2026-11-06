import { Platform } from "react-native";

// WHERE the API is, as seen from the phone. "localhost" means "this device", so it depends on the platform:
//   iOS simulator   -> localhost reaches the Mac (they share the network)
//   Android emulator-> 10.0.2.2 is the emulator's special name for the host computer
//   A real phone    -> use your computer's LAN address, via EXPO_PUBLIC_API_URL (set in a git-ignored .env)
// Variables that start with EXPO_PUBLIC_ are written into the app bundle at build time, so NEVER put a secret in one.
const DEFAULT_API_URL = Platform.select({
  android: "http://10.0.2.2:4000",
  default: "http://localhost:4000",
});

export const API_BASE_URL: string = process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_API_URL;

// Tells the API "I am the phone app": it then returns the refresh token in the response body (a phone has no cookies).
export const MOBILE_CLIENT_HEADERS = { "x-client": "mobile" } as const;
