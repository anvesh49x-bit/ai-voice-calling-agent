import Twilio from "twilio";

import { env } from "../config/env.js";

const client = Twilio(
  env.TWILIO_ACCOUNT_SID,
  env.TWILIO_AUTH_TOKEN
);

export async function makeTestCall(to) {
  const call = await client.calls.create({
    to,
    from: env.TWILIO_PHONE_NUMBER,
    url: "https://stunt-matching-snaking.ngrok-free.dev/incoming-call"
  });

  console.log("📞 Call SID:", call.sid);

  return call;
}