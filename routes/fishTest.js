import { generateSpeech } from "../services/fishAudio.js";

export async function fishTestRoute(req, res) {

  const file = await generateSpeech(
    "Hello. This is Priya from Arvex Technologies."
  );

  res.json({
    success: true,
    file
  });

}