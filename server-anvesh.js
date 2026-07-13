import { claudeTestRoute } from "./routes/claudeTest.js";
import { testCallRoute } from "./routes/testCall.js";
import http from "http";
import { WebSocketServer } from "ws";

import { handleMediaStream } from "./websocket/mediaStream.js";
import { incomingCallRoute } from "./routes/twilio.js";
import express from "express";

import { env } from "./config/env.js";
import { validateEnv } from "./config/validateEnv.js";
import { healthRoute } from "./routes/health.js";

validateEnv();

const app = express();
app.get("/", (req, res) => {
  res.json({
    message: "Telugu AI Caller Online"
  });
});
app.get("/health", healthRoute);
app.get("/claude-test", claudeTestRoute);
app.post("/incoming-call", incomingCallRoute);
app.get("/test-call", testCallRoute);
const server = http.createServer(app);

const wss = new WebSocketServer({
  server
});

wss.on("connection", (ws, request) => {
  const pathname = new URL(
    request.url,
    `http://${request.headers.host}`
  ).pathname;

  if (pathname !== "/media-stream") {
    ws.close();
    return;
  }

  handleMediaStream(ws);
});

server.listen(env.PORT, () => {
  console.log("🚀 Telugu AI Caller Starting...");
  console.log(`Server running on port ${env.PORT}`);
});