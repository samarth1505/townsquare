import type { Session } from "./types";

// The error code only exists while status is "error": impossible combinations can't be written.
export type SendState =
  { status: "idle" } | { status: "sending" } | { status: "error"; code: string };

export type VerifyState =
  | { status: "idle" }
  | { status: "verifying" }
  | { status: "success"; session: Session }
  | { status: "error"; code: string };
