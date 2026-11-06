import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "node:http";
import { WebSocketServer } from "ws";
import { isMobileClient } from "./clientType.js";
import { config } from "./config.js";
import authRouter from "./routes/auth.js";
import devRouter from "./routes/dev.js";
import feedRouter from "./routes/feed.js";
import imagesRouter from "./routes/images.js";
import monitoringRouter from "./routes/monitoring.js";
import notificationsRouter from "./routes/notifications.js";
import publicRouter from "./routes/public.js";
import statsRouter from "./routes/stats.js";
import widgetsRouter from "./routes/widgets.js";
import { registerSocket, WS_CLOSE_CODES, WS_EVENTS } from "./realtime.js";
import { verifyAccess } from "./services/tokens.js";

const app = express();
app.use(cors({ origin: config.webOrigin, credentials: true })); // credentials: true lets the browser send the refresh cookie
app.use(express.json());
app.use(cookieParser());
app.get("/health", (_req, res) => res.json({ ok: true }));
// Demo-only: answers after ?ms= milliseconds (max 10 s), to practise request timeouts.
app.get("/slow", async (req, res) => {
  const ms = Math.min(Number(req.query.ms) || 1000, 10_000);
  await new Promise((resolve) => setTimeout(resolve, ms));
  res.json({ ok: true, waitedMs: ms });
});
app.use("/auth", authRouter);
app.use("/feed", feedRouter);
app.use("/images", imagesRouter);
app.use("/monitoring", monitoringRouter);
app.use("/notifications", notificationsRouter);
app.use("/public", publicRouter);
app.use("/stats", statsRouter);
app.use("/widgets", widgetsRouter);
if (process.env.NODE_ENV !== "production") app.use("/dev", devRouter);

const server = createServer(app);

// WebSocket endpoint, authenticated by ?token=<accessToken>.
// A browser hides the HTTP status of a rejected handshake, so we ACCEPT the connection and then close it
// with an application close code the client understands (4401 = "your token is bad, refresh it").
const wss = new WebSocketServer({ server, path: "/ws" });
wss.on("connection", (socket, req) => {
  socket.on("error", () => {}); // a socket error must never crash the server process

  // CORS does not apply to WebSockets, so check the Origin header ourselves (stops other websites from
  // opening a socket with the visitor's browser). A missing Origin is allowed (curl, servers). The phone app is a
  // special case: React Native on iOS INVENTS an Origin from the URL (http://localhost:4000), so it would be rejected.
  // It identifies itself with `x-client: mobile`, which a web page cannot send, so that check is skipped for it.
  // (The access token in the URL is the real authentication either way.)
  const origin = req.headers.origin;
  if (!isMobileClient(req) && origin && origin !== config.webOrigin) {
    socket.close(WS_CLOSE_CODES.forbiddenOrigin, "forbidden origin");
    return;
  }

  try {
    const token = new URL(req.url ?? "", "http://x").searchParams.get("token") ?? "";
    const user = verifyAccess(token); // checked ONCE, at connect time
    registerSocket(user.sub, socket);
    socket.send(JSON.stringify({ type: WS_EVENTS.hello, userId: user.sub }));
  } catch {
    socket.close(WS_CLOSE_CODES.unauthorized, "unauthorized");
  }
});

server.listen(config.port, () => console.log(`API on http://localhost:${config.port}`));
