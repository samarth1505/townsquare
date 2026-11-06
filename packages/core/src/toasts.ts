import { createStore } from "./store";

export interface Toast {
  id: string;
  title: string;
  body?: string;
}

export const TOAST_DURATION_MS = 5000;
const MAX_VISIBLE_TOASTS = 3;

export type ToastAction =
  | { type: "toast/shown"; toast: Toast }
  | { type: "toast/dismissed"; id: string }
  | { type: "toast/cleared" };

// Pure reducer, same pattern as the notifications one.
export function toastReducer(state: Toast[], action: ToastAction): Toast[] {
  switch (action.type) {
    case "toast/shown": {
      if (state.some((t) => t.id === action.toast.id)) return state; // already showing it
      return [...state, action.toast].slice(-MAX_VISIBLE_TOASTS); // keep only the newest few
    }
    case "toast/dismissed": {
      const next = state.filter((t) => t.id !== action.id);
      return next.length === state.length ? state : next;
    }
    case "toast/cleared":
      return state.length === 0 ? state : [];
  }
}

// A store, not React state, because toasts are triggered from NON-React code (the socket handler).
// Each app creates ONE and draws it its own way (a <div> stack on the web, a banner on the phone).
export function createToastStore() {
  const store = createStore(toastReducer, [] as Toast[]);
  return {
    store,
    show: (toast: Toast) => store.dispatch({ type: "toast/shown", toast }),
    dismiss: (id: string) => store.dispatch({ type: "toast/dismissed", id }),
    clear: () => store.dispatch({ type: "toast/cleared" }),
  };
}
