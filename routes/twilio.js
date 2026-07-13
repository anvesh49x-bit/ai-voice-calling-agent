import { env } from "../config/env.js";

export function incomingCallRoute(req, res) {

  const host =
    req.headers.host;

  const protocol =
    host.includes("ngrok")
      ? "wss"
      : "ws";

  const streamUrl =
    `${protocol}://${host}/media-stream`;

  const twiml = `
<Response>
  <Connect>
    <Stream url="${streamUrl}" />
  </Connect>
</Response>
`;

  console.log("📡 Streaming to:", streamUrl);

  res.type("text/xml");
  res.send(twiml);

}