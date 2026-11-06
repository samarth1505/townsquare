import * as SecureStore from "expo-secure-store";
import type { KeyValueStorage } from "@hub/core";

// The phone's SECURE storage, adapted to the tiny interface @hub/core asks for (the same interface the web gives with
// localStorage). Under the hood:
//   iOS     -> the Keychain (encrypted by the OS, protected by the device passcode)
//   Android -> the Keystore (a hardware-backed key encrypts the value before it is saved)
// Ordinary storage (AsyncStorage, MMKV without encryption, files) is readable on a rooted/jailbroken device or from a
// device backup, so a refresh token must NOT live there.
const OPTIONS: SecureStore.SecureStoreOptions = {
  // Readable only while the phone is unlocked, and never copied to a new phone through a backup: a stolen backup
  // must not contain a working login.
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

export const secureStorage: KeyValueStorage = {
  // A missing key, or a value the OS refuses to decrypt, both mean "no saved session".
  getItem: async (key) => {
    try {
      return await SecureStore.getItemAsync(key, OPTIONS);
    } catch {
      return null;
    }
  },
  // Let a failed write REJECT: the caller needs to know the session could not be saved.
  setItem: (key, value) => SecureStore.setItemAsync(key, value, OPTIONS),
  removeItem: async (key) => {
    try {
      await SecureStore.deleteItemAsync(key, OPTIONS);
    } catch {
      // nothing more we can do
    }
  },
};
