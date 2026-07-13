import OpenAI from "openai";
import { env } from "../../config/env.js";

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
const llmSessions = new Map();

const AGENT_NAME = "Priya";
const COMPANY = "Arvex Technologies";

function buildSystemDirective() {
  return `You generate spoken phone replies for ${AGENT_NAME}, a customer support executive at ${COMPANY} in Vijayawada.

Output valid JSON only. Never mention AI, bots, or automation.

You receive a SPEECH PLAN with constraints. Follow it exactly.

JSON shape:
{
  "segments": [
    { "text": "spoken words", "pause_ms": 0, "stress": null }
  ],
  "full_text": "complete utterance for logging",
  "include_question": false
}

Rules:
- Sound like a real Indian phone agent, not a chatbot.
- Vary wording every turn; never repeat prior phrasing from RECENT AGENT LINES.
- Use simple spoken English unless LANGUAGE is Telugu.
- segments can include self-corrections as separate entries when allowSelfCorrection is true.
- stress holds a word to emphasize (usually customer name).
- Never use corporate AI phrases.`;
}

export class ResponseGenerator {
  constructor(callId) {
    this.callId = callId;
    if (!llmSessions.has(callId)) {
      llmSessions.set(callId, []);
    }
  }

  async generate(userMessage, context, speechPlan) {
    const history = llmSessions.get(this.callId);
    const messages = [
      { role: "system", content: buildSystemDirective() },
      ...history.slice(-10),
      {
        role: "user",
        content: JSON.stringify({
          speech_plan: speechPlan,
          customer_context: {
            name: context.customerName,
            industry: context.industry,
            requirement: context.requirement,
            timeline: context.timeline,
            budget: context.budget,
            stage: context.stage,
            intent: context.intent,
            emotion: context.emotion,
            language: context.language,
            topics_already_explained: context.topicsExplained,
            interrupted: context.interruptedContext,
            partial_you_were_saying: context.partialSpokenText
          },
          recent_agent_lines: context.recentTranscript
            ?.filter((t) => t.speaker === "Priya")
            .map((t) => t.message)
            .slice(-5),
          business: {
            company: context.business?.name,
            services: context.business?.services?.map((s) => s.name)
          },
          customer_said: userMessage
        })
      }
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.88,
      max_tokens: 180,
      response_format: { type: "json_object" }
    });

    let parsed;
    try {
      parsed = JSON.parse(response.choices[0].message.content);
    } catch {
      parsed = {
        segments: [{ text: response.choices[0].message.content, pause_ms: 0 }],
        full_text: response.choices[0].message.content
      };
    }

    const fullText =
      parsed.full_text ||
      parsed.segments?.map((s) => s.text).join(" ") ||
      "";

    history.push(
      { role: "user", content: userMessage },
      { role: "assistant", content: fullText }
    );

    return {
      segments: normalizeSegments(parsed.segments, fullText),
      fullText
    };
  }

  static clearSession(callId) {
    llmSessions.delete(callId);
  }
}

function normalizeSegments(segments, fallbackText) {
  if (!segments?.length) {
    return [{ text: fallbackText, pause_ms: 0, stress: null }];
  }
  return segments.map((s) => ({
    text: String(s.text || "").trim(),
    pause_ms: Number(s.pause_ms) || 0,
    stress: s.stress || null
  })).filter((s) => s.text);
}

export async function askOpenAI(callId, message, employeeState) {
  const generator = new ResponseGenerator(callId);
  const plan = {
    tone: "friendly",
    maxWords: 15,
    minWords: 3,
    allowSelfCorrection: false,
    allowFillers: false,
    allowHesitation: false,
    language: employeeState.language ?? "English"
  };
  const context = {
    customerName: employeeState.customerName,
    industry: employeeState.industry,
    requirement: employeeState.requirement,
    stage: employeeState.conversationStage,
    intent: employeeState.currentIntent,
    emotion: employeeState.customerEmotion ?? "neutral",
    language: employeeState.language,
    topicsExplained: [],
    recentTranscript: [],
    business: { name: COMPANY, services: [] }
  };
  const result = await generator.generate(message, context, plan);
  return result.fullText;
}

export function clearConversation(callId) {
  ResponseGenerator.clearSession(callId);
}
