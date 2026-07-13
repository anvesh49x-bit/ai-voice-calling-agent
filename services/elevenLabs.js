import axios from "axios";
import fs from "fs";
import { env } from "../config/env.js";

export async function generateSpeech(text) {

  try {

    const response = await axios({

      method: "POST",

      url: `https://api.elevenlabs.io/v1/text-to-speech/${env.ELEVENLABS_VOICE_ID}`,

      responseType: "arraybuffer",

      headers: {
        "xi-api-key": env.ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg"
      },

      data: {

        text,

        model_id: "eleven_flash_v2_5",

        voice_settings: {
          stability: 0.45,
          similarity_boost: 0.85,
          style: 0.25,
          use_speaker_boost: true
        }

      }

    });

    fs.writeFileSync(
      "./output.mp3",
      response.data
    );

    console.log("🔊 ElevenLabs speech generated.");

    return "./output.mp3";

  } catch (error) {

    console.log("\n❌ ElevenLabs Error");

    if (error.response) {

      if (Buffer.isBuffer(error.response.data)) {

        console.log(
          Buffer.from(
            error.response.data
          ).toString()
        );

      } else {

        console.log(error.response.data);

      }

    } else {

      console.log(error.message);

    }

    return null;

  }

}