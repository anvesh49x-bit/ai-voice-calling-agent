import { SpeakingSpeed } from "../types.js";

export function buildVoiceMetadata(speechPlan, segments, customerName) {
  const speedMap = {
    [SpeakingSpeed.SLOW]: "slow",
    [SpeakingSpeed.NATURAL]: "natural",
    [SpeakingSpeed.MEDIUM_FAST]: "medium_fast",
    [SpeakingSpeed.FAST]: "fast"
  };

  const pauses = [];
  let charOffset = 0;

  for (const segment of segments) {
    charOffset += segment.text.length;
    pauses.push({
      after_char: charOffset,
      duration_ms: segment.pause_ms ?? 150,
      type: segment.text.endsWith("...") ? "breath" : "sentence"
    });
  }

  return {
    emotion: speechPlan.agentEmotion,
    energy: speechPlan.energyLevel,
    empathy: speechPlan.empathyLevel,
    speed: speedMap[speechPlan.speakingSpeed] ?? "natural",
    pitch: "natural",
    tone: speechPlan.tone,
    emphasis: customerName && speechPlan.friendliness > 0.6 ? customerName : null,
    pauses,
    breathing_points: pauses.filter((p) => p.type === "breath").map((p) => p.after_char),
    sentence_stress: segments.filter((s) => s.stress).map((s) => s.stress),
    cartesia: {
      // Cartesia Sonic uses transcript punctuation for prosody; speed hints via pacing
      language: speechPlan.language === "Telugu" ? "te" : "en"
    }
  };
}
