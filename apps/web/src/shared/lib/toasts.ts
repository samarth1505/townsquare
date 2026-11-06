import { createToastStore } from "@hub/core";

// The toast logic (reducer, limits) lives in @hub/core and is shared with the phone app.
// The web only creates its ONE store and exposes it under the names the rest of the web app already uses.
export { TOAST_DURATION_MS } from "@hub/core";
export type { Toast } from "@hub/core";

const toasts = createToastStore();
export const toastStore = toasts.store;
export const showToast = toasts.show;
export const dismissToast = toasts.dismiss;
export const clearToasts = toasts.clear;
