import axios from "axios";
import fs from "fs";
import { env } from "../config/env.js";

export async function generateSpeech(text) {

  try {

    const response = await axios({

      method: "POST",

      url: "https://api.fish.audio/v1/tts",

      responseType: "arraybuffer",

      headers: {

        Authorization: `Bearer ${env.FISH_AUDIO_API_KEY}`,

        "Content-Type": "application/json",

        model: "s2-pro"

      },

      data: {

        text: text,

        reference_id: env.FISH_AUDIO_MODEL_ID,

        format: "mp3"

      }

    });

    fs.writeFileSync(
      "./output.mp3",
      response.data
    );

    console.log("✅ Fish Audio Success");

    return "./output.mp3";

  } catch (error) {

    console.log("\n❌ Fish Audio Error");

    if (error.response) {

      if (Buffer.isBuffer(error.response.data)) {

        console.log(
          Buffer.from(
            error.response.data
          ).toString()
        );

      } else {

        console.log(
          error.response.data
        );

      }

    } else {

      console.log(
        error.message
      );

    }

    return null;

  }

}