import { generateSpeech } from "../services/elevenLabs.js";

export async function elevenTestRoute(req, res) {

  const file = await generateSpeech(

    "Hello. This is Priya from Arvex Technologies."

  );

  res.json({

    success: !!file,

    file

  });

}