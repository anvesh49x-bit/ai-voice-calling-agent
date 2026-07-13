import { ConversationEngine } from "../engine/ConversationEngine.js";
import { DeepgramClient } from "@deepgram/sdk";
import { env } from "../config/env.js";

const client = new DeepgramClient({
  apiKey: env.DEEPGRAM_API_KEY
});

export async function createDeepgramConnection(ws, getStreamSid) {
  const callId = Date.now().toString();
  const engine = new ConversationEngine(ws, getStreamSid, callId);

  const connection = await client.listen.v1.connect({
    model: "nova-3",
    encoding: "mulaw",
    sample_rate: 8000,
    language: "en",
    punctuate: true,
    interim_results: true,
    endpointing: 400
  });

  connection.on("open", async () => {
    console.log("🎤 Deepgram connected");
    await engine.onCallStart();
  });

  connection.on("message", (data) => {
    engine.handleDeepgramMessage(data);
  });

  connection.on("error", (err) => {
    console.error("❌ Deepgram error:", err);
  });

  connection.on("close", () => {
    engine.cleanup();
    console.log("📴 Twilio media stream disconnected");
  });

  connection.connect();
  await connection.waitForOpen();

  return connection;
}
