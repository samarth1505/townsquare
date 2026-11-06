import type { WebSocket } from "ws";

// Message types pushed to clients (the web/core package keeps the same strings).
export const WS_EVENTS = {
  hello: "hello",
  notificationCreated: "notification.created",
} as const;

// Close codes (4000-4999 are application-defined).
export const WS_CLOSE_CODES = {
  unauthorized: 4401,
  forbiddenOrigin: 4403,
} as const;

// userId -> that user's open sockets (one person can have several tabs/devices).
const socketsByUser = new Map<string, Set<WebSocket>>();

export function registerSocket(userId: string, socket: WebSocket) {
  let sockets = socketsByUser.get(userId);
  if (!sockets) {
    sockets = new Set();
    socketsByUser.set(userId, sockets);
  }
  sockets.add(socket);
  socket.on("close", () => {
    sockets.delete(socket);
    if (sockets.size === 0) socketsByUser.delete(userId);
  });
}

export const connectedUserIds = () => [...socketsByUser.keys()];

// Sends to every open socket of one user. Returns how many received it.
export function pushToUser(userId: string, message: unknown): number {
  const payload = JSON.stringify(message);
  let delivered = 0;
  for (const socket of socketsByUser.get(userId) ?? []) {
    if (socket.readyState === socket.OPEN) {
      socket.send(payload);
      delivered += 1;
    }
  }
  return delivered;
}

// Demo helper: close every socket with a given code (to practise reconnect without killing the server).
export function dropAll(code: number): number {
  let dropped = 0;
  for (const sockets of socketsByUser.values()) {
    for (const socket of sockets) {
      socket.close(code, "dropped");
      dropped += 1;
    }
  }
  return dropped;
}
