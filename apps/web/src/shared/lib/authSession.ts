import { createSessionHolder } from "@hub/core";

// The web app's token holder (the logic lives in @hub/core and is shared with the mobile app).
export const authSession = createSessionHolder();
