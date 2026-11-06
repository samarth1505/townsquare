import { createSessionHolder } from "@hub/core";

// The phone app's token holder (the logic lives in @hub/core and is shared with the web app).
export const authSession = createSessionHolder();
