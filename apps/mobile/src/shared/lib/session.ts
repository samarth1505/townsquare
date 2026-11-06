import { authApi } from "./api";
import { authSession } from "./authSession";
import { secureStorage } from "./secureStorage";
import { createSessionManager } from "./sessionManager";

export type { RestoreResult } from "./sessionManager";

// The phone app's ONE session manager (composition root: the factory is wired to this app's real parts).
export const sessionManager = createSessionManager({
  authApi,
  storage: secureStorage,
  holder: authSession,
});
