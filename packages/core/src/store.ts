// A tiny external store (Redux in ~20 lines): one state value, a reducer that computes the next state from an
// action, and subscribers that are told when it changes. It knows nothing about React, so web AND React Native
// can use it. React connects to it with `useSyncExternalStore`.
export interface Store<S, A> {
  getState(): S;
  dispatch(action: A): void;
  subscribe(listener: () => void): () => void; // returns an unsubscribe function
}

export function createStore<S, A>(
  reducer: (state: S, action: A) => S,
  initialState: S,
): Store<S, A> {
  let state = initialState;
  const listeners = new Set<() => void>();

  return {
    getState: () => state,
    dispatch(action) {
      const next = reducer(state, action);
      if (Object.is(next, state)) return; // nothing changed: do not wake up subscribers
      state = next;
      listeners.forEach((listener) => listener());
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
