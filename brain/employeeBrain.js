import { MemoryStore } from "../engine/cognition/MemoryStore.js";
import { classifyIntent, decideAction } from "../engine/perception/IntentClassifier.js";
import { detectIntent } from "./intentEngine.js";

/**
 * Legacy brain facade — delegates to the conversation engine memory layer.
 * Preserved for backward compatibility with test routes and imports.
 */
export function processConversation(callId, message) {
  const store = new MemoryStore(callId);
  const result = store.processUserTurn(message);
  return {
    ...result,
    intent: result.intent ?? classifyIntent(message),
    action: result.action ?? decideAction(result.currentIntent, result)
  };
}

export function endConversation(callId) {
  MemoryStore.endSession(callId);
}

/** @deprecated use detectIntent from intentEngine or classifyIntent from engine */
export { detectIntent };
