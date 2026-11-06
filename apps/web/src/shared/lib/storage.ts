import type { KeyValueStorage } from "@hub/core";

// The web's implementation of the storage core asks for: localStorage wrapped to match the async interface.
// (React Native will provide its own, backed by AsyncStorage or MMKV.)
// Every call is in try/catch: localStorage throws when it is blocked (some private modes) or full.
export const webStorage: KeyValueStorage = {
  getItem: async (key) => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: async (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch {
      // full or blocked: skip
    }
  },
  removeItem: async (key) => {
    try {
      localStorage.removeItem(key);
    } catch {
      // blocked: skip
    }
  },
};
