import Anthropic from "@anthropic-ai/sdk";
import { env } from "../config/env.js";

const anthropic = new Anthropic({
  apiKey: env.ANTHROPIC_API_KEY
});

export async function askClaude(message) {
  const response = await anthropic.messages.create({
    model: "claude-3-5-sonnet-latest",
    max_tokens: 200,
    messages: [
      {
        role: "user",
        content: message
      }
    ]
  });

  return response.content[0].text;
}