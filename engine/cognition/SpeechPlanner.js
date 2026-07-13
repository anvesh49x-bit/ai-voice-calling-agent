import { AgentTone, ConversationStage, CustomerEmotion, SpeakingSpeed } from "../types.js";

const STAGE_TONE = {
  [ConversationStage.GREETING]: AgentTone.PROFESSIONAL,
  [ConversationStage.INTRODUCTION]: AgentTone.FRIENDLY,
  [ConversationStage.DISCOVERY]: AgentTone.FRIENDLY,
  [ConversationStage.CLARIFICATION]: AgentTone.PATIENT,
  [ConversationStage.PROBLEM_SOLVING]: AgentTone.EMPATHETIC,
  [ConversationStage.INFORMATION_GATHERING]: AgentTone.PROFESSIONAL,
  [ConversationStage.RECOMMENDATION]: AgentTone.PROFESSIONAL,
  [ConversationStage.CONFIRMATION]: AgentTone.PROFESSIONAL,
  [ConversationStage.CLOSING]: AgentTone.FRIENDLY
};

const EMOTION_TONE_OVERRIDE = {
  [CustomerEmotion.ANGRY]: AgentTone.CALM,
  [CustomerEmotion.CONFUSED]: AgentTone.PATIENT,
  [CustomerEmotion.EXCITED]: AgentTone.ENERGETIC,
  [CustomerEmotion.NERVOUS]: AgentTone.EMPATHETIC,
  [CustomerEmotion.BUSY]: AgentTone.CONCISE,
  [CustomerEmotion.IMPATIENT]: AgentTone.CONCISE,
  [CustomerEmotion.TIRED]: AgentTone.CALM
};

/**
 * Speech planner runs BEFORE text generation.
 * Output drives response constraints, thinking delay, and TTS metadata.
 */
export function planSpeech(context) {
  const {
    stage,
    intent,
    action,
    emotion,
    complexity,
    leadScore,
    language,
    interruptedContext,
    partialSpokenText,
    recentAcknowledgements = []
  } = context;

  const customerEmotion = emotion?.primary ?? CustomerEmotion.NEUTRAL;
  const baseTone = STAGE_TONE[stage] ?? AgentTone.PROFESSIONAL;
  const tone = EMOTION_TONE_OVERRIDE[customerEmotion] ?? baseTone;

  const empathyLevel = scoreEmpathy(customerEmotion);
  const energyLevel = scoreEnergy(customerEmotion, stage);
  const urgency = scoreUrgency(customerEmotion, intent);
  const speakingSpeed = pickSpeed(customerEmotion, urgency);
  const sentenceLength = pickSentenceLength(customerEmotion, complexity, stage);
  const confidence = pickConfidence(stage, customerEmotion);
  const friendliness = pickFriendliness(stage, customerEmotion);

  const allowFillers = shouldAllowFillers(customerEmotion, complexity, recentAcknowledgements);
  const allowHesitation = shouldAllowHesitation(complexity, customerEmotion);
  const allowSelfCorrection = shouldAllowSelfCorrection(intent, complexity);
  const maxWords = pickMaxWords(customerEmotion, stage, intent);
  const minWords = pickMinWords(stage);

  return {
    tone,
    intention: action,
    agentEmotion: mapAgentEmotion(tone, customerEmotion),
    speakingSpeed,
    sentenceLength,
    confidence,
    friendliness,
    energyLevel,
    empathyLevel,
    urgency,
    allowFillers,
    allowHesitation,
    allowSelfCorrection,
    maxWords,
    minWords,
    language: language ?? "English",
    resumeFromPartial: Boolean(interruptedContext && partialSpokenText),
    partialSpokenText: partialSpokenText ?? null,
    compressResponse: customerEmotion === CustomerEmotion.BUSY || customerEmotion === CustomerEmotion.IMPATIENT,
    expandResponse: customerEmotion === CustomerEmotion.CURIOUS || customerEmotion === CustomerEmotion.CONFUSED,
    deEscalate: customerEmotion === CustomerEmotion.ANGRY || intent === "COMPLAINT",
    qualifyLead: leadScore >= 40 && leadScore < 70 && stage !== ConversationStage.CLOSING,
    closeConversation: intent === "CLOSING" || action === "END_CONVERSATION"
  };
}

function scoreEmpathy(emotion) {
  const map = {
    [CustomerEmotion.ANGRY]: 0.95,
    [CustomerEmotion.NERVOUS]: 0.9,
    [CustomerEmotion.CONFUSED]: 0.85,
    [CustomerEmotion.TIRED]: 0.75,
    [CustomerEmotion.NEUTRAL]: 0.5,
    [CustomerEmotion.HAPPY]: 0.55,
    [CustomerEmotion.EXCITED]: 0.45,
    [CustomerEmotion.BUSY]: 0.4,
    [CustomerEmotion.IMPATIENT]: 0.35,
    [CustomerEmotion.CURIOUS]: 0.5
  };
  return map[emotion] ?? 0.5;
}

function scoreEnergy(emotion, stage) {
  if (emotion === CustomerEmotion.EXCITED) return 0.85;
  if (emotion === CustomerEmotion.ANGRY || emotion === CustomerEmotion.TIRED) return 0.25;
  if (emotion === CustomerEmotion.BUSY || emotion === CustomerEmotion.IMPATIENT) return 0.35;
  if (stage === ConversationStage.GREETING) return 0.6;
  if (stage === ConversationStage.CLOSING) return 0.45;
  return 0.55;
}

function scoreUrgency(emotion, intent) {
  if (emotion === CustomerEmotion.IMPATIENT || emotion === CustomerEmotion.BUSY) return 0.9;
  if (intent === "COMPLAINT") return 0.7;
  if (intent === "CLOSING") return 0.6;
  return 0.35;
}

function pickSpeed(emotion, urgency) {
  if (emotion === CustomerEmotion.ANGRY) return SpeakingSpeed.SLOW;
  if (emotion === CustomerEmotion.CONFUSED || emotion === CustomerEmotion.NERVOUS) return SpeakingSpeed.SLOW;
  if (urgency >= 0.8) return SpeakingSpeed.MEDIUM_FAST;
  if (emotion === CustomerEmotion.EXCITED) return SpeakingSpeed.NATURAL;
  return SpeakingSpeed.NATURAL;
}

function pickSentenceLength(emotion, complexity, stage) {
  if (emotion === CustomerEmotion.BUSY || emotion === CustomerEmotion.IMPATIENT) return "short";
  if (emotion === CustomerEmotion.CONFUSED || complexity > 0.6) return "medium";
  if (stage === ConversationStage.CLARIFICATION) return "medium";
  const roll = Math.random();
  if (roll < 0.35) return "short";
  if (roll < 0.75) return "medium";
  return "long";
}

function pickConfidence(stage, emotion) {
  if (emotion === CustomerEmotion.ANGRY || emotion === CustomerEmotion.NERVOUS) return 0.6;
  if (stage === ConversationStage.PROBLEM_SOLVING) return 0.65;
  return 0.8;
}

function pickFriendliness(stage, emotion) {
  if (emotion === CustomerEmotion.ANGRY) return 0.55;
  if (stage === ConversationStage.GREETING || stage === ConversationStage.INTRODUCTION) return 0.85;
  return 0.7;
}

function shouldAllowFillers(emotion, complexity, recentAcks) {
  if (recentAcks.length >= 2) return false;
  if (emotion === CustomerEmotion.BUSY || emotion === CustomerEmotion.IMPATIENT) return false;
  if (complexity > 0.55) return Math.random() < 0.35;
  return Math.random() < 0.12;
}

function shouldAllowHesitation(complexity, emotion) {
  if (emotion === CustomerEmotion.BUSY) return false;
  if (complexity > 0.5) return Math.random() < 0.4;
  return Math.random() < 0.08;
}

function shouldAllowSelfCorrection(intent, complexity) {
  if (intent === "DEMO_REQUEST" || intent === "PRICING") return Math.random() < 0.15;
  return complexity > 0.65 && Math.random() < 0.2;
}

function pickMaxWords(emotion, stage, intent) {
  if (emotion === CustomerEmotion.BUSY || emotion === CustomerEmotion.IMPATIENT) return 12;
  if (emotion === CustomerEmotion.CONFUSED) return 28;
  if (intent === "PRICING" || intent === "SERVICE_INQUIRY") return 24;
  if (stage === ConversationStage.GREETING) return 18;
  return 20;
}

function pickMinWords(stage) {
  if (stage === ConversationStage.GREETING) return 4;
  return 3;
}

function mapAgentEmotion(tone, customerEmotion) {
  if (customerEmotion === CustomerEmotion.ANGRY) return "calm";
  if (tone === AgentTone.ENERGETIC) return "warm";
  if (tone === AgentTone.EMPATHETIC) return "sympathetic";
  if (tone === AgentTone.CONCISE) return "neutral";
  return "friendly";
}
