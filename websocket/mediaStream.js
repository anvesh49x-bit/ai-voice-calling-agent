import { createDeepgramConnection } from "../services/deepgram.js";

export async function handleMediaStream(ws) {

  console.log("📞 Twilio media stream connected");

  let streamSid = "";

  let deepgram = null;

ws.on("message", async (message) => {

    try {

      const data = JSON.parse(
        message.toString()
      );

      if (data.event === "start") {

  streamSid = data.start.streamSid;

  console.log("🚀 START EVENT");
  console.log("📡 Stream SID:", streamSid);

  deepgram = await createDeepgramConnection(
    ws,
    () => streamSid
  );

  return;
}

      if (data.event === "stop") {

        console.log("🛑 STOP EVENT");

        return;

      }

      if (
        data.event === "media" &&
        data.media &&
        data.media.payload
      ) {

        const audio = Buffer.from(
          data.media.payload,
          "base64"
        );

       if (
  deepgram &&
  deepgram.socket?.readyState === 1
) {
  deepgram.socket.send(audio);
}

      }

    } catch (error) {

      console.error(
        "❌ Media Stream Error:",
        error
      );

    }

  });

  ws.on("close", () => {

    console.log(
      "📴 Twilio media stream disconnected"
    );

    try {

      deepgram?.socket?.close();

    } catch (error) {

      console.error(error);

    }

  });

}