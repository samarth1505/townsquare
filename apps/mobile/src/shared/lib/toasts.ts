import { createToastStore } from "@hub/core";

// The phone's ONE banner queue. The logic is the same @hub/core code the web uses; only the drawing differs
// (a floating banner here, a stack of cards on the web).
const toasts = createToastStore();
export const toastStore = toasts.store;
export const showToast = toasts.show;
export const dismissToast = toasts.dismiss;
export const clearToasts = toasts.clear;
