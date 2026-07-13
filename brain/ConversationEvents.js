import { EventEmitter } from "events";

class ConversationEvents extends EventEmitter {
    constructor() {
        super();

        this.setMaxListeners(100);
    }

    emitEvent(event, payload = {}) {
        this.emit(event, {
            timestamp: Date.now(),
            ...payload
        });
    }

    onEvent(event, handler) {
        this.on(event, handler);
    }

    onceEvent(event, handler) {
        this.once(event, handler);
    }

    removeEvent(event, handler) {
        this.off(event, handler);
    }
}

export const EVENTS = Object.freeze({

    // Call Lifecycle
    CALL_STARTED: "call.started",
    CALL_CONNECTED: "call.connected",
    CALL_ENDED: "call.ended",

    // Customer
    CUSTOMER_STARTED_SPEAKING: "customer.startedSpeaking",
    CUSTOMER_STOPPED_SPEAKING: "customer.stoppedSpeaking",
    CUSTOMER_TRANSCRIPT: "customer.transcript",

    // AI
    AI_THINKING: "ai.thinking",
    AI_STARTED_SPEAKING: "ai.startedSpeaking",
    AI_STOPPED_SPEAKING: "ai.stoppedSpeaking",
    AI_RESPONSE_READY: "ai.responseReady",

    // Conversation
    STATE_CHANGED: "conversation.stateChanged",
    CONTEXT_UPDATED: "conversation.contextUpdated",
    MEMORY_UPDATED: "conversation.memoryUpdated",
    INTENT_UPDATED: "conversation.intentUpdated",
    EMOTION_UPDATED: "conversation.emotionUpdated",
    REQUIREMENTS_UPDATED: "conversation.requirementsUpdated",

    // Flow
    TURN_STARTED: "turn.started",
    TURN_COMPLETED: "turn.completed",

    // Debug
    ERROR: "conversation.error"
});

export default ConversationEvents;