import AsyncStorage from "@react-native-async-storage/async-storage";
import type { KeyValueStorage } from "@hub/core";

// ORDINARY (not secure) storage on the phone: a plain key-value file on disk, the phone's version of localStorage.
// Use it for data that is only a convenience (the saved notification list). Anything secret (the refresh token) goes
// in secureStorage instead. Every call is in try/catch: a full disk or a corrupt store must never crash the app,
// because this copy is only an optimisation.
export const asyncStorage: KeyValueStorage = {
  getItem: async (key) => {
    try {
      return await AsyncStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: async (key, value) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch {
      // full or unavailable: skip
    }
  },
  removeItem: async (key) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      // nothing more we can do
    }
  },
};
