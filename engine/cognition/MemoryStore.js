import { company } from "../../brain/knowledgeBase.js";
import { ConversationStage, CustomerEmotion } from "../types.js";
import { classifyIntent, decideAction } from "../perception/IntentClassifier.js";
import { detectEmotion } from "../perception/EmotionDetector.js";

function createInitialState() {
  return {
    greetingDone: false,
    customerName: null,
    language: "unknown",
    currentIntent: null,
    previousIntent: null,
    conversationStage: ConversationStage.GREETING,
    customerEmotion: CustomerEmotion.NEUTRAL,
    emotionConfidence: 0.4,
    askedAboutCompany: false,
    askedPricing: false,
    askedServices: false,
    requestedDemo: false,
    industry: null,
    requirement: null,
    businessOwner: false,
    timeline: null,
    budget: null,
    leadScore: 0,
    topicsExplained: [],
    questionsAsked: [],
    acknowledgementsUsed: [],
    lastAgentPhrases: [],
    interruptedContext: null,
    partialSpokenText: null
  };
}

function extractProfile(state, message) {
  const text = message.toLowerCase();

  state.language = /[అ-హ]/.test(message) ? "Telugu" : state.language === "Telugu" ? "Telugu" : "English";

  const namePatterns = [
    /my name is (.+)/i,
    /this is (.+)/i,
    /i am (.+)/i,
    /i'm (.+)/i,
    /call me (.+)/i
  ];

  for (const pattern of namePatterns) {
    const match = message.match(pattern);
    if (match) {
      state.customerName = match[1].trim().replace(/[.,!?]+$/, "");
      break;
    }
  }

  if (text.includes("hospital") || text.includes("clinic")) {
    state.industry = "Healthcare";
    state.businessOwner = true;
    state.leadScore += 30;
  }

  if (text.includes("restaurant") || text.includes("hotel")) {
    state.industry = "Restaurant";
    state.businessOwner = true;
    state.leadScore += 30;
  }

  if (text.includes("website")) {
    state.requirement = "Website";
    state.leadScore += 20;
  }

  if (text.includes("tomorrow") || text.includes("next week") || text.includes("asap")) {
    state.timeline = message.match(/\b(tomorrow|next week|asap|this week)\b/i)?.[0] ?? state.timeline;
  }

  if (text.includes("budget") || text.match(/\b\d+\s*(k|lakh|rupees?)\b/i)) {
    state.budget = message;
  }
}

function updateStage(state, intent) {
  switch (intent) {
    case "GREETING":
      state.greetingDone = true;
      state.conversationStage = ConversationStage.INTRODUCTION;
      break;
    case "IDENTITY":
      state.conversationStage = ConversationStage.INTRODUCTION;
      break;
    case "COMPANY_INFO":
      state.askedAboutCompany = true;
      state.conversationStage = ConversationStage.DISCOVERY;
      break;
    case "SERVICE_INQUIRY":
      state.askedServices = true;
      state.conversationStage = ConversationStage.DISCOVERY;
      state.leadScore += 10;
      break;
    case "PRICING":
      state.askedPricing = true;
      state.conversationStage = ConversationStage.INFORMATION_GATHERING;
      state.leadScore += 25;
      break;
    case "DEMO_REQUEST":
      state.requestedDemo = true;
      state.conversationStage = ConversationStage.CONFIRMATION;
      state.leadScore += 50;
      break;
    case "CLOSING":
      state.conversationStage = ConversationStage.CLOSING;
      break;
    case "CLARIFICATION":
      state.conversationStage = ConversationStage.CLARIFICATION;
      break;
    case "COMPLAINT":
      state.conversationStage = ConversationStage.PROBLEM_SOLVING;
      break;
    default:
      if (state.conversationStage === ConversationStage.GREETING) {
        state.conversationStage = ConversationStage.DISCOVERY;
      }
  }
}

const sessions = new Map();
const transcripts = new Map();

export class MemoryStore {
  constructor(callId) {
    this.callId = callId;
    if (!sessions.has(callId)) {
      sessions.set(callId, createInitialState());
      transcripts.set(callId, []);
    }
  }

  get state() {
    return sessions.get(this.callId);
  }

  get transcript() {
    return transcripts.get(this.callId) || [];
  }

  get businessContext() {
    return company;
  }

  processUserTurn(message) {
    const state = this.state;
    const intent = classifyIntent(message);
    const emotion = detectEmotion(message, state.customerEmotion);

    state.previousIntent = state.currentIntent;
    state.currentIntent = intent;
    state.customerEmotion = emotion.primary;
    state.emotionConfidence = emotion.confidence;

    extractProfile(state, message);
    updateStage(state, intent);

    const action = decideAction(intent, state);

    this.addTurn("Customer", message);

    return {
      ...state,
      intent,
      action,
      emotion,
      complexity: estimateComplexity(message, state)
    };
  }

  addTurn(speaker, message) {
    transcripts.get(this.callId).push({ speaker, message, at: Date.now() });
  }

  recordAgentSpeech(text, metadata = {}) {
    this.addTurn("Priya", text);
    const state = this.state;
    state.lastAgentPhrases = [...state.lastAgentPhrases, text].slice(-8);
    if (metadata.acknowledgement) {
      state.acknowledgementsUsed.push(metadata.acknowledgement);
    }
  }

  setInterruptedContext(partialText, userInterruption) {
    this.state.partialSpokenText = partialText;
    this.state.interruptedContext = userInterruption;
  }

  clearInterruptContext() {
    this.state.partialSpokenText = null;
    this.state.interruptedContext = null;
  }

  hasExplained(topic) {
    return this.state.topicsExplained.includes(topic);
  }

  markExplained(topic) {
    if (!this.hasExplained(topic)) {
      this.state.topicsExplained.push(topic);
    }
  }

  alreadyAsked(questionKey) {
    return this.state.questionsAsked.includes(questionKey);
  }

  markAsked(questionKey) {
    if (!this.alreadyAsked(questionKey)) {
      this.state.questionsAsked.push(questionKey);
    }
  }

  getContextForGeneration() {
    const s = this.state;
    return {
      customerName: s.customerName,
      industry: s.industry,
      requirement: s.requirement,
      timeline: s.timeline,
      budget: s.budget,
      language: s.language,
      stage: s.conversationStage,
      intent: s.currentIntent,
      emotion: s.customerEmotion,
      leadScore: s.leadScore,
      topicsExplained: s.topicsExplained,
      interruptedContext: s.interruptedContext,
      partialSpokenText: s.partialSpokenText,
      recentTranscript: this.transcript.slice(-6),
      business: this.businessContext
    };
  }

  static endSession(callId) {
    const state = sessions.get(callId);
    const transcript = transcripts.get(callId) || [];
    sessions.delete(callId);
    transcripts.delete(callId);
    return { state, transcript };
  }
}

function estimateComplexity(message, state) {
  let score = 0.3;
  if (message.split(/\s+/).length > 12) score += 0.2;
  if (/\?/.test(message)) score += 0.15;
  if (state.currentIntent === "PRICING" || state.currentIntent === "SERVICE_INQUIRY") score += 0.2;
  if (state.customerEmotion === CustomerEmotion.CONFUSED) score += 0.15;
  return Math.min(1, score);
}
