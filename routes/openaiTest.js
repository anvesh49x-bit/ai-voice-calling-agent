import { askOpenAI } from "../services/openai.js";

export async function openaiTestRoute(req, res) {
  try {
    const reply = await askOpenAI(
      "test-call",
      "Say hello in one sentence."
    );

    res.json({
      success: true,
      reply
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}