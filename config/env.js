import dotenv from "dotenv";

dotenv.config();

export const env = {

  PORT: process.env.PORT || 3000,

  TWILIO_ACCOUNT_SID:
    process.env.TWILIO_ACCOUNT_SID,

  TWILIO_AUTH_TOKEN:
    process.env.TWILIO_AUTH_TOKEN,

  TWILIO_PHONE_NUMBER:
    process.env.TWILIO_PHONE_NUMBER,

  DEEPGRAM_API_KEY:
    process.env.DEEPGRAM_API_KEY,

  OPENAI_API_KEY:
    process.env.OPENAI_API_KEY,

  ANTHROPIC_API_KEY:
    process.env.ANTHROPIC_API_KEY,

  FISH_AUDIO_API_KEY:
    process.env.FISH_AUDIO_API_KEY,

  FISH_AUDIO_MODEL_ID:
    process.env.FISH_AUDIO_MODEL_ID,

  ELEVENLABS_API_KEY:
    process.env.ELEVENLABS_API_KEY,

  ELEVENLABS_VOICE_ID:
    process.env.ELEVENLABS_VOICE_ID,

  CARTESIA_API_KEY:
    process.env.CARTESIA_API_KEY,

  CARTESIA_VOICE_ID:
    process.env.CARTESIA_VOICE_ID

};