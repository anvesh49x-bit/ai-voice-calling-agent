import { makeTestCall } from "../services/twilio.js";

export async function testCallRoute(req, res) {
  try {
    const { to } = req.query;

    if (!to) {
      return res.status(400).json({
        error: "Missing phone number"
      });
    }

    const call = await makeTestCall(to);

    res.json({
      success: true,
      callSid: call.sid
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}