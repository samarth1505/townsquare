import { useSyncExternalStore } from "react";
import type { Store } from "./store";

// Connects a React component to an external store. The component re-renders ONLY when the value
// returned by `selector` changes (compared with Object.is), not on every store update.
//
// RULE for useSyncExternalStore: the snapshot function must return a STABLE value for an unchanged store.
// Selectors that return primitives (a number) or an existing reference (state.items) are fine; a selector
// that builds a new array/object on every call would loop forever.
export function useStoreSelector<S, A, R>(store: Store<S, A>, selector: (state: S) => R): R {
  const getSnapshot = () => selector(store.getState());
  return useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot); // 3rd arg: the server snapshot (SSR)
}
