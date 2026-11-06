import type { IncomingMessage } from "node:http";

// The phone app marks every request (HTTP and WebSocket) with this header. A browser page cannot add custom headers
// to a WebSocket handshake, so a request that carries it was NOT made by a web page.
export const CLIENT_HEADER = "x-client";
export const MOBILE_CLIENT = "mobile";

export const isMobileClient = (req: Pick<IncomingMessage, "headers">): boolean =>
  req.headers[CLIENT_HEADER] === MOBILE_CLIENT;
