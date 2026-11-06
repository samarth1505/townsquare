// Named values for this feature (no magic numbers or strings in components).
export { RESEND_COOLDOWN_SECONDS } from "@hub/core"; // shared with the mobile app

// ids that connect an error message to the input it is about (aria-describedby). Web-only (the DOM).
export const AUTH_ERROR_IDS = { send: "send-error", verify: "verify-error" } as const;
